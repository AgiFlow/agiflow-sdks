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
from wrapt import wrap_function_wrapper

from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry.trace import get_tracer
from agiflow.opentelemetry.instrumentation.utils import (
  method_wrapper,
  async_method_wrapper,
)
from agiflow.opentelemetry.instrumentation.utils import patch_module_classes
from agiflow.version import __version__
from .hooks import (
  GenericSpanCapture,
  RunnableSpanCapture,
  LLMSpanCapture,
)


class LangchainCoreInstrumentation(BaseInstrumentor):
    """
    Instrumentor for langchain.
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["langchain-core >= 0.1.27"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        exclude_methods = [
            "get_name",
            "get_output_schema",
            "get_input_schema",
            "get_graph",
            "to_json",
            "to_json_not_implemented",
            "bind",
            "dict",
            "format",
            "format_messages",
            "format_prompt",
        ]
        exclude_classes = [
            "BaseChatPromptTemplate",
            "Runnable",
            "RunnableBinding",
            "RunnableBindingBase",
            "RunnableEach",
            "RunnableEachBase",
            "RunnableGenerator",
            "RunnablePick",
            "RunnableMap",
            "RunnableSerializable",
        ]

        modules_to_patch = [
            ("langchain_core.retrievers", "retriever", GenericSpanCapture),
            ("langchain_core.prompts.chat", "prompt", GenericSpanCapture),
            ("langchain_core.runnables.base", "runnable", RunnableSpanCapture),
        ]

        for (
            module_name,
            task,
            SpanCapture
        ) in modules_to_patch:
            patch_module_classes(
                module_name,
                tracer,
                task,
                SpanCapture=SpanCapture,
                exclude_methods=exclude_methods,
                exclude_classes=exclude_classes,
            )

        wrap_function_wrapper(
            "langchain_core.language_models.llms",
            "BaseLLM.generate",
            method_wrapper(
              tracer=tracer,
              SpanCapture=LLMSpanCapture
            )
        )

        wrap_function_wrapper(
            "langchain_core.language_models.llms",
            "BaseLLM.agenerate",
            async_method_wrapper(
              tracer=tracer,
              SpanCapture=LLMSpanCapture
            )
        )

    def _uninstrument(self, **kwargs):
        pass
