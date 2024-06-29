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

from agiflow.opentelemetry.convention.constants import LLMTokenUsageKeys, LLMTypes
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.cohere import APIS
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import CohereSpanCapture


class RerankSpanCapture(CohereSpanCapture):
    model: str

    def __init__(self, *args, model='', **kwargs):
        super().__init__(*args, **kwargs)
        self.model = model

    @staticmethod
    def get_span_name(instance):
        return APIS["RERANK"]["METHOD"]

    def capture_input(self):
        span_attributes = {
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.LLM_TYPE: LLMTypes.RERANK,
          SpanAttributes.URL_FULL: APIS["RERANK"]["URL"],
          SpanAttributes.LLM_API: APIS["RERANK"]["ENDPOINT"],
          SpanAttributes.LLM_MODEL: self.model,
          SpanAttributes.LLM_PROMPTS: "",
          SpanAttributes.LLM_RETRIEVAL_QUERY: self.fkwargs.get("query"),
        }

        if should_send_prompts():
            span_attributes[SpanAttributes.LLM_DOCUMENTS] = serialise_to_json(self.fkwargs.get("documents"))

        if self.fkwargs.get("top_n") is not None:
            span_attributes[SpanAttributes.LLM_TOP_K] = self.fkwargs.get("top_n")

        if self.fkwargs.get("user") is not None:
            span_attributes[SpanAttributes.LLM_USER] = self.fkwargs.get("user")

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        if (hasattr(result, "response_id")) and (result.response_id is not None):
            self.set_span_attribute(SpanAttributes.LLM_RESPONSE_ID, result.response_id)

        if hasattr(result, "meta") and result.meta is not None:
            if (
                hasattr(result.meta, "billed_units")
                and result.meta.billed_units is not None
            ):
                usage = result.meta.billed_units
                if usage is not None:
                    usage_dict = {
                        LLMTokenUsageKeys.PROMPT_TOKENS: (
                            usage.input_tokens
                            if usage.input_tokens is not None
                            else 0
                        ),
                        LLMTokenUsageKeys.COMPLETION_TOKENS: (
                            usage.output_tokens
                            if usage.output_tokens is not None
                            else 0
                        ),
                        LLMTokenUsageKeys.TOTAL_TOKENS: (
                            usage.input_tokens + usage.output_tokens
                            if usage.input_tokens is not None
                            and usage.output_tokens is not None
                            else 0
                        ),
                        LLMTokenUsageKeys.SEARCH_UNITS: (
                            usage.search_units
                            if usage.search_units is not None
                            else 0
                        ),
                    }
                    self.set_span_attribute(SpanAttributes.LLM_TOKEN_COUNTS, serialise_to_json(usage_dict))

        if should_send_prompts():

            if hasattr(result, "results") and result.results is not None:
                results = []
                for _, doc in enumerate(result.results):
                    results.append(doc.json())
                self.set_span_attribute(SpanAttributes.LLM_RETRIEVAL_RESULTS, serialise_to_json(results))
