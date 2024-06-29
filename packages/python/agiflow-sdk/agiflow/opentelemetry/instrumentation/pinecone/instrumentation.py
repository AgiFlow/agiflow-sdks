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
from agiflow.opentelemetry.instrumentation.constants.pinecone import APIS
from agiflow.opentelemetry.instrumentation.utils import (
  method_wrapper,
)
from agiflow.version import __version__
from .hooks import (
  GenericSpanCapture,
)


class PineconeInstrumentation(BaseInstrumentor):
    """
    The PineconeInstrumentation class represents the Pinecone instrumentation
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["pinecone-client >= 3.1.0"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        for operation_name, details in APIS.items():
            operation = details["OPERATION"]
            # Dynamically creating the patching call
            wrap_function_wrapper(
                "pinecone.data.index",
                f"Index.{operation}",
                method_wrapper(
                  tracer=tracer,
                  span_name=details['METHOD'],
                  operation_name=operation_name,
                  SpanCapture=GenericSpanCapture
                )
            )

    def _instrument_module(self, module_name):
        pass

    def _uninstrument(self, **kwargs):
        pass
