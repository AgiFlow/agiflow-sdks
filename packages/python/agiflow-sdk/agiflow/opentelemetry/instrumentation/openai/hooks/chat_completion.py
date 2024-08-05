"""
Copyright (c) 2024 AGIFlow

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

from typing import Any, Dict, List

from agiflow.opentelemetry.instrumentation.constants.openai import APIS
from opentelemetry.trace.status import StatusCode

from agiflow.opentelemetry.utils import calculate_prompt_tokens, estimate_tokens, should_send_prompts
from agiflow.opentelemetry.convention import (
  LLMResponseKeys,
  LLMTokenUsageKeys,
  LLMTypes,
  LLMSpanAttributesValidator,
  Event,
  SpanAttributes,
)
from agiflow.utils import serialise_to_json
from .base_llm import OpenAILLMSpanCapture
from .utils import extract_content


class ChatCompletionSpanCapture(OpenAILLMSpanCapture):
    finish_reasons: List[str] = []

    def __init__(
        self,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)

    @staticmethod
    def get_span_name(instance, *args, **kwargs):
        """
        Override this method if span name is different
        """
        if kwargs.get('model'):
            return f"{LLMTypes.CHAT.value.lower()} {kwargs.get('model')}"
        if instance is None:
            return ""
        if hasattr(instance, '__class__'):
            if hasattr(instance, '__name__'):
                return f"{instance.__class__.__name__}.${instance.__name__}"
            else:
                return f"{instance.__class__.__name__}"
        elif hasattr(instance, '__name__'):
            return f"{instance.__name__}"
        else:
            return ""

    def capture_input(self):
        self.add_input_attributes()
        span_attributes: Dict[str, Any] = {
          SpanAttributes.LLM_API: APIS["CHAT_COMPLETION"]["ENDPOINT"],
          SpanAttributes.GEN_AI_OPERATION_NAME: LLMTypes.CHAT,
        }

        if self.fkwargs.get('model'):
            span_attributes[SpanAttributes.GEN_AI_REQUEST_MODEL] = self.fkwargs.get('model')

        if should_send_prompts():
            # handle tool calls in the kwargs
            prompts = []
            for item in (self.messages or []):
                if hasattr(item, "tool_calls") and item.tool_calls is not None:
                    tool_calls = []
                    for tool_call in item.tool_calls:
                        tool_call_dict = {
                            "id": tool_call.id if hasattr(tool_call, "id") else "",
                            "type": tool_call.type if hasattr(tool_call, "type") else "",
                        }
                        if hasattr(tool_call, "function"):
                            tool_call_dict["function"] = {
                                "name": (
                                    tool_call.function.name
                                    if hasattr(tool_call.function, "name")
                                    else ""
                                ),
                                "arguments": (
                                    tool_call.function.arguments
                                    if hasattr(tool_call.function, "arguments")
                                    else ""
                                ),
                            }
                        tool_calls.append(tool_call_dict)
                    prompts.append(tool_calls)
                else:
                    prompts.append(item)

            self.set_prompt_span_event(prompts)

        self.set_span_attributes_from_pydantic(
          span_attributes,
          LLMSpanAttributesValidator
          )

    def capture_output(self, result):
        self.set_span_attribute(SpanAttributes.GEN_AI_RESPONSE_MODEL, result.model)

        if should_send_prompts():
            if hasattr(result, "choices") and result.choices is not None:
                responses = []
                finish_reasons = []
                for choice in result.choices:
                    response = extract_content(choice)
                    if hasattr(choice, 'finish_reason') and choice.finish_reason is not None:
                        finish_reasons.append(choice.finish_reason)
                    if response:
                        responses.append(response)

                self.set_completion_span_event(responses)
                self.set_span_attribute(SpanAttributes.GEN_AI_RESPONSE_FINISH_REASONS, finish_reasons)
            else:
                responses = []
                self.set_completion_span_event(responses)

        if (
            hasattr(result, "system_fingerprint")
            and result.system_fingerprint is not None
        ):
            if result.system_fingerprint == 'fp_ollama':
                self.set_span_attribute(
                    SpanAttributes.GEN_AI_SYSTEM, 'ollama'
                )

            self.set_span_attribute(
                SpanAttributes.LLM_SYSTEM_FINGERPRINT, result.system_fingerprint
            )

        # Get the usage
        if hasattr(result, "usage"):
            usage = result.usage
            if usage is not None:
                self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_INPUT_TOKENS, usage.prompt_tokens)
                self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_OUTPUT_TOKENS, usage.completion_tokens)

    def get_prompt_tokens(self, result):
        # iterate over kwargs.get("messages", {}) and calculate the prompt tokens
        prompt_tokens = 0
        for message in (self.messages or {}):
            prompt_tokens += calculate_prompt_tokens(
                serialise_to_json(message), self.model
            )

        # iterate over kwargs.get("functions") and calculate the prompt tokens
        if self.functions is not None:
            for function in self.functions:
                prompt_tokens += calculate_prompt_tokens(
                    serialise_to_json(function), self.model
                )

        return prompt_tokens

    def capture_chunk(self, result_content, chunk):
        function_call = self.fkwargs.get('functions')
        tool_calls = self.fkwargs.get('tools')
        if hasattr(chunk, "model") and chunk.model is not None:
            self.span.set_attribute(SpanAttributes.GEN_AI_RESPONSE_MODEL, chunk.model)

        content = []
        if hasattr(chunk, "choices") and chunk.choices is not None:
            if not function_call and not tool_calls:
                for choice in chunk.choices:
                    if hasattr(choice, 'finish_reason') and choice.finish_reason is not None:
                        self.finish_reasons.append(choice.finish_reason)
                    if choice.delta and choice.delta.content is not None:
                        token_counts = estimate_tokens(choice.delta.content)
                        completion_tokens = self.tokens.get(LLMTokenUsageKeys.COMPLETION_TOKENS, 0)
                        self.tokens[LLMTokenUsageKeys.COMPLETION_TOKENS] = completion_tokens + token_counts
                        content = [choice.delta.content]
            elif function_call:
                for choice in chunk.choices:
                    if (
                        choice.delta
                        and choice.delta.function_call is not None
                        and choice.delta.function_call.arguments is not None
                    ):
                        token_counts = estimate_tokens(
                            choice.delta.function_call.arguments
                        )
                        completion_tokens = self.tokens.get(LLMTokenUsageKeys.COMPLETION_TOKENS, 0)
                        self.tokens[LLMTokenUsageKeys.COMPLETION_TOKENS] = completion_tokens + token_counts
                        content = [choice.delta.function_call.arguments]
            elif tool_calls:
                for choice in chunk.choices:
                    tool_call = ""
                    if choice.delta and choice.delta.tool_calls is not None:
                        toolcalls = choice.delta.tool_calls
                        content = []
                        for tool_call in toolcalls:
                            if (
                                tool_call
                                and tool_call.function is not None
                                and tool_call.function.arguments is not None
                            ):
                                token_counts = estimate_tokens(
                                    tool_call.function.arguments
                                )
                                completion_tokens = self.tokens.get(LLMTokenUsageKeys.COMPLETION_TOKENS, 0)
                                self.tokens[LLMTokenUsageKeys.COMPLETION_TOKENS] = completion_tokens + token_counts
                                content = content + [
                                    tool_call.function.arguments
                                ]
                            else:
                                content = content + []

        self.span.add_event(
            Event.STREAM_OUTPUT,
            {
                "response": (
                    "".join(content)
                    if len(content) > 0 and content[0] is not None
                    else ""
                )
            },
        )

        result_content.append(content[0] if len(content) > 0 else "")

    def capture_stream_end(self, result, result_content):
        prompt_tokens = self.get_prompt_tokens(result)
        # Finalize span after processing all chunks
        self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_INPUT_TOKENS, prompt_tokens)
        self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_OUTPUT_TOKENS, self.tokens[
                      LLMTokenUsageKeys.COMPLETION_TOKENS
                      ])
        self.set_completion_span_event(
            [
                {
                    LLMResponseKeys.ROLE: "assistant",
                    LLMResponseKeys.CONTENT: "".join(result_content),
                }
            ]
        )
        self.set_span_attribute(SpanAttributes.GEN_AI_RESPONSE_FINISH_REASONS, self.finish_reasons)
        self.span.add_event(Event.STREAM_END)
        self.span.set_status(StatusCode.OK)
        self.span.end()

    def capture_stream_output(self, result):
        """Process and yield streaming response chunks synchronously."""
        result_content = []
        self.span.add_event(Event.STREAM_START)
        try:
            for chunk in result:
                self.capture_chunk(result_content, chunk)
                yield chunk
        finally:
            self.capture_stream_end(result, result_content)

    async def acapture_stream_output(self, result):
        """Process and yield streaming response chunks asynchronously."""
        result_content = []
        self.span.add_event(Event.STREAM_START)
        try:
            async for chunk in result:
                self.capture_chunk(result_content, chunk)
                yield chunk
        finally:
            self.capture_stream_end(result, result_content)
