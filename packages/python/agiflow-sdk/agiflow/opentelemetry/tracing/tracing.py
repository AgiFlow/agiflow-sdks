"""
Copyright (c) 2024 AgiFlow

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

from typing import List, Optional
import atexit
import logging
from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry.sdk.trace.sampling import Sampler
from opentelemetry.trace import ProxyTracerProvider
from opentelemetry.sdk.trace import TracerProvider, SpanProcessor
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    SpanExporter
)
from opentelemetry.sdk.resources import Resource
from opentelemetry.propagators.textmap import TextMapPropagator
from opentelemetry.propagate import set_global_textmap

from typing import Any, Callable, Dict
from agiflow.opentelemetry.convention import SpanAttributes
from agiflow.opentelemetry.tracing.content_allow_list import ContentAllowList
from agiflow.opentelemetry.types import DisableInstrumentations
from agiflow.opentelemetry.trace_exporter.json import OTLPJsonSpanExporter
from agiflow.opentelemetry.instrumentation import (
    init_instrumentations,
    all_instrumentations
)
from agiflow.opentelemetry.trace_store import set_tracer_provider, get_tracer_provider
from agiflow.opentelemetry.context import (
  set_override_enable_context_tracing,
  get_association_properties,
  set_workflow_name_from_context,
  set_prompt_attributes_from_context
)
from agiflow.version import __version__
from agiflow.utils import Debugger
from agiflow.config import is_console_log_enabled


TRACER_NAME = "agiflow.tracer"
debugger = Debugger(__name__)
logger = logging.getLogger(__name__)


class TracerWrapper(object):
    """
    Singleton class which store reference to
    trace_provider, span_processor, etc...
    """
    enable_content_tracing: bool = True
    resource_attributes: dict = {}
    endpoint: Optional[str] = None
    headers: Dict[str, str] = {}
    __resource: Resource
    __sampler: Optional[Sampler]
    __tracer_provider: TracerProvider
    __span_processor: SpanProcessor
    __additional_span_processor: SpanProcessor = None
    __content_allow_list: ContentAllowList
    __span_processor_original_on_start: Optional[Callable] = None

    def __new__(
        cls,
        propagator: Optional[TextMapPropagator] = None,
        disable_instrumentations: Optional[DisableInstrumentations] = None,
        extra_instrumentations: Optional[List[type[BaseInstrumentor]]] = None,
        exporter: Optional[SpanExporter] = None,
        Processor: Optional[type[SpanProcessor]] = None,
        additional_processor: Optional[SpanProcessor] = None,
        sampler: Optional[Sampler] = None
    ) -> "TracerWrapper":
        if not hasattr(cls, "instance"):
            obj = cls.instance = super(TracerWrapper, cls).__new__(cls)
            if not TracerWrapper.endpoint:
                return obj

            obj.__resource = Resource(attributes=TracerWrapper.resource_attributes)
            obj.__sampler = sampler
            obj.__tracer_provider = init_tracer_provider(
                resource=obj.__resource,
                sampler=obj.__sampler,
            )

            if additional_processor is not None:
                obj.__additional_span_processor = additional_processor

            if Processor is None:
                Processor = BatchSpanProcessor

            if exporter is None:
                span_exporter = init_spans_exporter(
                    TracerWrapper.endpoint, TracerWrapper.headers
                )
                obj.__span_processor = Processor(span_exporter)
            else:
                obj.__span_processor = Processor(exporter)

            if hasattr(obj.__span_processor, 'on_start'):
                obj.__span_processor.on_start = obj._span_processor_on_start

            obj.__tracer_provider.add_span_processor(obj.__span_processor)

            if obj.__additional_span_processor is not None:
                if hasattr(obj.__additional_span_processor, 'on_start'):
                    obj.__additional_span_processor.on_start = obj._span_processor_on_start
                obj.__tracer_provider.add_span_processor(obj.__additional_span_processor)

            if propagator:
                set_global_textmap(propagator)

            init_instrumentations(disable_instrumentations, all_instrumentations, obj.__tracer_provider)

            if extra_instrumentations is not None:
                for Instrumentor in extra_instrumentations:
                    Instrumentor().instrument(obj.__tracer_provider)

            obj.__content_allow_list = ContentAllowList()

            atexit.register(obj.exit_handler)

        return cls.instance

    def exit_handler(self):
        self.flush()

    def _span_processor_on_start(self, span, parent_context):
        set_workflow_name_from_context(span)

        association_properties: Any = get_association_properties()
        if association_properties is not None:
            for key, value in association_properties.items():
                span.set_attribute(
                    f"{SpanAttributes.AGIFLOW_ASSOCIATION_PROPERTIES}.{key}", value
                )

            if not self.enable_content_tracing:
                if self.__content_allow_list.is_allowed(association_properties):
                    set_override_enable_context_tracing(True)
                else:
                    set_override_enable_context_tracing(False)

        set_prompt_attributes_from_context(span)

        # Call original on_start method if it exists in custom processor
        if self.__span_processor_original_on_start:
            self.__span_processor_original_on_start(span, parent_context)

    @staticmethod
    def set_static_params(
        resource_attributes: dict,
        enable_content_tracing: bool,
        endpoint: str,
        headers: Dict[str, str],
    ) -> None:
        TracerWrapper.resource_attributes = resource_attributes
        TracerWrapper.enable_content_tracing = enable_content_tracing
        TracerWrapper.endpoint = endpoint
        TracerWrapper.headers = headers

    @classmethod
    def verify_initialized(cls) -> bool:
        if hasattr(cls, "instance"):
            return True

        if is_console_log_enabled():
            return False

        debugger.error("Warning: Agiflow not initialized, make sure you call Agiflow.init()")
        return False

    def flush(self):
        self.__span_processor.force_flush()

        if self.__additional_span_processor is not None:
            self.__additional_span_processor.force_flush()

    def wait_for_flush(self):
        if hasattr(self.__span_processor, 'wait_for_flush'):
            self.__span_processor.wait_for_flush()

        if self.__additional_span_processor is not None:
            if hasattr(self.__additional_span_processor, 'wait_for_flush'):
                self.__additional_span_processor.wait_for_flush()

    def get_tracer(self):
        return self.__tracer_provider.get_tracer(TRACER_NAME, __version__)


def init_tracer_provider(resource: Resource, sampler: Optional[Sampler]) -> TracerProvider:
    provider: Optional[TracerProvider] = None
    default_provider: TracerProvider = get_tracer_provider()

    if isinstance(default_provider, ProxyTracerProvider):
        if sampler:
            provider = TracerProvider(resource=resource, sampler=sampler)
        else:
            provider = TracerProvider(resource=resource)

        set_tracer_provider(provider)
    elif not hasattr(default_provider, "add_span_processor"):
        logger.error(
            "Cannot add span processor to the default provider since it doesn't support it"
        )
        return
    else:
        provider = default_provider

    return provider


def init_spans_exporter(api_endpoint: str, headers: Dict[str, str]) -> SpanExporter:
    return OTLPJsonSpanExporter(endpoint=f"{api_endpoint}/v1/traces", headers=headers)
