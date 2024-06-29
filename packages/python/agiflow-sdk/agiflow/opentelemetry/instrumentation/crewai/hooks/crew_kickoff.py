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

from agiflow.opentelemetry.convention.framework_span_attributes import (
  FrameworkSpanAttributesValidator,
  FrameworkSpanAttributes
)
from agiflow.opentelemetry.convention.agiflow_attributes import AgiflowSpanAttributes
from agiflow.utils import serialise_to_json
from .base import CrewAISpanCapture


crew_properties = {
    "tasks": "object",
    "agents": "object",
    "cache": "bool",
    "process": "object",
    "verbose": "bool",
    "memory": "bool",
    "embedder": "json",
    "full_output": "bool",
    "manager_llm": "object",
    "manager_agent": "object",
    "manager_callbacks": "object",
    "function_calling_llm": "object",
    "config": "json",
    "id": "object",
    "max_rpm": "int",
    "share_crew": "bool",
    "step_callback": "object",
    "task_callback": "object",
    "prompt_file": "object",
    "output_log_file": "object",
}


class CrewKickoffSpanCapture(CrewAISpanCapture):
    method_name: str

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        span_attributes = {}

        crew_config = {}
        for key, value in self.instance.__dict__.items():
            if key in crew_properties and value is not None:
                if crew_properties[key] == "json":
                    crew_config[key] = serialise_to_json(value)
                elif crew_properties[key] == "object":
                    crew_config[key] = str(value)
                else:
                    crew_config[key] = value

        span_attributes[FrameworkSpanAttributes.FRAMEWORK_CONFIG] = serialise_to_json(crew_config)

        if "inputs" in self.fkwargs and self.fkwargs["inputs"]:
            span_attributes[AgiflowSpanAttributes.AGIFLOW_ENTITY_INPUT] = serialise_to_json(self.fkwargs["inputs"])

        self.set_span_attributes_from_pydantic(span_attributes, FrameworkSpanAttributesValidator)

    def capture_output(self, result):
        self.set_span_attribute(AgiflowSpanAttributes.AGIFLOW_ENTITY_OUTPUT, serialise_to_json(result))
