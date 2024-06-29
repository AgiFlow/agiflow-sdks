"""
Copyright (c) 2024 Agiflow

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

from typing import Collection

from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry.trace import get_tracer
from wrapt import wrap_function_wrapper
from agiflow.opentelemetry.instrumentation.constants.weaviate import APIS
from agiflow.opentelemetry.instrumentation.utils import (
  method_wrapper,
)
from agiflow.version import __version__
from .hooks import (
  GenericCollectionSpanCapture,
  GenericQuerySpanCapture,
)


class WeaviateInstrumentation(BaseInstrumentor):
    """
    The WeaviateInstrumentation class represents the Weaviate instrumentation
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["weaviate-client >= 4.6.1", "trace-attributes >= 4.0.2"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        for api_name, api_config in APIS.items():
            module_path, function_name = api_name.rsplit(".", 1)
            if api_config.get("OPERATION") == "query":
                if getattr(api_config["MODULE"], api_config["METHOD"], None):
                    wrap_function_wrapper(
                        api_config["MODULE"],
                        api_config["METHOD"],
                        method_wrapper(
                          tracer=tracer,
                          method=api_name,
                          SpanCapture=GenericQuerySpanCapture
                        )
                    )
            elif api_config.get("OPERATION") == "create":
                if getattr(api_config["MODULE"], api_config["METHOD"], None):
                    wrap_function_wrapper(
                        api_config["MODULE"],
                        api_config["METHOD"],
                        method_wrapper(
                          tracer=tracer,
                          method=api_name,
                          SpanCapture=GenericCollectionSpanCapture
                        )
                    )

    def _instrument_module(self, module_name):
        pass

    def _uninstrument(self, **kwargs):
        pass
