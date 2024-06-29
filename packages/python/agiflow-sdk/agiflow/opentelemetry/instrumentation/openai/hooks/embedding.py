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

import json

from typing import Any, Optional
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.openai import APIS
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  LLMTypes
)
from .base import OpenAISpanCapture


class EmbeddingSpanCapture(OpenAISpanCapture):
    encoding_format: Optional[str]
    dimensions: Optional[str]
    user: Optional[Any]
    input: Any

    def __init__(
        self,
        *args,
        input=None,
        encoding_format=None,
        dimensions=None,
        user=None,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.encoding_format = encoding_format
        self.dimensions = dimensions
        self.user = user
        self.input = input

    def capture_input(self):
        span_attributes = {
            SpanAttributes.LLM_API: APIS["EMBEDDINGS_CREATE"]["ENDPOINT"],
            SpanAttributes.LLM_MODEL: self.model,
            SpanAttributes.LLM_TYPE: LLMTypes.EMBEDDING,
            SpanAttributes.LLM_PROMPTS: json.dumps(
                [{"role": "user", "content": (self.input or '')}]
            ),
        }

        if self.encoding_format is not None:
            span_attributes[SpanAttributes.LLM_ENCODING_FORMAT] = self.encoding_format
        if self.dimensions is not None:
            span_attributes[SpanAttributes.LLM_DIMENSIONS] = self.dimensions
        if self.user is not None:
            span_attributes[SpanAttributes.LLM_USER] = self.user

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)
