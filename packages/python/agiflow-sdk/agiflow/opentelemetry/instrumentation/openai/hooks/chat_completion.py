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

from typing import Any, Dict

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
    def __init__(
        self,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        self.add_input_attributes()
        span_attributes: Dict[str, Any] = {
          SpanAttributes.LLM_API: APIS["CHAT_COMPLETION"]["ENDPOINT"],
          SpanAttributes.LLM_TYPE: LLMTypes.CHAT,
        }
        if should_send_prompts():
            # handle tool calls in the kwargs
            llm_prompts = []
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
                    llm_prompts.append(tool_calls)
                else:
                    llm_prompts.append(item)

            span_attributes[SpanAttributes.LLM_PROMPTS] = serialise_to_json(llm_prompts)

        self.set_span_attributes_from_pydantic(
          span_attributes,
          LLMSpanAttributesValidator
          )

    def capture_output(self, result):
        self.set_span_attribute(SpanAttributes.LLM_MODEL, result.model)

        if should_send_prompts():
            if hasattr(result, "choices") and result.choices is not None:
                responses = []
                for choice in result.choices:
                    response = extract_content(choice)
                    if response:
                        responses.append(response)

                self.set_span_attribute(SpanAttributes.LLM_RESPONSES, serialise_to_json(responses))
            else:
                responses = []
                self.set_span_attribute(SpanAttributes.LLM_RESPONSES, serialise_to_json(responses))

        if (
            hasattr(result, "system_fingerprint")
            and result.system_fingerprint is not None
        ):
            self.set_span_attribute(
                SpanAttributes.LLM_SYSTEM_FINGERPRINT, result.system_fingerprint
            )

        # Get the usage
        if hasattr(result, "usage"):
            usage = result.usage
            if usage is not None:
                usage_dict = {
                    LLMTokenUsageKeys.PROMPT_TOKENS: usage.prompt_tokens,
                    LLMTokenUsageKeys.COMPLETION_TOKENS: usage.completion_tokens,
                    LLMTokenUsageKeys.TOTAL_TOKENS: usage.total_tokens,
                }
                self.set_span_attribute(SpanAttributes.LLM_TOKEN_COUNTS, serialise_to_json(usage_dict))

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
            self.span.set_attribute(SpanAttributes.LLM_MODEL, chunk.model)

        content = []
        if hasattr(chunk, "choices") and chunk.choices is not None:
            if not function_call and not tool_calls:
                for choice in chunk.choices:
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
        self.span.add_event(Event.STREAM_END)
        self.span.set_attribute(
            SpanAttributes.LLM_TOKEN_COUNTS,
            serialise_to_json(
                {
                    LLMTokenUsageKeys.PROMPT_TOKENS: prompt_tokens,
                    LLMTokenUsageKeys.COMPLETION_TOKENS: self.tokens[
                      LLMTokenUsageKeys.COMPLETION_TOKENS
                      ],
                    LLMTokenUsageKeys.TOTAL_TOKENS: prompt_tokens + self.tokens[
                      LLMTokenUsageKeys.COMPLETION_TOKENS
                      ],
                }
            ),
        )
        self.span.set_attribute(
            SpanAttributes.LLM_RESPONSES,
            serialise_to_json(
                [
                    {
                        LLMResponseKeys.ROLE: "assistant",
                        LLMResponseKeys.CONTENT: "".join(result_content),
                    }
                ]
            ),
        )
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
