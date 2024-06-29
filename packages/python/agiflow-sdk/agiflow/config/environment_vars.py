import os


class EnvironmentVars():
    # Sdk initialisation
    AGIFLOW_BASE_URL = os.getenv("AGIFLOW_BASE_URL")
    AGIFLOW_API_KEY = os.getenv("AGIFLOW_API_KEY")
    AGIFLOW_HEADERS = os.getenv("AGIFLOW_HEADERS")
    # Fetch manager config
    AGIFLOW_FETCH_MANAGER_MAX_RETRIES = os.getenv("AGIFLOW_FETCH_MANAGER_MAX_RETRIES", 3)
    AGIFLOW_FETCH_MANAGER_POLLING_INTERVAL = os.getenv("AGIFLOW_FETCH_MANAGER_POLLING_INTERVAL", 5)
    # Set false to stop agiflow sending usage telemetry to posthog
    AGIFLOW_TELEMETRY = os.getenv("AGIFLOW_TELEMETRY", "true")
    # Tracing setting
    AGIFLOW_TRACE_CONTENT = os.getenv("AGIFLOW_TRACE_CONTENT", "true")
    AGIFLOW_TRACING_ENABLED = os.getenv("AGIFLOW_TRACING_ENABLED", "true")
    AGIFLOW_METRICS_ENABLED = os.getenv("AGIFLOW_METRICS_ENABLED", "true")
    # Prevent log printout from console
    AGIFLOW_SUPPRESS_WARNINGS = os.getenv("AGIFLOW_SUPPRESS_WARNINGS", "false")
    '''
    By default, Agiflow use separate trace provider
    to keep traces always sent to server else the feedback will be missing.
    As some host system already implement with opentelemetry, this keep host
    system tracing settings as is while keeping agiflow tracing consistent.
    '''
    AGIFLOW_OTEL_PYTHON_TRACER_PROVIDER_GLOBAL = os.getenv("AGIFLOW_OTEL_PYTHON_TRACER_PROVIDER_GLOBAL", "false")
