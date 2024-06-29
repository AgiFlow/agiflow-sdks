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

from typing import Dict, List, Any, Optional
from agiflow.opentelemetry.convention import SpanAttributes
from agiflow.opentelemetry.instrumentation.constants.common import (
    SERVICE_PROVIDERS,
)
from .base import OpenAISpanCapture


class OpenAILLMSpanCapture(OpenAISpanCapture):
    functions: Optional[List]
    tools: Optional[List]
    messages: Optional[Any]
    stream: Optional[Any]
    temperature: Optional[float]
    top_p: Optional[float]
    user: Optional[Any]
    tokens: Dict[str, int] = {}

    def __init__(
        self,
        *args,
        functions=None,
        tools=None,
        messages=None,
        temperature=None,
        top_p=None,
        user=None,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.functions = functions
        self.tools = tools
        self.messages = messages
        self.temperature = temperature
        self.top_p = top_p
        self.user = user

    def add_input_attributes(self):
        base_url = self.pydantic_attributes.get(SpanAttributes.URL_FULL, "")
        service_provider = self.pydantic_attributes.get(SpanAttributes.AGIFLOW_SERVICE_NAME)
        # If base url contains perplexity or azure, set the service provider accordingly
        if "perplexity" in base_url:
            service_provider = SERVICE_PROVIDERS["PPLX"]
        elif "azure" in base_url:
            service_provider = SERVICE_PROVIDERS["AZURE"]

        span_attributes = {
            SpanAttributes.AGIFLOW_SERVICE_NAME: service_provider,
            SpanAttributes.LLM_STREAM: self.fkwargs.get('stream'),
            SpanAttributes.LLM_TEMPERATURE: self.temperature,
            SpanAttributes.LLM_TOP_P: self.top_p,
            SpanAttributes.LLM_USER: self.user,
            SpanAttributes.LLM_MAX_TOKENS: self.fkwargs.get('max_tokens'),
            SpanAttributes.LLM_FREQUENCY_PENALTY: self.fkwargs.get('frequency_penalty'),
            SpanAttributes.LLM_PRESENCE_PENALTY: self.fkwargs.get('presence_penalty'),
        }
        tools = []
        if self.functions is not None:
            for function in self.functions:
                tools.append(json.dumps({"type": "function", "function": function}))
            tools.append(json.dumps(self.tools))
        if len(tools) > 0:
            span_attributes[SpanAttributes.LLM_TOOLS] = json.dumps(tools)

        self.set_pydantic_attributes(span_attributes)
