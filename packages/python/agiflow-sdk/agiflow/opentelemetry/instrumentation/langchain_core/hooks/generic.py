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
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
  FrameworkSpanAttributesValidator
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import LangchainCoreSpanCapture


class GenericSpanCapture(LangchainCoreSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        span_attributes: Dict[str, Any] = {
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.FRAMEWORK,
        }

        if len(self.fargs) > 0 and should_send_prompts():
            inputs = {}
            for arg in self.fargs:
                if isinstance(arg, dict):
                    for key, value in arg.items():
                        if isinstance(value, list):
                            for item in value:
                                inputs[key] = item.__class__.__name__
                        elif isinstance(value, str):
                            inputs[key] = value
                elif isinstance(arg, str):
                    inputs["input"] = arg

            span_attributes[SpanAttributes.AGIFLOW_ENTITY_INPUT] = serialise_to_json(inputs)

        self.set_span_attributes_from_pydantic(span_attributes, FrameworkSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            self.set_span_attribute(SpanAttributes.AGIFLOW_ENTITY_OUTPUT, serialise_to_json(result))
