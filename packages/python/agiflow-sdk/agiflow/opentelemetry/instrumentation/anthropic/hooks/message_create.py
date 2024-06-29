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

from agiflow.opentelemetry.convention.constants import Event, LLMTokenUsageKeys, LLMTypes
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.anthropic import APIS
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from opentelemetry.trace import StatusCode
from .base import AnthropicSpanCapture


class MessageCreateSpanCapture(AnthropicSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        span_attributes = {
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.LLM_TYPE: LLMTypes.CHAT,
          SpanAttributes.LLM_API: APIS["MESSAGES_CREATE"]["ENDPOINT"],
          SpanAttributes.LLM_MODEL: self.fkwargs.get('model'),
          SpanAttributes.LLM_STREAM: self.fkwargs.get('stream'),
        }

        if should_send_prompts():
            prompts = serialise_to_json(self.fkwargs.get("messages", []))
            system = self.fkwargs.get("system")
            if system:
                prompts = serialise_to_json(
                    [{"role": "system", "content": system}] + self.fkwargs.get("messages", [])
                )
            span_attributes[SpanAttributes.LLM_PROMPTS] = prompts

        if self.fkwargs.get("temperature") is not None:
            span_attributes[SpanAttributes.LLM_TEMPERATURE] = self.fkwargs.get("temperature")
        if self.fkwargs.get("top_p") is not None:
            span_attributes[SpanAttributes.LLM_TOP_P] = self.fkwargs.get("top_p")
        if self.fkwargs.get("top_k") is not None:
            span_attributes[SpanAttributes.LLM_TOP_K] = self.fkwargs.get("top_k")
        if self.fkwargs.get("user") is not None:
            span_attributes[SpanAttributes.LLM_USER] = self.fkwargs.get("user")
        if self.fkwargs.get("max_tokens") is not None:
            span_attributes[SpanAttributes.LLM_MAX_TOKENS] = self.fkwargs.get("max_tokens")

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            if hasattr(result, "content") and result.content is not None:
                self.set_span_attribute(
                    SpanAttributes.LLM_MODEL,
                    result.model if result.model else self.fkwargs.get("model"),
                )
                self.set_span_attribute(
                    SpanAttributes.LLM_RESPONSES,
                    serialise_to_json(
                        [
                            {
                                "role": result.role if result.role else "assistant",
                                "content": result.content[0].text,
                                "type": result.content[0].type,
                            }
                        ]
                    ),
                )
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
                        LLMTokenUsageKeys.PROMPT_TOKENS: usage.input_tokens,
                        LLMTokenUsageKeys.COMPLETION_TOKENS: usage.output_tokens,
                        LLMTokenUsageKeys.TOTAL_TOKENS: usage.input_tokens + usage.output_tokens,
                    }
                    self.set_span_attribute(SpanAttributes.LLM_TOKEN_COUNTS, serialise_to_json(usage_dict))

    def capture_stream_output(self, result):
        """Process and yield streaming response chunks."""
        result_content = []
        self.span.add_event(Event.STREAM_START.value)
        input_tokens = 0
        output_tokens = 0
        try:
            for chunk in result:
                if (
                    hasattr(chunk, "message")
                    and chunk.message is not None
                    and hasattr(chunk.message, "model")
                    and chunk.message.model is not None
                ):
                    self.set_span_attribute(SpanAttributes.LLM_MODEL, chunk.message.model)
                content = ""
                if hasattr(chunk, "delta") and chunk.delta is not None:
                    content = chunk.delta.text if hasattr(chunk.delta, "text") else ""
                # Assuming content needs to be aggregated before processing
                result_content.append(content if len(content) > 0 else "")

                if hasattr(chunk, "message") and hasattr(chunk.message, "usage"):
                    input_tokens += (
                        chunk.message.usage.input_tokens
                        if hasattr(chunk.message.usage, "input_tokens")
                        else 0
                    )
                    output_tokens += (
                        chunk.message.usage.output_tokens
                        if hasattr(chunk.message.usage, "output_tokens")
                        else 0
                    )

                # Assuming span.add_event is part of a larger logging or event system
                # Add event for each chunk of content
                if content:
                    self.span.add_event(
                        Event.STREAM_OUTPUT.value, {"response": "".join(content)}
                    )

                # Assuming this is part of a generator, yield chunk or aggregated content
                yield content
        finally:

            # Finalize span after processing all chunks
            self.span.add_event(Event.STREAM_END.value)
            self.set_span_attribute(
                SpanAttributes.LLM_TOKEN_COUNTS,
                serialise_to_json(
                    {
                        LLMTokenUsageKeys.PROMPT_TOKENS: input_tokens,
                        LLMTokenUsageKeys.COMPLETION_TOKENS: output_tokens,
                        LLMTokenUsageKeys.TOTAL_TOKENS: input_tokens + output_tokens,
                    }
                ),
            )
            self.set_span_attribute(
                SpanAttributes.LLM_RESPONSES,
                serialise_to_json([{"role": "assistant", "content": "".join(result_content)}]),
            )
            self.span.set_status(StatusCode.OK)
            self.span.end()
