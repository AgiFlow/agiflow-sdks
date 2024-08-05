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


class EmbedSpanCapture(CohereSpanCapture):
    model: str

    def __init__(self, *args, model='', **kwargs):
        super().__init__(*args, **kwargs)
        self.model = model

    @staticmethod
    def get_span_name(instance, *args, **kwargs):
        return APIS["EMBED"]["METHOD"]

    def capture_input(self):
        span_attributes = {
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.GEN_AI_OPERATION_NAME: LLMTypes.EMBEDDING,
          SpanAttributes.URL_FULL: APIS["EMBED"]["URL"],
          SpanAttributes.LLM_API: APIS["EMBED"]["ENDPOINT"],
          SpanAttributes.GEN_AI_REQUEST_MODEL: self.model,
          SpanAttributes.LLM_EMBEDDING_DATASET_ID: self.fkwargs.get("dataset_id"),
          SpanAttributes.LLM_EMBEDDING_JOB_NAME: self.fkwargs.get("name"),
        }

        if should_send_prompts():
            span_attributes[SpanAttributes.LLM_EMBEDDING_INPUTS] = serialise_to_json(self.fkwargs.get("texts"))
            span_attributes[SpanAttributes.LLM_EMBEDDING_INPUT_TYPE] = serialise_to_json(self.fkwargs.get("input_type"))

        if self.fkwargs.get("user") is not None:
            span_attributes[SpanAttributes.LLM_USER] = self.fkwargs.get("user")

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        if hasattr(result, "meta") and result.meta is not None:
            if (
                hasattr(result.meta, "billed_units")
                and result.meta.billed_units is not None
            ):
                usage = result.meta.billed_units
                if usage is not None:
                    self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_INPUT_TOKENS, usage.input_tokens)
                    self.set_span_attribute(SpanAttributes.GEN_AI_USAGE_OUTPUT_TOKENS, usage.output_tokens)
