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

from agiflow.opentelemetry.convention.constants import Event, LLMPromptKeys, LLMTokenUsageKeys
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.groq import APIS
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from agiflow.opentelemetry.utils import should_send_prompts, calculate_prompt_tokens, estimate_tokens
from opentelemetry.trace import StatusCode
from .base import GroqSpanCapture


class ChatCompletionSpanCapture(GroqSpanCapture):
    prompt_tokens = 0
    completion_tokens = 0
    result_content = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @staticmethod
    def get_span_name(instance):
        return APIS["CHAT_COMPLETION"]["METHOD"]

    def capture_input(self):
        span_attributes = {
            SpanAttributes.LLM_API: APIS["CHAT_COMPLETION"]["ENDPOINT"],
            SpanAttributes.LLM_STREAM: self.fkwargs.get("stream"),
        }

        if should_send_prompts():
            llm_prompts = []
            for item in self.fkwargs.get("messages", []):
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

        tools = []
        if self.fkwargs.get("temperature") is not None:
            span_attributes[SpanAttributes.LLM_TEMPERATURE] = self.fkwargs.get("temperature")
        if self.fkwargs.get("top_p") is not None:
            span_attributes[SpanAttributes.LLM_TOP_P] = self.fkwargs.get("top_p")
        if self.fkwargs.get("user") is not None:
            span_attributes[SpanAttributes.LLM_USER] = self.fkwargs.get("user")
        if self.fkwargs.get("functions") is not None:
            for function in self.fkwargs.get("functions"):
                tools.append(serialise_to_json({"type": "function", "function": function}))
        if self.fkwargs.get("tools") is not None:
            tools.append(serialise_to_json(self.fkwargs.get("tools")))
        if len(tools) > 0:
            span_attributes[SpanAttributes.LLM_TOOLS] = serialise_to_json(tools)

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        self.set_span_attribute(SpanAttributes.LLM_MODEL, result.model)
        if should_send_prompts():
            if hasattr(result, "choices") and result.choices is not None:
                responses = [
                    {
                        LLMPromptKeys.ROLE: (
                            choice.message.role
                            if choice.message and choice.message.role
                            else "assistant"
                        ),
                        LLMPromptKeys.CONTENT: extract_content(choice),
                        **(
                            {
                                "content_filter_results": choice[
                                    "content_filter_results"
                                ]
                            }
                            if "content_filter_results" in choice
                            else {}
                        ),
                    }
                    for choice in result.choices
                ]
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
        if hasattr(result, "usage") and result.usage is not None:
            usage = result.usage
            if usage is not None:
                usage_dict = {
                    LLMTokenUsageKeys.PROMPT_TOKENS: result.usage.prompt_tokens,
                    LLMTokenUsageKeys.COMPLETION_TOKENS: usage.completion_tokens,
                    LLMTokenUsageKeys.TOTAL_TOKENS: usage.total_tokens,
                }
                self.set_span_attribute(SpanAttributes.LLM_TOKEN_COUNTS, serialise_to_json(usage_dict))

    def compute_tokens(self):
        for message in self.fkwargs.get("messages", {}):
            self.prompt_tokens += calculate_prompt_tokens(
                serialise_to_json(message), self.fkwargs.get("model")
            )

        # iterate over kwargs.get("functions") and calculate the prompt tokens
        if self.fkwargs.get("functions") is not None:
            for function in self.fkwargs.get("functions"):
                self.prompt_tokens += calculate_prompt_tokens(
                    serialise_to_json(function), self.fkwargs.get("model")
                )

    def handle_stream_start(self, chunk):
        if hasattr(chunk, "model") and chunk.model is not None:
            self.set_span_attribute(SpanAttributes.LLM_MODEL, chunk.model)

        function_call = self.fkwargs.get("functions") is not None,
        tool_calls = self.fkwargs.get("tools")

        if hasattr(chunk, "choices") and chunk.choices is not None:
            if not function_call and not tool_calls:
                for choice in chunk.choices:
                    if choice.delta and choice.delta.content is not None:
                        token_counts = estimate_tokens(choice.delta.content)
                        self.completion_tokens += token_counts
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
                        self.completion_tokens += token_counts
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
                                self.completion_tokens += token_counts
                                content = content + [
                                    tool_call.function.arguments
                                ]
                            else:
                                content = content + []
        else:
            content = []
        self.span.add_event(
            Event.STREAM_OUTPUT.value,
            {
                "response": (
                    "".join(content)
                    if len(content) > 0 and content[0] is not None
                    else ""
                )
            },
        )
        self.result_content.append(content[0] if len(content) > 0 else "")

    def handle_stream_end(self):
        self.span.add_event(Event.STREAM_END.value)
        self.set_span_attribute(
            SpanAttributes.LLM_TOKEN_COUNTS,
            serialise_to_json(
                {
                    LLMTokenUsageKeys.PROMPT_TOKENS: self.prompt_tokens,
                    LLMTokenUsageKeys.COMPLETION_TOKENS: self.completion_tokens,
                    LLMTokenUsageKeys.COMPLETION_TOKENS: self.prompt_tokens + self.completion_tokens,
                }
            ),
        )
        self.set_span_attribute(
            SpanAttributes.LLM_RESPONSES,
            serialise_to_json(
                [
                    {
                        "role": "assistant",
                        "content": "".join(self.result_content),
                    }
                ]
            ),
        )
        self.span.set_status(StatusCode.OK)
        self.span.end()

    def capture_stream_output(self, result):
        self.compute_tokens()
        self.span.add_event(Event.STREAM_START.value)
        try:
            for chunk in result:
                self.handle_stream_start(chunk)
                yield chunk
        finally:
            self.handle_stream_end()

    async def acapture_stream_output(self, result):
        self.compute_tokens()
        self.span.add_event(Event.STREAM_START.value)
        try:
            async for chunk in result:
                self.handle_stream_start(chunk)
                yield chunk
        finally:
            self.handle_stream_end()


def extract_content(choice):
    # Check if choice.message exists and has a content attribute
    if (
        hasattr(choice, "message")
        and hasattr(choice.message, "content")
        and choice.message.content is not None
    ):
        return choice.message.content

    # Check if choice.message has tool_calls and extract information accordingly
    elif (
        hasattr(choice, "message")
        and hasattr(choice.message, "tool_calls")
        and choice.message.tool_calls is not None
    ):
        result = [
            {
                "id": tool_call.id,
                "type": tool_call.type,
                "function": {
                    "name": tool_call.function.name,
                    "arguments": tool_call.function.arguments,
                },
            }
            for tool_call in choice.message.tool_calls
        ]
        return result

    # Check if choice.message has a function_call and extract information accordingly
    elif (
        hasattr(choice, "message")
        and hasattr(choice.message, "function_call")
        and choice.message.function_call is not None
    ):
        return {
            "name": choice.message.function_call.name,
            "arguments": choice.message.function_call.arguments,
        }

    # Return an empty string if none of the above conditions are met
    else:
        return ""
