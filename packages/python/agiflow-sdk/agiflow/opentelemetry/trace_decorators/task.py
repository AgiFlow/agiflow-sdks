from typing import Optional, Unpack
from opentelemetry.trace import SpanKind

from agiflow.opentelemetry.convention import SpanAttributes, AgiflowServiceTypes

from .helper import (
    SharedKwargsWithHooks,
)
from .wrapper import (
    BaseSpanCapture,
    decorate_method,
    decorate_class_method,
    adecorate_method,
    adecorate_class_method,
)


class TaskSpanCapture(BaseSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def capture_input(self):
        super().capture_input()
        self.set_span_attribute(
            SpanAttributes.AGIFLOW_SERVICE_TYPE, self.service_type
        )


def task(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    if method_name is None:
        return decorate_method(
            name=name,
            tlp_service_type=tlp_service_type,
            span_kind=span_kind,
            SpanCapture=TaskSpanCapture,
            flush_on_exit=flush_on_exit,
            **kwargs
        )
    else:
        return decorate_class_method(
            name=name,
            method_name=method_name,
            tlp_service_type=tlp_service_type,
            span_kind=span_kind,
            SpanCapture=TaskSpanCapture,
            flush_on_exit=flush_on_exit,
            **kwargs
        )


# Async Decorators
def atask(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    if method_name is None:
        return adecorate_method(
          name=name,
          tlp_service_type=tlp_service_type,
          span_kind=span_kind,
          SpanCapture=TaskSpanCapture,
          flush_on_exit=flush_on_exit,
          **kwargs
          )
    else:
        return adecorate_class_method(
          name=name,
          method_name=method_name,
          tlp_service_type=tlp_service_type,
          span_kind=span_kind,
          SpanCapture=TaskSpanCapture,
          flush_on_exit=flush_on_exit,
          **kwargs
        )


def agent(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    return task(
      name=name,
      method_name=method_name,
      tlp_service_type=AgiflowServiceTypes.AGENT,
      span_kind=span_kind,
      flush_on_exit=flush_on_exit,
      **kwargs
    )


def tool(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    return task(
      name=name,
      method_name=method_name,
      tlp_service_type=AgiflowServiceTypes.TOOL,
      span_kind=span_kind,
      flush_on_exit=flush_on_exit,
      **kwargs
    )


def aagent(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    return atask(
      name=name,
      method_name=method_name,
      tlp_service_type=AgiflowServiceTypes.AGENT,
      span_kind=span_kind,
      flush_on_exit=flush_on_exit,
      **kwargs
    )


def atool(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    return atask(
      name=name,
      method_name=method_name,
      tlp_service_type=AgiflowServiceTypes.TOOL,
      span_kind=span_kind,
      flush_on_exit=flush_on_exit,
      **kwargs
    )
