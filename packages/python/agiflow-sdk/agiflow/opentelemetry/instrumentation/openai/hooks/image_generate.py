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

from typing import List, Any, Optional
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.openai import APIS
from agiflow.opentelemetry.convention import SpanAttributes, LLMTypes
from .base import OpenAISpanCapture


class ImageGenerateSpanCapture(OpenAISpanCapture):
    stream: bool
    prompt: Optional[List]

    def __init__(
        self,
        *args,
        stream: bool = False,
        prompt: Any = None,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.stream = stream
        self.prompt = prompt

    def capture_input(self):
        span_attributes = {
            SpanAttributes.LLM_TYPE: LLMTypes.IMAGE_GENERATION,
            SpanAttributes.LLM_API: APIS["IMAGES_GENERATION"]["ENDPOINT"],
            SpanAttributes.LLM_STREAM: self.stream,
            SpanAttributes.LLM_PROMPTS: json.dumps(
                [{"role": "user", "content": (self.prompt or [])}]
            ),
        }

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        if self.stream is False or self.stream is None:
            data: Any = (
                result.data[0]
                if hasattr(result, "data") and len(result.data) > 0
                else {}
            )
            response = [
                {
                    "role": "assistant",
                    "content": {
                        "url": data.url if hasattr(data, "url") else "",
                        "revised_prompt": (
                            data.revised_prompt
                            if hasattr(data, "revised_prompt")
                            else ""
                        ),
                    },
                }
            ]
            self.set_span_attribute(SpanAttributes.LLM_RESPONSES, json.dumps(response))
