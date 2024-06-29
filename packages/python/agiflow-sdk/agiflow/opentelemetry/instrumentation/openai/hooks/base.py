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
import logging

from typing import Optional
from agiflow.opentelemetry.instrumentation.constants.common import (
    SERVICE_PROVIDERS,
)
from agiflow.opentelemetry.instrumentation.utils import BaseSpanCapture
from agiflow.opentelemetry.convention import (
  AgiflowServiceTypes,
  SpanAttributes
)

logger = logging.getLogger(__name__)


class OpenAISpanCapture(BaseSpanCapture):
    """
    Shared attributes for other span capture
    """
    model: Optional[str]

    def __init__(self, *args, model: str = '', **kwargs):
        super().__init__(*args, **kwargs)
        self.version = importlib.metadata.version("openai")
        self.model = model
        self.set_pydantic_attributes(self.get_attributes())

    def get_attributes(self):
        base_url = (
            str(self.instance._client._base_url)
            if hasattr(self.instance, "_client") and hasattr(self.instance._client, "_base_url")
            else ""
        )
        service_provider = SERVICE_PROVIDERS["OPENAI"]

        attr = {
            SpanAttributes.AGIFLOW_SERVICE_NAME: service_provider,
            SpanAttributes.AGIFLOW_SERVICE_VERSION: self.version,
            SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
            SpanAttributes.URL_FULL: base_url,
            SpanAttributes.LLM_MODEL: self.model,
        }

        try:
            client = self.instance._client  # pylint: disable=protected-access
            if hasattr(client, 'base_url'):
                attr[SpanAttributes.OPENAI_API_BASE] = str(client.base_url)
            if hasattr(client, '_api_version'):
                attr[SpanAttributes.OPENAI_API_VERSION] = str(client._api_version)
        except Exception as ex:  # pylint: disable=broad-except
            logger.warning(
                "Failed to set api attributes for openai v1 span, error: %s", str(ex)
            )

        return attr
