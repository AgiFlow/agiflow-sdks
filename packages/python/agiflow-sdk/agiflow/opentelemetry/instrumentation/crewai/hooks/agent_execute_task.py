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


agent_properties = {
    "formatting_errors": "int",
    "id": "object",
    "role": "str",
    "goal": "str",
    "backstory": "str",
    "cache": "bool",
    "config": "object",
    "max_rpm": "int",
    "verbose": "bool",
    "allow_delegation": "bool",
    "tools": "object",
    "max_iter": "int",
    "max_execution_time": "object",
    "agent_executor": "object",
    "tools_handler": "object",
    "force_answer_max_iterations": "int",
    "crew": "object",
    "cache_handler": "object",
    "step_callback": "object",
    "i18n": "object",
    "llm": "object",
    "function_calling_llm": "object",
    "callbacks": "object",
    "system_template": "object",
    "prompt_template": "object",
    "response_template": "object",
}


class AgentExecuteTaskSpanCapture(CrewAISpanCapture):
    method_name: str

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        span_attributes = {}

        crew_config = {}
        for key, value in self.instance.__dict__.items():
            if key in agent_properties and value is not None:
                if agent_properties[key] == "json":
                    crew_config[key] = serialise_to_json(value)
                elif agent_properties[key] == "object":
                    crew_config[key] = str(value)
                else:
                    crew_config[key] = value

        if "context" in self.fkwargs and self.fkwargs["context"]:
            crew_config["context"] = serialise_to_json(self.fkwargs["context"])

        span_attributes[FrameworkSpanAttributes.FRAMEWORK_CONFIG] = serialise_to_json(crew_config)

        self.set_span_attributes_from_pydantic(span_attributes, FrameworkSpanAttributesValidator)

    def capture_output(self, result):
        self.set_span_attribute(AgiflowSpanAttributes.AGIFLOW_ENTITY_OUTPUT, serialise_to_json(result))
