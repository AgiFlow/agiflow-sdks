"""
Using own TracerProvider store to send all LLM traces
"""

import typing
from logging import getLogger
from typing import Optional, cast

from opentelemetry.trace import TracerProvider, ProxyTracerProvider
from opentelemetry.util._once import Once
from opentelemetry.trace.propagation import (
    get_current_span,
)
from agiflow.config import is_using_global_provider

logger = getLogger(__name__)


_AGIFLOW_TRACER_PROVIDER_SET_ONCE = Once()
_AGIFLOW_TRACER_PROVIDER: Optional[TracerProvider] = None
_AGIFLOW_PROXY_TRACER_PROVIDER = ProxyTracerProvider()


def get_tracer(
    instrumenting_module_name: str,
    instrumenting_library_version: typing.Optional[str] = None,
    tracer_provider: Optional[TracerProvider] = None,
    schema_url: typing.Optional[str] = None,
):
    """Returns a `Tracer` for use by the given instrumentation library.

    This function is a convenience wrapper for
    opentelemetry.trace.TracerProvider.get_tracer.

    If tracer_provider is omitted the current configured one is used.
    """
    if tracer_provider is None:
        tracer_provider = get_tracer_provider()
    return tracer_provider.get_tracer(
        instrumenting_module_name, instrumenting_library_version, schema_url
    )


def _set_tracer_provider(tracer_provider: TracerProvider, log: bool) -> None:
    def set_tp() -> None:
        global _AGIFLOW_TRACER_PROVIDER  # pylint: disable=global-statement
        _AGIFLOW_TRACER_PROVIDER = tracer_provider

    did_set = _AGIFLOW_TRACER_PROVIDER_SET_ONCE.do_once(set_tp)

    if log and not did_set:
        logger.warning("Overriding of current TracerProvider is not allowed")


def set_tracer_provider(tracer_provider: TracerProvider) -> None:
    """Sets the current global :class:`~.TracerProvider` object.

    This can only be done once, a warning will be logged if any further attempt
    is made.
    """
    if is_using_global_provider():
        from opentelemetry import trace
        trace.set_tracer_provider(tracer_provider)
    else:
        _set_tracer_provider(tracer_provider, log=True)


def get_tracer_provider() -> TracerProvider:
    """Gets the current global :class:`~.TracerProvider` object."""
    if is_using_global_provider():
        from opentelemetry import trace
        return trace.get_tracer_provider()

    if _AGIFLOW_TRACER_PROVIDER is None:
        return _AGIFLOW_PROXY_TRACER_PROVIDER

    # _AGIFLOW_TRACER_PROVIDER will have been set by one thread
    return cast('TracerProvider', _AGIFLOW_TRACER_PROVIDER)


__all__ = [
    "TracerProvider",
    "get_tracer",
    "get_tracer_provider",
    "set_tracer_provider",
    "get_current_span"
]
