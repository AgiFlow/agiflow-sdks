from typing import Optional
from opentelemetry.context import Context, attach, set_value, get_value
from .constants import ContextKeys, PromptSettings, AssociationProperties


def set_association_properties(properties: AssociationProperties) -> None:
    attach(set_value(ContextKeys.ASSOCIATION_PROPERTIES, properties))


def set_workflow_name(workflow_name: str) -> None:
    attach(set_value(ContextKeys.WORKFLOW_NAME, workflow_name))


def set_prompt_settings_context(
    prompt_settings: PromptSettings
) -> None:
    if prompt_settings is not None:
        attach(set_value(ContextKeys.PROMPT_SETTINGS, prompt_settings))


def set_override_enable_context_tracing(val: bool) -> None:
    attach(set_value(ContextKeys.WORKFLOW_NAME, val))


def get_workflow_name(context: Optional[Context] = None):
    return get_value(ContextKeys.WORKFLOW_NAME, context=context)


def get_correlation_id():
    return get_value(ContextKeys.CORRELATION_ID)


def get_association_properties(context: Optional[Context] = None):
    return get_value(ContextKeys.ASSOCIATION_PROPERTIES, context)


def get_prompt_settings(context: Optional[Context] = None):
    return get_value(ContextKeys.PROMPT_SETTINGS, context)
