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

import importlib.metadata
from typing import Any
from agiflow.opentelemetry.convention import SpanAttributes, AgiflowServiceTypes
from agiflow.opentelemetry.instrumentation.constants.common import (
    SERVICE_PROVIDERS,
)
from agiflow.opentelemetry.instrumentation.utils import BaseSpanCapture


class GroqSpanCapture(BaseSpanCapture):
    base_url: str

    def __init__(
        self,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        instance: Any = kwargs.get('instance')
        self.base_url = (
            str(instance._client._base_url)
            if hasattr(instance, "_client") and hasattr(instance._client, "_base_url")
            else ""
        )
        service_provider = SERVICE_PROVIDERS["GROQ"]
        # If base url contains perplexity or azure, set the service provider accordingly
        if "perplexity" in self.base_url:
            service_provider = SERVICE_PROVIDERS["PPLX"]
        elif "azure" in self.base_url:
            service_provider = SERVICE_PROVIDERS["AZURE"]
        self.set_pydantic_attributes({
            SpanAttributes.AGIFLOW_SERVICE_NAME: service_provider,
            SpanAttributes.AGIFLOW_SERVICE_VERSION: importlib.metadata.version("groq"),
            SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
            SpanAttributes.URL_FULL: self.base_url,
        })
