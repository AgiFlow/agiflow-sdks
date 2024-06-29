from abc import ABC
from typing import Any, Dict, Literal, Optional, Type, TypeVar, Generic
from agiflow.opentelemetry.convention import SpanAttributes
from opentelemetry.trace import SpanKind, Span
from opentelemetry.trace.status import Status, StatusCode
from agiflow.utils import error_handler
from agiflow.opentelemetry.instrumentation.constants.common import (
    AGIFLOW_ADDITIONAL_SPAN_ATTRIBUTES_KEY,
)
from opentelemetry import baggage
from pydantic import BaseModel
from agiflow.version import __version__


def is_streaming_response(stream):
    if stream is False or stream is None:
        return False
    else:
        return True


R = TypeVar('R')


class AbstractSpanCapture(ABC, Generic[R]):
    """
    To instrument method, we just need to write hooks which shared common properties
    such as span, instance, version, function arguments and key arguments, etc...
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

    def capture_stream_output(self, result: R):
        """
        Synchronously adding trace to span if the function return stream
        """
        pass

    async def acapture_stream_output(self, result: R):
        """
        Asynchronously adding trace to span if the function return stream
        """
        pass

    def is_streaming(self):
        """
        Override stream assertion
        """
        pass

    @staticmethod
    def get_span_name(instance):
        """
        Override span name
        """
        pass

    @staticmethod
    def get_span_kind(instance):
        """
        Override span name
        """
        pass


class BaseSpanCapture(AbstractSpanCapture):
    """
    Store shared props.
    Required to implement hooks to add to trace to span
    """
    version: str
    instance: Any
    span: Span
    fargs: Any
    fkwargs: Any
    pydantic_attributes: Dict[str, Any]

    def __init__(
        self,
        *args,
        version: Optional[str] = '',
        instance: Any = None,
        span,
        **kwargs
    ):
        self.version = version or ''
        self.instance = instance
        self.span = span
        self.fargs = args
        self.fkwargs = kwargs
        self.set_span_attribute(SpanAttributes.AGIFLOW_SDK_NAME, 'agiflow-python-sdk')
        self.set_span_attribute(SpanAttributes.AGIFLOW_SDK_VERSION, __version__)
        extra_attributes: Any = baggage.get_baggage(AGIFLOW_ADDITIONAL_SPAN_ATTRIBUTES_KEY)
        self.pydantic_attributes = extra_attributes if extra_attributes is not None else {}

    def is_streaming(self):
        return is_streaming_response(self.fkwargs.get('stream'))

    @staticmethod
    def get_span_name(instance):
        """
        Override this method if span name is different
        """
        if instance is None:
            return ""
        if hasattr(instance, '__class__'):
            if hasattr(instance, '__name__'):
                return f"{instance.__class__.__name__}.${instance.__name__}"
            else:
                return f"{instance.__class__.__name__}"
        elif hasattr(instance, '__name__'):
            return f"{instance.__name__}"
        else:
            return ""

    @staticmethod
    def get_span_kind(instance):
        """
        Override this method if span kind is different
        """
        return SpanKind.CLIENT

    def set_span_attributes_from_pydantic(self, attributes, Validator: Type[BaseModel]):
        """
        Normalise attributes using pydantic allias
        Using this to set attributes
        """
        validated_attrs = Validator(**{
          **self.pydantic_attributes,
          **attributes,
        })
        for field, value in validated_attrs.model_dump(by_alias=True).items():
            if value is not None:
                self.span.set_attribute(field, value)

    def set_pydantic_attributes(self, attributes: Dict[str, Any]):
        self.pydantic_attributes = {
          **self.pydantic_attributes,
          **attributes,
        }

    def set_span_attribute(self, field, value):
        """
        Using this method to set single attribute
        which field is an enum
        """
        if self.span.is_recording():
            if hasattr(field, 'value'):
                self.span.set_attribute(field.value, value)
            else:
                self.span.set_attribute(field, value)


def method_wrapper(
    tracer,
    span_name: str = '',
    span_kind: Optional[Literal[SpanKind.CLIENT] | str] = None,
    version: Optional[str] = None,
    SpanCapture: type[AbstractSpanCapture] = BaseSpanCapture,
    **okwargs
):
    def traced_method(wrapped, instance, args, kwargs):
        name = span_name or SpanCapture.get_span_name(instance)
        kind = span_kind or SpanCapture.get_span_kind(instance)
        with tracer.start_as_current_span(
            name, kind=kind
        ) as span:
            span_capture = SpanCapture(*args, version=version, instance=instance, span=span, **kwargs, **okwargs)
            if callable(span_capture.capture_input):
                error_handler(lambda: span_capture.capture_input())
            try:
                # Attempt to call the original method
                result = wrapped(*args, **kwargs)
                if callable(span_capture.capture_output):
                    error_handler(lambda: span_capture.capture_output(result))

                span.set_status(StatusCode.OK)
                return result
            except Exception as err:
                # Record the exception in the span
                span.record_exception(err)

                # Set the span status to indicate an error
                span.set_status(Status(StatusCode.ERROR, str(err)))

                # Reraise the exception to ensure it's not swallowed
                raise

    return traced_method


def async_method_wrapper(
    tracer,
    span_name: str = '',
    span_kind: Optional[Literal[SpanKind.CLIENT] | str] = None,
    version: Optional[str] = None,
    SpanCapture: type[AbstractSpanCapture] = BaseSpanCapture,
    **okwargs
):
    async def traced_method(wrapped, instance, args, kwargs):
        name = span_name or SpanCapture.get_span_name(instance)
        kind = span_kind or SpanCapture.get_span_kind(instance)
        with tracer.start_as_current_span(
            name, kind=kind
        ) as span:
            span_capture = SpanCapture(*args, version=version, instance=instance, span=span, **kwargs, **okwargs)
            if callable(span_capture.capture_input):
                error_handler(lambda: span_capture.capture_input())
            try:
                # Attempt to call the original method
                result = await wrapped(*args, **kwargs)
                if callable(span_capture.capture_output):
                    error_handler(lambda: span_capture.capture_output(result))

                span.set_status(StatusCode.OK)
                return result
            except Exception as err:
                # Record the exception in the span
                span.record_exception(err)

                # Set the span status to indicate an error
                span.set_status(Status(StatusCode.ERROR, str(err)))

                # Reraise the exception to ensure it's not swallowed
                raise

    return traced_method


def stream_wrapper(
    tracer,
    span_name: str = '',
    span_kind: Optional[Literal[SpanKind.CLIENT] | str] = None,
    version: Optional[str] = None,
    SpanCapture: type[AbstractSpanCapture] = BaseSpanCapture,
    **okwargs
):
    """
    Manually end span with stream_wrapper
    """

    def traced_method(wrapped, instance, args, kwargs):
        name = span_name or SpanCapture.get_span_name(instance)
        kind = span_kind or SpanCapture.get_span_kind(instance)
        span = tracer.start_span(name, kind=kind)
        span_capture = SpanCapture(*args, version=version, instance=instance, span=span, **kwargs, **okwargs)
        if callable(span_capture.capture_input):
            error_handler(lambda: span_capture.capture_input())
        try:
            # Attempt to call the original method
            result = wrapped(*args, **kwargs)
            is_streaming = False
            if callable(span_capture.is_streaming):
                is_streaming = span_capture.is_streaming()

            if is_streaming:
                # NOTE: need to implement span_end with capture_stream_output
                if callable(span_capture.capture_stream_output):
                    return span_capture.capture_stream_output(result)
                else:
                    return result
            else:
                if callable(span_capture.capture_output):
                    error_handler(lambda: span_capture.capture_output(result))

            if span.is_recording():
                span.set_status(StatusCode.OK)
                span.end()

            return result
        except Exception as err:
            # Record the exception in the span
            span.record_exception(err)

            # Set the span status to indicate an error
            span.set_status(Status(StatusCode.ERROR, str(err)))

            # Reraise the exception to ensure it's not swallowed
            span.end()
            raise

    return traced_method


def async_stream_wrapper(
    tracer,
    span_name: str = '',
    span_kind: Optional[Literal[SpanKind.CLIENT] | str] = None,
    version: Optional[str] = None,
    SpanCapture: type[AbstractSpanCapture] = BaseSpanCapture,
    **okwargs
):
    """
    Wrap the `generate` method of the `Images` class to trace it.
    """

    async def traced_method(wrapped, instance, args, kwargs):
        name = span_name or SpanCapture.get_span_name(instance)
        kind = span_kind or SpanCapture.get_span_kind(instance)
        span = tracer.start_span(name, kind=kind)
        span_capture = SpanCapture(*args, version=version, instance=instance, span=span, **kwargs, **okwargs)
        if callable(span_capture.capture_input):
            error_handler(lambda: span_capture.capture_input())
        try:
            # Attempt to call the original method
            result = await wrapped(*args, **kwargs)
            is_streaming = False
            if callable(span_capture.is_streaming):
                is_streaming = span_capture.is_streaming()

            if is_streaming:
                # NOTE: need to implement span_end with capture_stream_output
                if callable(span_capture.acapture_stream_output):
                    return span_capture.acapture_stream_output(result)
                else:
                    return result
            else:
                if callable(span_capture.capture_output):
                    error_handler(lambda: span_capture.capture_output(result))

            if span.is_recording():
                span.set_status(StatusCode.OK)
                span.end()

            return result
        except Exception as err:
            # Record the exception in the span
            span.record_exception(err)

            # Set the span status to indicate an error
            span.set_status(Status(StatusCode.ERROR, str(err)))

            span.end()
            # Reraise the exception to ensure it's not swallowed
            raise

    return traced_method
