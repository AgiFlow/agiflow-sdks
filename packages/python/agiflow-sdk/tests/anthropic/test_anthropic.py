import pytest
import json
import importlib
from agiflow.opentelemetry.instrumentation.constants.anthropic import APIS
from tests.utils import assert_response_format, assert_token_count
from agiflow.version import __version__


@pytest.mark.vcr
def test_anthropic(anthropic_client, exporter):
    llm_model_value = "claude-3-sonnet-20240229"
    messages_value = [{"role": "user", "content": "How are you today?"}]

    kwargs = {
        "model": llm_model_value,
        "messages": messages_value,
        # "system": "Respond only in Yoda-speak.",
        "stream": False,
        "max_tokens": 1024,
    }
    anthropic_client.messages.create(**kwargs)
    spans = exporter.get_finished_spans()
    completion_span = spans[-1]

    assert completion_span.name == "Messages"
    attributes = completion_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "Anthropic"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "anthropic"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == "https://api.anthropic.com"
    assert attributes.get("llm.api") == APIS["MESSAGES_CREATE"]["ENDPOINT"]
    assert attributes.get("gen_ai.request.model") == llm_model_value
    assert attributes.get("gen_ai.prompt") == json.dumps(messages_value)
    assert attributes.get("llm.stream") is False

    assert_token_count(attributes)
    assert_response_format(completion_span)


@pytest.mark.vcr
def test_anthropic_streaming(anthropic_client, exporter):
    llm_model_value = "claude-3-sonnet-20240229"
    messages_value = [{"role": "user", "content": "How are you today?"}]

    kwargs = {
        "model": llm_model_value,
        "messages": messages_value,
        # "system": "Respond only in Yoda-speak.",
        "stream": True,
        "max_tokens": 1024,
    }
    response = anthropic_client.messages.create(**kwargs)
    chunk_count = 0

    for chunk in response:
        if chunk:
            chunk_count += 1

    spans = exporter.get_finished_spans()
    streaming_span = spans[-1]

    assert streaming_span.name == "Messages"
    attributes = streaming_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "Anthropic"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "anthropic"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == "https://api.anthropic.com"
    assert attributes.get("llm.api") == APIS["MESSAGES_CREATE"]["ENDPOINT"]
    assert attributes.get("gen_ai.request.model") == llm_model_value
    assert attributes.get("gen_ai.prompt") == json.dumps(messages_value)
    assert attributes.get("llm.stream") is True
    events = streaming_span.events

    assert len(events) - 2 == chunk_count + 1  # -2 for start and end events

    assert_token_count(attributes)
    assert_response_format(streaming_span)
