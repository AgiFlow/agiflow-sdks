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
from agiflow.opentelemetry.instrumentation.utils import (
  stream_wrapper,
  method_wrapper,
)
from agiflow.version import __version__
from .hooks import (
  RerankSpanCapture,
  EmbedSpanCapture,
  ChatCreateSpanCapture,
  ChatStreamSpanCapture,
)


class CohereInstrumentation(BaseInstrumentor):
    """
    The CohereInstrumentation class represents the Cohere instrumentation
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["cohere >= 5.0.0"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        wrap_function_wrapper(
            "cohere.client",
            "Client.chat",
            stream_wrapper(
              tracer=tracer,
              SpanCapture=ChatCreateSpanCapture
            )
        )

        wrap_function_wrapper(
            "cohere.client",
            "Client.chat_stream",
            stream_wrapper(
              tracer=tracer,
              SpanCapture=ChatStreamSpanCapture
            )
        )

        wrap_function_wrapper(
            "cohere.client",
            "Client.embed",
            method_wrapper(
              tracer=tracer,
              SpanCapture=EmbedSpanCapture
            )
        )

        wrap_function_wrapper(
            "cohere.client",
            "Client.rerank",
            method_wrapper(
              tracer=tracer,
              SpanCapture=RerankSpanCapture
            )
        )

    def _instrument_module(self, module_name):
        pass

    def _uninstrument(self, **kwargs):
        pass
