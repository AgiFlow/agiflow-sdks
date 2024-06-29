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

from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
  FrameworkSpanAttributesValidator
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import LangchainCommunitySpanCapture


class GenericSpanCapture(LangchainCommunitySpanCapture):
    task: str

    def __init__(
        self,
        *args,
        task: str = '',
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.task = task

    def capture_input(self):
        span_attributes = {
          SpanAttributes.AGIFLOW_ENTITY_NAME: self.task,
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.FRAMEWORK,
        }

        if len(self.fargs) > 0 and should_send_prompts():
            span_attributes[SpanAttributes.AGIFLOW_ENTITY_INPUT] = serialise_to_json(self.fargs)

        self.set_span_attributes_from_pydantic(span_attributes, FrameworkSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            self.span.set_attribute(SpanAttributes.AGIFLOW_ENTITY_OUTPUT, serialise_to_json(result))
