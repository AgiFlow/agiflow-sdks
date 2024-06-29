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

from .hooks import (
  TaskExecuteSpanCapture,
  AgentExecuteTaskSpanCapture,
  CrewKickoffSpanCapture,
)
from agiflow.opentelemetry.instrumentation.utils import (
  method_wrapper,
)
from agiflow.version import __version__


class CrewAIInstrumentation(BaseInstrumentor):
    """
    The CrewAIInstrumentation class represents the CrewAI instrumentation
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["crewai >= 0.0.39"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        wrap_function_wrapper(
            "crewai.crew",
            "Crew.kickoff",
            method_wrapper(
              tracer=tracer,
              SpanCapture=CrewKickoffSpanCapture
            )
        )

        wrap_function_wrapper(
            "crewai.agent",
            "Agent.execute_task",
            method_wrapper(
              tracer=tracer,
              SpanCapture=AgentExecuteTaskSpanCapture
            )
        )

        wrap_function_wrapper(
            "crewai.task",
            "Task.execute",
            method_wrapper(
              tracer=tracer,
              SpanCapture=TaskExecuteSpanCapture
            )
        )

    def _instrument_module(self, module_name):
        pass

    def _uninstrument(self, **kwargs):
        pass
