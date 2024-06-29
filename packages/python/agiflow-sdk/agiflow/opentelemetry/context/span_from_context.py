from typing import Any, Optional
from opentelemetry.context import Context
from agiflow.opentelemetry.convention import SpanAttributes
from .context import (
    get_workflow_name,
    get_prompt_settings,
)


def set_workflow_name_from_context(span, context: Optional[Context] = None):
    workflow_name = get_workflow_name(context=context)
    if workflow_name is not None:
        span.set_attribute(SpanAttributes.AGIFLOW_SERVICE_NAME, workflow_name)


def set_prompt_attributes_from_context(span, context: Optional[Context] = None):
    prompt_settings: Any = get_prompt_settings(context=context)
    if prompt_settings is not None:
        for key, value in prompt_settings.items():
            if key == 'key':
                span.set_attribute(SpanAttributes.AGIFLOW_PROMPT_KEY, value)
            if key == 'version':
                span.set_attribute(SpanAttributes.AGIFLOW_PROMPT_VERSION, value)
            if key == 'version_name':
                span.set_attribute(SpanAttributes.AGIFLOW_PROMPT_VERSION_NAME, value)
            if key == 'version_hash':
                span.set_attribute(SpanAttributes.AGIFLOW_PROMPT_VERSION, value)
            if key == 'template_variables':
                span.set_attribute(SpanAttributes.AGIFLOW_PROMPT_TEMPLATE_VARIABLES, value)
