"""
Copyright (c) 2024 AGIFLow

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
  method_wrapper,
  async_method_wrapper,
  stream_wrapper,
  async_stream_wrapper,
)
from .hooks import (
  ImageGenerateSpanCapture,
  ChatCompletionSpanCapture,
  EmbeddingSpanCapture,
)
from agiflow.version import __version__


class OpenAIInstrumentation(BaseInstrumentor):

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["openai >= 0.27.0"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        wrap_function_wrapper(
            "openai.resources.chat.completions",
            "Completions.create",
            stream_wrapper(
              tracer=tracer,
              SpanCapture=ChatCompletionSpanCapture
            )
        )

        wrap_function_wrapper(
            "openai.resources.chat.completions",
            "AsyncCompletions.create",
            async_stream_wrapper(
              tracer=tracer,
              SpanCapture=ChatCompletionSpanCapture
            )
        )

        wrap_function_wrapper(
            "openai.resources.images",
            "Images.generate",
            method_wrapper(
              tracer=tracer,
              SpanCapture=ImageGenerateSpanCapture
            )
        )

        wrap_function_wrapper(
            "openai.resources.images",
            "AsyncImages.generate",
            async_method_wrapper(
              tracer=tracer,
              SpanCapture=ImageGenerateSpanCapture
            )
        )
        wrap_function_wrapper(
            "openai.resources.embeddings",
            "Embeddings.create",
            method_wrapper(
              tracer=tracer,
              SpanCapture=EmbeddingSpanCapture
            )
        )
        wrap_function_wrapper(
            "openai.resources.embeddings",
            "AsyncEmbeddings.create",
            async_method_wrapper(
              tracer=tracer,
              SpanCapture=EmbeddingSpanCapture
            )
        )

    def _uninstrument(self, **kwargs):
        pass
