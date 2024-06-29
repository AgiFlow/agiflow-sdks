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

from typing import Collection

from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry.trace import get_tracer
from wrapt import wrap_function_wrapper
from agiflow.opentelemetry.instrumentation.utils import (
  method_wrapper,
  async_method_wrapper,
)

from agiflow.opentelemetry.instrumentation.utils import patch_module_classes
from agiflow.version import __version__
from .hooks import GenericSpanCapture, ChatSpanCapture


class LangchainInstrumentation(BaseInstrumentor):
    """
    Instrumentor for langchain.
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["langchain >= 0.1.9"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        modules_to_patch = [
            ("langchain.text_splitter", "split_text"),
        ]

        for module_name, task in modules_to_patch:
            patch_module_classes(
                module_name, tracer, task, SpanCapture=GenericSpanCapture
            )

        wrap_function_wrapper(
            "langchain.chat_models.base",
            "BaseChatModel.generate",
            method_wrapper(
              tracer=tracer,
              SpanCapture=ChatSpanCapture
            )
        )

        wrap_function_wrapper(
            "langchain.chat_models.base",
            "BaseChatModel.agenerate",
            async_method_wrapper(
              tracer=tracer,
              SpanCapture=ChatSpanCapture
            )
        )

    def _uninstrument(self, **kwargs):
        pass
