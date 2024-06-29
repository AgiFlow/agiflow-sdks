from typing import Any
import base64
import json
from opentelemetry.trace import Span
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.context import get_current, set_value
from agiflow.opentelemetry.convention import SpanAttributes
from .constants import ContextKeys
from .context import (
    set_association_properties,
    set_prompt_settings_context,
    set_workflow_name,
    set_override_enable_context_tracing,
)
from .span_from_context import (
    set_prompt_attributes_from_context,
    set_workflow_name_from_context,
)


def get_carrier_from_trace_context():
    carrier = {}
    context = get_current()
    TraceContextTextMapPropagator().inject(carrier)
    carrier[ContextKeys.ASSOCIATION_PROPERTIES] = context.get(ContextKeys.ASSOCIATION_PROPERTIES, {})
    carrier[ContextKeys.PROMPT_SETTINGS] = context.get(ContextKeys.PROMPT_SETTINGS, {})
    carrier[ContextKeys.WORKFLOW_NAME] = context.get(ContextKeys.WORKFLOW_NAME, {})
    carrier[ContextKeys.OVERRIDE_ENABLE_CONTENT_TRACING] = context.get(ContextKeys.OVERRIDE_ENABLE_CONTENT_TRACING, {})
    return carrier


def get_trace_context_from_carrier(carrier):
    ctx = TraceContextTextMapPropagator().extract(carrier)
    if carrier is not None:
        if carrier.get(ContextKeys.ASSOCIATION_PROPERTIES):
            ctx = set_value(ContextKeys.ASSOCIATION_PROPERTIES, carrier.get(ContextKeys.ASSOCIATION_PROPERTIES), ctx)
        if carrier.get(ContextKeys.PROMPT_SETTINGS):
            ctx = set_value(ContextKeys.PROMPT_SETTINGS, carrier.get(ContextKeys.PROMPT_SETTINGS), ctx)
        if carrier.get(ContextKeys.WORKFLOW_NAME):
            ctx = set_value(ContextKeys.WORKFLOW_NAME, carrier.get(ContextKeys.WORKFLOW_NAME), ctx)
        if carrier.get(ContextKeys.OVERRIDE_ENABLE_CONTENT_TRACING):
            ctx = set_value(
              ContextKeys.OVERRIDE_ENABLE_CONTENT_TRACING,
              carrier.get(ContextKeys.OVERRIDE_ENABLE_CONTENT_TRACING),
              ctx
            )
    return ctx


def extract_association_properties_from_http_headers(headers: Any):
    if hasattr(headers, 'get'):
        association_properties = {}
        # old method to get trace as string
        action_id = headers.get('x-agiflow-action-id')
        # New method to get trace as base64 encoding json
        trace_id = headers.get('x-agiflow-trace-id')
        auto_trace = headers.get('x-agiflow-auto-trace')
        task_id = None
        task_started_at = None
        task_name = None
        session_id = None

        if trace_id is not None:
            trace_string = base64.b64decode(trace_id)
            trace_obj = json.loads(trace_string)

            if trace_obj is not None:
                if trace_obj.get('id'):
                    action_id = trace_obj.get('id')
                if trace_obj.get('taskId'):
                    task_id = trace_obj.get('taskId')
                if trace_obj.get('taskName'):
                    task_name = trace_obj.get('taskName')
                if trace_obj.get('taskStartedAt'):
                    task_started_at = trace_obj.get('taskStartedAt')
                if trace_obj.get('sessionId'):
                    session_id = trace_obj.get('sessionId')

        if action_id is not None:
            association_properties['action_id'] = action_id

        if task_id is not None:
            association_properties['task_id'] = task_id

        if task_name is not None:
            association_properties['task_name'] = task_name

        if task_started_at is not None:
            association_properties['task_started_at'] = task_started_at

        if session_id is not None:
            association_properties['session_id'] = session_id

        if auto_trace is not None and auto_trace.lower() == 'true':
            association_properties['auto_trace'] = True

        return association_properties
    else:
        return {}


def apply_context_to_trace_span(
    span: Span,
    context: Any,
    prompt_settings_config=None,
    association_properties_config=None
):
    prompt_settings = None
    association_properties = None
    # Restore context from carrier and apply context to current span attributes
    if context is not None and hasattr(context, 'get'):
        association_properties = context.get(ContextKeys.ASSOCIATION_PROPERTIES)
        prompt_settings = context.get(ContextKeys.PROMPT_SETTINGS)

        workflow_name = context.get(ContextKeys.WORKFLOW_NAME)
        if workflow_name is not None:
            set_workflow_name(workflow_name)
            set_workflow_name_from_context(span)

        content_tracing = context.get(ContextKeys.OVERRIDE_ENABLE_CONTENT_TRACING)
        if content_tracing is not None:
            set_override_enable_context_tracing(content_tracing)

    if prompt_settings_config is not None:
        prompt_settings = prompt_settings_config

    if association_properties_config is not None:
        association_properties = association_properties_config

    if prompt_settings is not None:
        set_prompt_settings_context(prompt_settings)
        set_prompt_attributes_from_context(span)

    if association_properties is not None:
        set_association_properties(association_properties)
        for key, value in association_properties.items():
            span.set_attribute(
              f"{SpanAttributes.AGIFLOW_ASSOCIATION_PROPERTIES}.{key}",
              value
            )
