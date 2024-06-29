from typing import Optional, Unpack
from opentelemetry.trace import SpanKind

from agiflow.opentelemetry.convention import SpanAttributes, AgiflowServiceTypes

from agiflow.opentelemetry.context import set_workflow_name
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


class WorkflowSpanCapture(BaseSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        workflow_name = self.name or self.instance.__name__
        set_workflow_name(workflow_name)

    def capture_input(self):
        super().capture_input()
        self.set_span_attribute(
            SpanAttributes.AGIFLOW_SERVICE_TYPE, self.service_type
        )


def workflow(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    if method_name is None:
        return decorate_method(
          name=name,
          tlp_service_type=AgiflowServiceTypes.WORKFLOW,
          span_kind=span_kind,
          SpanCapture=WorkflowSpanCapture,
          flush_on_exit=True,
          **kwargs
          )
    else:
        return decorate_class_method(
          name=name,
          tlp_service_type=AgiflowServiceTypes.WORKFLOW,
          span_kind=span_kind,
          SpanCapture=WorkflowSpanCapture,
          flush_on_exit=True,
          **kwargs
          )


def aworkflow(
    name: Optional[str] = None,
    method_name: Optional[str] = None,
    span_kind=SpanKind.INTERNAL,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    if method_name is None:
        return adecorate_method(
          name=name,
          tlp_service_type=AgiflowServiceTypes.WORKFLOW,
          span_kind=span_kind,
          SpanCapture=WorkflowSpanCapture,
          flush_on_exit=True,
          **kwargs
          )
    else:
        return adecorate_class_method(
          name=name,
          tlp_service_type=AgiflowServiceTypes.WORKFLOW,
          span_kind=span_kind,
          SpanCapture=WorkflowSpanCapture,
          flush_on_exit=True,
          **kwargs
        )
