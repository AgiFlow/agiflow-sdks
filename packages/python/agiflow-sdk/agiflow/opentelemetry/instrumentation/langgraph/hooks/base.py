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
from agiflow.opentelemetry.convention import SpanAttributes, AgiflowServiceTypes
from agiflow.opentelemetry.instrumentation.constants.common import (
    SERVICE_PROVIDERS,
)
from agiflow.opentelemetry.instrumentation.utils import BaseSpanCapture


class LanggraphSpanCapture(BaseSpanCapture):

    def __init__(
        self,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        service_provider = SERVICE_PROVIDERS["LANGGRAPH"]
        self.set_pydantic_attributes({
            SpanAttributes.AGIFLOW_SERVICE_NAME: service_provider,
            SpanAttributes.AGIFLOW_SERVICE_VERSION: importlib.metadata.version("langgraph"),
            SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.FRAMEWORK,
        })
