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

from agiflow.opentelemetry.convention.constants import Event, LLMResponseKeys
from agiflow.opentelemetry.instrumentation.constants.cohere import APIS
from agiflow.opentelemetry.utils.llm import should_send_prompts
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from opentelemetry.trace import StatusCode
from .base_chat import CohereChatSpanCapture


class ChatStreamSpanCapture(CohereChatSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @staticmethod
    def get_span_name(instance, *args, **kwargs):
        return APIS["CHAT_STREAM"]["METHOD"]

    def is_streaming(self):
        return True

    def capture_input(self):
        super().capture_input()
        self.set_span_attribute(SpanAttributes.LLM_STREAM, True)

    def capture_stream_output(self, result):
        self.span.add_event(Event.STREAM_START.value)
        try:
            for event in result:
                if should_send_prompts():
                    if hasattr(event, "text") and event.text is not None:
                        content = event.text
                    else:
                        content = ""
                    self.span.add_event(
                        Event.STREAM_OUTPUT.value, {"response": "".join(content)}
                    )

                    if (
                        hasattr(event, "finish_reason")
                        and event.finish_reason == "COMPLETE"
                    ):
                        response = event.response

                        if (hasattr(response, "generation_id")) and (
                            response.generation_id is not None

                        ):
                            self.set_span_attribute(
                                SpanAttributes.LLM_GENERATION_ID, response.generation_id
                            )
                        if (hasattr(response, "response_id")) and (
                            response.response_id is not None
                        ):
                            self.set_span_attribute(SpanAttributes.GEN_AI_RESPONSE_ID, response.response_id)
                        if (hasattr(response, "is_search_required")) and (
                            response.is_search_required is not None
                        ):
                            self.set_span_attribute(
                                SpanAttributes.LLM_IS_SEARCH_REQUIRED, response.is_search_required
                            )

                        # Set the response attributes
                        if hasattr(response, "text") and response.text is not None:
                            if (
                                hasattr(response, "chat_history")
                                and response.chat_history is not None
                            ):
                                responses = [
                                    {
                                        LLMResponseKeys.ROLE: (
                                            item.role
                                            if hasattr(item, "role")
                                            and item.role is not None
                                            else "USER"
                                        ),
                                        LLMResponseKeys.CONTENT: (
                                            item.message
                                            if hasattr(item, "message")
                                            and item.message is not None
                                            else ""
                                        ),
                                    }
                                    for item in response.chat_history
                                ]
                                self.set_span_attribute(
                                    SpanAttributes.GEN_AI_COMPLETION, serialise_to_json(responses)
                                )
                            else:
                                responses = [
                                    {"role": "CHATBOT", "content": response.text}
                                ]
                                self.set_span_attribute(
                                    SpanAttributes.GEN_AI_COMPLETION, serialise_to_json(responses)
                                )

                        # Get the usage
                        if hasattr(response, "meta") and response.meta is not None:
                            if (
                                hasattr(response.meta, "billed_units")
                                and response.meta.billed_units is not None
                            ):
                                usage = response.meta.billed_units
                                if usage is not None:
                                    self.set_span_attribute(
                                        SpanAttributes.GEN_AI_USAGE_INPUT_TOKENS,
                                        usage.input_tokens
                                        )
                                    self.set_span_attribute(
                                        SpanAttributes.GEN_AI_USAGE_OUTPUT_TOKENS,
                                        usage.output_tokens
                                        )

                yield event
        finally:
            self.span.add_event(Event.STREAM_END.value)
            self.span.set_status(StatusCode.OK)
            self.span.end()
