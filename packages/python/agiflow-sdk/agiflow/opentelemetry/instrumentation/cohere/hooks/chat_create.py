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

from agiflow.opentelemetry.convention.constants import LLMResponseKeys
from agiflow.opentelemetry.instrumentation.constants.cohere import APIS
from agiflow.opentelemetry.utils.llm import should_send_prompts
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from .base_chat import CohereChatSpanCapture


class ChatCreateSpanCapture(CohereChatSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @staticmethod
    def get_span_name(instance, *args, **kwargs):
        return APIS["CHAT_CREATE"]["METHOD"]

    def capture_input(self):
        super().capture_input()
        self.set_span_attribute(SpanAttributes.LLM_STREAM, False)

    def capture_output(self, result):
        super().capture_output(result)
        if should_send_prompts():
            if (
                hasattr(result, "text")
                and result.text is not None
                and result.text != ""
            ):
                if (
                    hasattr(result, "chat_history")
                    and result.chat_history is not None
                ):
                    responses = [
                        {
                            LLMResponseKeys.ROLE: (
                                item.role
                                if hasattr(item, "role") and item.role is not None
                                else "USER"
                            ),
                            LLMResponseKeys.CONTENT: (
                                item.message
                                if hasattr(item, "message")
                                and item.message is not None
                                else ""
                            ),
                        }
                        for item in result.chat_history
                    ]
                    self.set_span_attribute(SpanAttributes.GEN_AI_COMPLETION, serialise_to_json(responses))
                else:
                    responses = [{"role": "CHATBOT", "content": result.text}]
                    self.set_span_attribute(SpanAttributes.GEN_AI_COMPLETION, serialise_to_json(responses))
            elif hasattr(result, "tool_calls") and result.tool_calls is not None:
                tool_calls = []
                for tool_call in result.tool_calls:
                    tool_calls.append(tool_call.json())
                self.set_span_attribute(SpanAttributes.LLM_TOOL_CALLS, serialise_to_json(tool_calls))
                self.set_span_attribute(SpanAttributes.GEN_AI_COMPLETION, serialise_to_json([]))
            else:
                responses = []
                self.set_span_attribute(SpanAttributes.GEN_AI_COMPLETION, serialise_to_json(responses))

        # Get the usage
        if hasattr(result, "meta") and result.meta is not None:
            if (
                hasattr(result.meta, "billed_units")
                and result.meta.billed_units is not None
            ):
                usage = result.meta.billed_units
                if usage is not None:
                    self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_INPUT_TOKENS, usage.input_tokens)
                    self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_OUTPUT_TOKENS, usage.output_tokens)

    def capture_stream_output(self, result):
        super().capture_output(result)
