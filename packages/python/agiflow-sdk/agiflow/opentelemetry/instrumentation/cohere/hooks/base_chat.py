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

from agiflow.opentelemetry.convention.constants import LLMTypes
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.cohere import APIS
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import CohereSpanCapture


class CohereChatSpanCapture(CohereSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @staticmethod
    def get_span_name(instance):
        return APIS["CHAT_CREATE"]["METHOD"]

    def capture_input(self):
        span_attributes = {
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.LLM_TYPE: LLMTypes.CHAT,
          SpanAttributes.URL_FULL: APIS["CHAT_CREATE"]["URL"],
          SpanAttributes.LLM_API: APIS["CHAT_CREATE"]["ENDPOINT"],
          SpanAttributes.LLM_MODEL: (
              self.fkwargs.get("model") if self.fkwargs.get("model") is not None else "command-r"
          ),
        }

        if should_send_prompts():
            message = self.fkwargs.get("message", "")
            prompts = [{"role": "USER", "content": message}]
            system_prompts = []
            history = []
            preamble = self.fkwargs.get("preamble")
            if preamble:
                system_prompts = [{"role": "system", "content": preamble}]

            chat_history = self.fkwargs.get("chat_history")
            if chat_history:
                history = [
                    {
                        "role": (
                            item.get("role") if item.get("role") is not None else "USER"
                        ),
                        "content": (
                            item.get("message") if item.get("message") is not None else ""
                        ),
                    }
                    for item in chat_history
                ]
            if len(history) > 0:
                prompts = history + prompts
            if len(system_prompts) > 0:
                prompts = system_prompts + prompts
            span_attributes[SpanAttributes.LLM_PROMPTS] = serialise_to_json(prompts)

        if self.fkwargs.get("temperature") is not None:
            span_attributes[SpanAttributes.LLM_TEMPERATURE] = self.fkwargs.get("temperature")
        if self.fkwargs.get("max_tokens") is not None:
            span_attributes[SpanAttributes.LLM_MAX_TOKENS] = str(self.fkwargs.get("max_tokens"))
        if self.fkwargs.get("max_input_tokens") is not None:
            span_attributes[SpanAttributes.LLM_MAX_INPUT_TOKENS] = str(self.fkwargs.get("max_input_tokens"))
        if self.fkwargs.get("p") is not None:
            span_attributes[SpanAttributes.LLM_TOP_P] = self.fkwargs.get("p")
        if self.fkwargs.get("k") is not None:
            span_attributes[SpanAttributes.LLM_TOP_K] = self.fkwargs.get("k")
        if self.fkwargs.get("user") is not None:
            span_attributes[SpanAttributes.LLM_USER] = self.fkwargs.get("user")
        if self.fkwargs.get("conversation_id") is not None:
            span_attributes[SpanAttributes.LLM_CONVERSATION_ID] = self.fkwargs.get("conversation_id")
        if self.fkwargs.get("seed") is not None:
            span_attributes[SpanAttributes.LLM_SEED] = self.fkwargs.get("seed")
        if self.fkwargs.get("frequency_penalty") is not None:
            span_attributes[SpanAttributes.LLM_FREQUENCY_PENALTY] = self.fkwargs.get("frequency_penalty")
        if self.fkwargs.get("presence_penalty") is not None:
            span_attributes[SpanAttributes.LLM_PRESENCE_PENALTY] = self.fkwargs.get("presence_penalty")
        if self.fkwargs.get("connectors") is not None:
            # stringify the list of objects
            span_attributes[SpanAttributes.LLM_CONNECTORS] = serialise_to_json(self.fkwargs.get("connectors"))
        if self.fkwargs.get("tools") is not None:
            # stringify the list of objects
            span_attributes[SpanAttributes.LLM_TOOLS] = serialise_to_json(self.fkwargs.get("tools"))
        if self.fkwargs.get("tool_results") is not None:
            # stringify the list of objects
            span_attributes[SpanAttributes.LLM_TOOL_RESULTS] = serialise_to_json(self.fkwargs.get("tool_results"))

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        # Set the response attributes
        if (hasattr(result, "generation_id")) and (
            result.generation_id is not None
        ):
            self.set_span_attribute(SpanAttributes.LLM_GENERATION_ID, result.generation_id)
        if (hasattr(result, "response_id")) and (result.response_id is not None):
            self.set_span_attribute(SpanAttributes.LLM_RESPONSE_ID, result.response_id)
        if (hasattr(result, "is_search_required")) and (
            result.is_search_required is not None
        ):
            self.set_span_attribute(SpanAttributes.LLM_IS_SEARCH_REQUIRED, result.is_search_required)
