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
from agiflow.opentelemetry.convention.framework_span_attributes import (
  FrameworkSpanAttributesValidator,
)
from agiflow.opentelemetry.utils import should_send_prompts
from agiflow.opentelemetry.convention.agiflow_attributes import AgiflowSpanAttributes
from agiflow.utils import serialise_to_json
from .base import LanggraphSpanCapture


class PregelInvokeSpanCapture(LanggraphSpanCapture):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        span_attributes: Dict[str, Any] = {}

        if should_send_prompts():
            span_attributes[AgiflowSpanAttributes.AGIFLOW_ENTITY_INPUT] = serialise_to_json({
                "args": self.fargs,
                "kwargs": self.fkwargs
            })

        self.set_span_attributes_from_pydantic(span_attributes, FrameworkSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            self.set_span_attribute(AgiflowSpanAttributes.AGIFLOW_ENTITY_OUTPUT, serialise_to_json(result))
