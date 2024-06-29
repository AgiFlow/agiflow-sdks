import sys

from typing import Any, Optional, Dict
from opentelemetry.sdk.trace import SpanProcessor
from opentelemetry.sdk.trace.export import SpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, SERVICE_VERSION, TELEMETRY_SDK_NAME, TELEMETRY_SDK_VERSION
from opentelemetry.sdk.trace.sampling import Sampler
from opentelemetry.util.re import parse_env_headers
from opentelemetry.propagators.textmap import TextMapPropagator

from agiflow.opentelemetry.context.constants import PromptSettings
from agiflow.opentelemetry.convention import SpanAttributes
from agiflow.opentelemetry.types import DisableInstrumentations
from agiflow.opentelemetry.trace_store import get_current_span
from agiflow.telemetry import Telemetry
from agiflow.utils import Debugger
from agiflow.config import (
    is_content_tracing_enabled,
    is_tracing_enabled,
    API_ENDPOINT,
    EnvironmentVars,
    SDK_NAME
)
from agiflow.services.fetch import Fetcher
from agiflow.opentelemetry.tracing.tracing import (
    TracerWrapper,
)
from agiflow.opentelemetry.context import (
    set_association_properties,
    set_prompt_settings_context,
    AssociationProperties,
)
from agiflow.version import __version__

debugger = Debugger(__name__)


class Agiflow:
    __tracer_wrapper: TracerWrapper
    __fetcher: Fetcher

    @staticmethod
    def init(
        app_name: Optional[str] = sys.argv[0],
        app_version: Optional[str] = None,
        api_endpoint: str = API_ENDPOINT,
        api_key: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
        exporter: Optional[SpanExporter] = None,
        resource_attributes: dict = {},
        disable_instrumentations: Optional[DisableInstrumentations] = None,
        propagator: Optional[TextMapPropagator] = None,
        Processor: Optional[type[SpanProcessor]] = None,
        additional_processor: Optional[SpanProcessor] = None,
        sampler: Optional[Sampler] = None,
    ) -> None:
        Telemetry()

        api_endpoint = EnvironmentVars.AGIFLOW_BASE_URL or api_endpoint
        api_key = EnvironmentVars.AGIFLOW_API_KEY or api_key

        headersConf = Agiflow.get_header(headers)
        if not exporter and headersConf:
            debugger.info(f"Agiflow exporting traces to {api_endpoint}, authenticating with custom headers")

        if api_key and not exporter and not headersConf:
            debugger.info(f"Agiflow exporting traces to {api_endpoint} authenticating with bearer token")
            headersConf = {
                "Authorization": f"Bearer {api_key}",
            }

        if api_key:
            Agiflow.__fetcher = Fetcher(base_url=api_endpoint, api_key=api_key)

        if not is_tracing_enabled():
            debugger.warn("Tracing is disabled")
            return

        enable_content_tracing = is_content_tracing_enabled()

        # Tracer init
        resource_attributes.update({
          SERVICE_NAME: app_name,
          SERVICE_VERSION: app_version or '',
          TELEMETRY_SDK_NAME: SDK_NAME,
          TELEMETRY_SDK_VERSION: __version__,
        })
        TracerWrapper.set_static_params(
            resource_attributes, enable_content_tracing, api_endpoint, headersConf
        )
        Agiflow.__tracer_wrapper = TracerWrapper(
            disable_instrumentations=disable_instrumentations,
            Processor=Processor,
            additional_processor=additional_processor,
            propagator=propagator,
            exporter=exporter,
            sampler=sampler
        )

    @staticmethod
    def get_header(headers: Optional[Dict[str, str]]):
        headersConf: Any = EnvironmentVars.AGIFLOW_HEADERS or headers or {}

        if isinstance(headersConf, str):
            headersConf = parse_env_headers(headersConf)

        return headersConf

    @staticmethod
    def set_association_properties(properties: AssociationProperties) -> None:
        set_association_properties(properties)

    @staticmethod
    def set_prompt_settings(properties: PromptSettings) -> None:
        set_prompt_settings_context(properties)

    @staticmethod
    def report_score(
        id: Optional[str],
        score: float,
    ):
        """Apply score to all llm steps belongs to action
        id: action_id or unique id linked by associate_trace method
        """
        if not Agiflow.__fetcher:
            debugger.error("Set the AGIFLOW_API_KEY environment variable to the key")
            return

        Agiflow.__fetcher.patch(
            f"actions/{id}/score",
            {
                "score": score,
            },
        )

    @staticmethod
    def associate_trace(id: str, span_id: Optional[str]):
        """Associate trace and space with a unique id
        id: unique id linked with trace
        span_id: unique id linked with span
        """
        span = get_current_span()
        span.set_attribute(
          f"{SpanAttributes.AGIFLOW_ASSOCIATION_PROPERTIES}.trace_alias",
          id
        )
        if span_id:
            span.set_attribute(
              f"{SpanAttributes.AGIFLOW_ASSOCIATION_PROPERTIES}.span_alias",
              span_id
            )

    @staticmethod
    def update_span(id: str, body: Dict[str, str]):
        """Update span value with data if processed asynchronously
        id: span_id or unique id linked with span
        """
        if not Agiflow.__fetcher:
            debugger.error("Set the AGIFLOW_API_KEY environment variable to the key")
            return

        Agiflow.__fetcher.patch(
            f"steps/{id}",
            body,
        )


__all__ = [
  'Agiflow'
]
