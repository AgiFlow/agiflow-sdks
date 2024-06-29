from abc import ABC
from functools import wraps
import logging
from typing import Any, Dict, Optional, TypeVar, Generic, Unpack
from agiflow.opentelemetry.convention import SpanAttributes
from agiflow.opentelemetry.convention.agiflow_attributes import AgiflowSpanAttributes
from agiflow.opentelemetry.convention.constants import AgiflowServiceTypes
from opentelemetry.trace import Span, SpanKind, Status, StatusCode
from agiflow.opentelemetry.instrumentation.constants.common import (
    AGIFLOW_ADDITIONAL_SPAN_ATTRIBUTES_KEY,
)
from opentelemetry import baggage
from agiflow.version import __version__
from agiflow.opentelemetry.tracing import get_tracer, TracerWrapper
from agiflow.opentelemetry.utils import (
    should_send_prompts,
)
from agiflow.opentelemetry.context import (
    get_trace_context_from_carrier,
    apply_context_to_trace_span,
)
from agiflow.utils import (
  serialise_to_json,
  camel_to_snake
)
from .helper import (
    SharedKwargsWithHooks,
)

R = TypeVar('R')
logger = logging.getLogger(__name__)


class AbstractSpanCapture(ABC, Generic[R]):
    """
    To instrument method, we just need to write hooks which shared common properties
    such as span, instance, configs, function arguments and key arguments, etc...
    """
    def capture_input(self):
        """
        Setting span attributes is alway synchronous.
        This method is use to set span attributes before the
        actual function is called.
        """
        pass

    def capture_output(self, result: R):
        """
        Setting span attributes is alway synchronous.
        This method is use to set span attributes after the
        actual function is called with result.
        """
        pass

    @staticmethod
    def get_service_type():
        """
        Override span name
        """
        pass

    @staticmethod
    def get_span_name(
        name: Optional[str] = None,
        tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
        instance: Any = None,
    ):
        """
        Override span name
        """
        pass


class BaseSpanCapture(AbstractSpanCapture):
    """
    Store shared props.
    Required to implement hooks to add to trace to span
    """
    span: Span
    service_type: Optional[AgiflowServiceTypes]
    args: Any
    kwargs: Any
    config: SharedKwargsWithHooks
    instance: Any
    context: Any
    pydantic_attributes: Dict[str, Any]
    name: Optional[str]

    def __init__(
        self,
        *args,
        name: Optional[str] = None,
        service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
        span,
        instance=None,
        context=None,
        config: SharedKwargsWithHooks,
        **kwargs
    ):
        self.span = span
        self.args = args
        self.kwargs = kwargs
        self.config = config
        self.name = name
        self.service_type = service_type
        self.instance = instance
        self.context = context
        self.set_span_attribute(SpanAttributes.AGIFLOW_SDK_NAME, 'agiflow-python-sdk')
        self.set_span_attribute(SpanAttributes.AGIFLOW_SDK_VERSION, __version__)
        self.set_span_attribute(SpanAttributes.AGIFLOW_SERVICE_NAME, name)
        extra_attributes: Any = baggage.get_baggage(AGIFLOW_ADDITIONAL_SPAN_ATTRIBUTES_KEY)
        self.pydantic_attributes = extra_attributes if extra_attributes is not None else {}

    @staticmethod
    def get_span_name(
        name: Optional[str] = None,
        tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
        instance: Any = None,
    ):
        service_type = tlp_service_type or BaseSpanCapture.get_service_type()

        span_name = (
            f"{name}.{service_type}"
            if name
            else f"{instance.__name__}.{service_type}"
        )
        return span_name, service_type

    @staticmethod
    def get_service_type():
        """
        Override this method if span kind is different
        """
        return AgiflowServiceTypes.TASK

    def set_span_attribute(self, field, value):
        """
        Using this method to set single attribute
        which field is an enum
        """
        if value is not None and self.span.is_recording():
            if hasattr(field, 'value'):
                self.span.set_attribute(field.value, value)
            else:
                self.span.set_attribute(field, value)

    def capture_input(self):
        if self.name:
            self.set_span_attribute(SpanAttributes.AGIFLOW_ENTITY_NAME, self.name)

        prompt_settings = None
        association_properties = None

        self.set_span_attribute(
          AgiflowSpanAttributes.AGIFLOW_ENTITY_DESCRIPTION,
          self.config.get('description')
        )

        prompt_settings_config = self.config.get('prompt_settings')
        if prompt_settings_config is not None:
            if callable(prompt_settings_config):
                prompt_settings = prompt_settings_config(*self.args, **self.kwargs)
            else:
                prompt_settings = prompt_settings_config

        association_properties_config = self.config.get('association_properties')
        if association_properties_config is not None:
            if callable(association_properties_config):
                association_properties: Any = association_properties_config(*self.args, **self.kwargs)
            else:
                association_properties = association_properties_config

        apply_context_to_trace_span(
          self.span,
          self.context,
          prompt_settings_config=prompt_settings,
          association_properties_config=association_properties,
        )

        try:
            if should_send_prompts():
                input = ''
                input_serializer = self.config.get('input_serializer')

                if input_serializer is not None and callable(input_serializer):
                    input = input_serializer(*self.args, **self.kwargs)
                else:
                    input = serialise_to_json({"args": self.args, "kwargs": self.kwargs})

                if not isinstance(input, str):
                    input = serialise_to_json(input)

                self.set_span_attribute(
                    SpanAttributes.AGIFLOW_ENTITY_INPUT,
                    input,
                )
        except TypeError as e:
            logger.error(e)

    def capture_output(self, result):
        try:
            if should_send_prompts():
                output = ''
                output_serializer = self.config.get('output_serializer')
                if output_serializer is not None and callable(output_serializer):
                    output = output_serializer(*self.args, result=result, **self.kwargs)
                if result is not None:
                    if not output_serializer:
                        output = serialise_to_json(result)

                if not isinstance(output, str):
                    output = serialise_to_json(result)

                self.set_span_attribute(
                    SpanAttributes.AGIFLOW_ENTITY_OUTPUT,
                    output,
                )

        except TypeError as e:
            logger.error(e)


def decorate_method(
    name: Optional[str] = None,
    tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
    span_kind=SpanKind.INTERNAL,
    SpanCapture=BaseSpanCapture,
    flush_on_exit=False,
    **config: Unpack[SharedKwargsWithHooks]
):
    def decorate(fn):
        @wraps(fn)
        def wrap(*args, **kwargs):
            if not TracerWrapper.verify_initialized():
                return fn(*args, **kwargs)

            span_name, service_type = SpanCapture.get_span_name(
              name=name,
              tlp_service_type=tlp_service_type,
              instance=fn
              )

            context_parser = config.get('context_parser')
            context = None
            if context_parser is not None and callable(context_parser):
                carrier = context_parser(*args, **kwargs)
                context = get_trace_context_from_carrier(carrier)

            with get_tracer(flush_on_exit=flush_on_exit) as tracer:
                with tracer.start_as_current_span(span_name, kind=span_kind, context=context) as span:
                    span_capture = SpanCapture(
                      *args,
                      name=name,
                      service_type=service_type,
                      span=span,
                      instance=fn,
                      config=config,
                      context=context,
                      **kwargs)

                    if hasattr(span_capture, 'capture_input') and callable(span_capture.capture_input):
                        span_capture.capture_input()

                    try:
                        res = fn(*args, **kwargs)

                        if hasattr(span_capture, 'capture_output') and callable(span_capture.capture_output):
                            span_capture.capture_output(res)

                        if span.is_recording():

                            span.set_status(StatusCode.OK)

                        return res

                    except Exception as err:
                        # Record the exception in the span
                        span.record_exception(err)

                        # Set the span status to indicate an error
                        span.set_status(Status(StatusCode.ERROR, str(err)))

                        # Reraise the exception to ensure it's not swallowed
                        raise

        return wrap

    return decorate


def adecorate_method(
    name: Optional[str] = None,
    tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
    span_kind=SpanKind.INTERNAL,
    SpanCapture=BaseSpanCapture,
    flush_on_exit=False,
    **config: Unpack[SharedKwargsWithHooks]
):
    def decorate(fn):
        @wraps(fn)
        async def wrap(*args, **kwargs):
            if not TracerWrapper.verify_initialized():
                return fn(*args, **kwargs)

            span_name, service_type = SpanCapture.get_span_name(
              name=name,
              tlp_service_type=tlp_service_type,
              instance=fn
              )

            context_parser = config.get('context_parser')
            context = None
            if context_parser is not None and callable(context_parser):
                carrier = context_parser(*args, **kwargs)
                context = get_trace_context_from_carrier(carrier)

            with get_tracer(flush_on_exit=flush_on_exit) as tracer:
                with tracer.start_as_current_span(span_name, kind=span_kind, context=context) as span:
                    span_capture = SpanCapture(
                      *args,
                      name=name,
                      service_type=service_type,
                      span=span,
                      instance=fn,
                      config=config,
                      context=context,
                      **kwargs)

                    if hasattr(span_capture, 'capture_input') and callable(span_capture.capture_input):
                        span_capture.capture_input()

                    try:
                        res = await fn(*args, **kwargs)

                        if hasattr(span_capture, 'capture_output') and callable(span_capture.capture_output):
                            span_capture.capture_output(res)

                        if span.is_recording():
                            span.set_status(StatusCode.OK)

                        return res

                    except Exception as err:
                        # Record the exception in the span
                        span.record_exception(err)

                        # Set the span status to indicate an error
                        span.set_status(Status(StatusCode.ERROR, str(err)))

                        # Reraise the exception to ensure it's not swallowed
                        raise

        return wrap

    return decorate


def decorate_class_method(
    name: Optional[str],
    method_name: str,
    tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
    span_kind=SpanKind.INTERNAL,
    SpanCapture=BaseSpanCapture,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    def decorator(cls):
        task_name = name if name else camel_to_snake(cls.__name__)
        method = getattr(cls, method_name)
        setattr(
            cls,
            method_name,
            decorate_method(
              name=task_name,
              tlp_service_type=tlp_service_type,
              span_kind=span_kind,
              SpanCapture=SpanCapture,
              flush_on_exit=flush_on_exit,
              **kwargs
              )(method),
        )
        return cls

    return decorator


def adecorate_class_method(
    name: Optional[str],
    method_name: str,
    tlp_service_type: Optional[AgiflowServiceTypes] = AgiflowServiceTypes.TASK,
    span_kind=SpanKind.INTERNAL,
    SpanCapture=BaseSpanCapture,
    flush_on_exit=False,
    **kwargs: Unpack[SharedKwargsWithHooks]
):
    def decorator(cls):
        task_name = name if name else camel_to_snake(cls.__name__)
        method = getattr(cls, method_name)
        setattr(
            cls,
            method_name,
            adecorate_method(
              name=task_name,
              tlp_service_type=tlp_service_type,
              span_kind=span_kind,
              SpanCapture=SpanCapture,
              flush_on_exit=flush_on_exit,
              **kwargs
              )(method),
        )
        return cls

    return decorator
