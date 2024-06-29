from typing import TypedDict, NotRequired


class PromptSettings(TypedDict):
    key: NotRequired[str]
    version: NotRequired[str]
    version_name: NotRequired[str]
    version_hash: NotRequired[str]
    template_variables: NotRequired[dict]


class AssociationProperties(TypedDict):
    # The action_id is passed by client to associate with a trace
    # inside x-agiflow-trace-id base64 encoding
    # NOTE: If there is no action_id provded, it will default to trace_id
    action_id: NotRequired[str]
    # This is passed via client with auto_trace inside x-agiflow-trace-id
    # NOTE: For server usage only, you can set task_id to group multiple traces together
    # as a single feedback task (else each trace is a task)
    task_id: NotRequired[str]
    task_name: NotRequired[str]
    task_started_at: NotRequired[str]
    # You don't need to set session if you are using client-sdk
    # NOTE: For server usage only, you can set session_id to group traces together
    session_id: NotRequired[str]
    # You don't need to set session if you are using client-sdk
    # NOTE For server usage only, you can set user_id to associate trace with user
    user_id: NotRequired[str]
    # If client is configured for auto-trace
    # This is passed by client via x-agiflow-auto-trace
    auto_trace: NotRequired[bool]


class ContextKeys:
    CORRELATION_ID = "correlation_id"
    ASSOCIATION_PROPERTIES = "association_properties"
    WORKFLOW_NAME = "workflow_name"
    # Prompts
    PROMPT_SETTINGS = "prompt_settings"

    # Toggle flag
    OVERRIDE_ENABLE_CONTENT_TRACING = "override_enable_content_tracing"
