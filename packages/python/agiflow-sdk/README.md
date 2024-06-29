# [agiflow-sdk](https://docs.agiflow.io/python) Documentation

## Overview

Welcome to the `agiflow-sdk` documentation. This guide will help you integrate with the Agiflow Python SDK quickly and easily. The SDK provides automatic and manual tracing capabilities for LLM apis and frameworks, as well as helpers to interact with backend APIs.

## Installation

You can install the `agiflow-sdk` using either `pip` or `poetry`.

```sh
pip install agiflow-sdk
```

## SDK Overview

The `agiflow-sdk` offers the following functionalities:
- Automatic tracing with `Open Telemetry`.
- Decorators for manual tracing.
- Helpers to interact with backend APIs.

## Setting Up the SDK

Initialize the `agiflow-sdk` client at the entry point of your application:

```python
from agiflow import Agiflow

Agiflow.init(
  app_name="<YOUR_APP_NAME>",
  api_key="<AGIFLOW_API_KEY>" # Or set AGIFLOW_API_KEY environment variable
)
```

You can find the API key on the `Environment > Settings > API Key` page on the [Agiflow Dashboard](https://app.agiflow.io).

Once set up, if you run your backend application with supported LLM frameworks, traces should be logged on the Agiflow dashboard under `Environment > Logs`.

### Environment Variables

- **AGIFLOW_BASE_URL**: Set this to your self-hosted endpoint if using Agiflow with Docker Compose for local development or self-hosting.
- **AGIFLOW_API_KEY**: Switch API keys per environment.

NOTE: Agiflow uses a separate global Open Telemetry trace provider to ensure all LLM traces are sent to support user feedback. To use the default Open Telemetry global trace provider, set the `AGIFLOW_OTEL_PYTHON_TRACER_PROVIDER_GLOBAL` environment variable to `true`.

## Tracing

Traces are automatically logged when you set up Agiflow at the top of your application. By default, these traces are limited to backend applications and are not synchronized with frontend tracking.

### Libraries with Automatic Tracing

- **Anthropic**
- **Chromadb**
- **Cohere**
- **CrewAI**
- **GROQ**
- **Langchain**
- **Langgraph**
- **Llamaindex**
- **Openai**
- **Pinecone**
- **Qdrant**
- **Weaviate**

### Trace Association

#### Backend Only

If you haven't integrated with the frontend SDK, you can still associate Open Telemetry trace with user and session using the following method:

```python
from agiflow import Agiflow

Agiflow.set_association_properties({
  "user_id": "<USER_ID>", # Optional
  "session_id": "<SESSION_ID>", # Optional
  "task_name": "<TASK_NAME>", # Optional, to label feedback task
});
```

#### Backend with @agiflow/js-sdk installed on frontend

If you have set up frontend tracing for [Web](../../libraries/web/tracing), your backend should have access to `x-agiflow-trace-id` in the HTTP headers.

Use our header to associate frontend tracing with Open Telemetry tracing as follows:

```python
from agiflow import Agiflow
from agiflow.opentelemetry import extract_association_properties_from_http_headers

Agiflow.set_association_properties(extract_association_properties_from_http_headers(request.headers))
```

#### Explanation of `set_association_properties`

- This helper enhances the trace context by adding association properties metadata to the traces.
- With manual tracing on the frontend, this will add `action_id` to the trace context.
- With automatic tracing on the frontend, this will add `action_id`, `task_id`, and `session_id` to the trace context.

### Trace Annotation and Grouping

You might want to log additional information that is important to your AI workflow or for tools that are not supported by Agiflow yet. In these cases, use manual tracing to add this information. These decorators support the following arguments:

- **name**: Span label.
- **method_name**: Method of the class to be decorated.
- **description**: Add extra comments to make it easier for others to review the workflow and provide feedback.
- **prompt_settings**: Associate LLM calls with a specific version of the prompt.
- **input_serializer**: Format the input to make it easier for the end user to read.
- **output_serializer**: Format the output to make it easier for the end user to read.
- **context_parser**: Restore trace context from distributed messages.

#### Workflow

Trace the workflow with a unique name and extra information using the following methods:

```python
from agiflow.opentelemetry import aworkflow

@aworkflow(name="<WORKFLOW_NAME>", method_name="bar")
class Foo:
    async def bar(self):
        ...
```

#### Task

Trace the task with a unique name and extra information using the following methods:

```python
from agiflow.opentelemetry import atask

@atask(name="<TASK_NAME>", method_name="bar")
class Foo:
    async def bar(self):
        ...
```

#### Agent

Trace the agent with a unique name and extra information using the following methods:

```python
from agiflow.opentelemetry import aagent

@aagent(name="<AGENT_NAME>", method_name="bar")
class Foo:
    async def bar(self):
        ...
```

#### Tool

Trace the tool with a unique name and extra information using the following methods:

```python
from agiflow.opentelemetry import atool

@atool(name="<TOOL_NAME>", method_name="bar")
class Foo:
    async def bar(self):
        ...
```

### Distributed Tracing

If you are using an event-driven architecture, additional steps are required to enable trace flow throughout the workflow.

#### Producer Side

Extract the current trace context and pass it to the message queue system as follows:

```python
from agiflow.opentelemetry import get_carrier_from_trace_context

carrier = get_carrier_from_trace_context()
# Pass carrier information to the message queue
kafkaClient.produce({
  ...
  "otlp_carrier": carrier,
})
```

#### Consumer Side

Retrieve the `carrier` information from the message and restore the context from the carrier information:

```python
from agiflow.opentelemetry import get_trace_context_from_carrier, get_tracer

carrier = message.get("otlp_carrier")
ctx = get_trace_context_from_carrier(carrier)
with get_tracer() as tracer:
    with tracer.start_as_current_span('job', ctx):
        ...
```

The `children span` uses the same context and `parent span`, so you don't need to pass context around. Traces from the consumer will use the same context as the producer.

For `HTTP` microservice architecture, OpenTelemetry will automatically pass the `carrier` via `traceparent` headers and restore the context.

#### Span Update

In an event-driven architecture, the parent span may not have the output on completion. This can make it difficult for reviewers to understand the workflow context. To address this, associate the `span_id` with your unique identifier (e.g., database row ID) using this method:

```python
agiflow.associate_trace(
    id, # Unique ID linked to trace_id
    span_id # Unique ID linked to span_id
);
```

Then update the span using your database ID:

```python
agiflow.update_span(
    id, # Unique ID linked to span_id
    {
    "output": "...',
    }
);
```

## User Feedback

Agiflow supports adding user feedback via the backend API. Here is how to do it:

### Inline Feedback

To provide feedback on past actions, you need to provide extra information, such as

 `message Id`, to correctly associate user feedback with the right action.

```python
agiflow.associate_trace(
  id, # Unique ID linked to trace_id
  span_id # Unique ID linked to span_id
);
```

Later, when a user provides feedback, you can simply do:

```python
agiflow.report_score(
  id, # action_id or unique ID
  0.6 # Normalized score
);
```

#### Feedback Widget

You can asynchronously invoke the feedback widget on the frontend to collect user feedback.


## Contribution
This comprehensive documentation provides an overview of setting up and using the `agiflow-sdk`, including installation, setup, tracing, and user feedback. If you would like to add additional libraries support, please see [contribution guideline](../../../Contribution.md), we would love to have your support. Thanks! 
