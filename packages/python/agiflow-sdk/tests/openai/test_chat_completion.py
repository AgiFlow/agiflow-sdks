import pytest
import importlib
import json
from agiflow.opentelemetry.instrumentation.constants.openai import APIS
from tests.utils import assert_response_format, assert_token_count
import os
from agiflow.version import __version__


@pytest.mark.vcr()
def test_chat_completion(exporter, openai_client):
    llm_model_value = "gpt-3.5-turbo"
    messages_value = [{"role": "user", "content": "Say this is a test three times"}]

    kwargs = {
        "model": llm_model_value,
        "messages": messages_value,
        "stream": False,
    }

    openai_client.chat.completions.create(**kwargs)
    spans = exporter.get_finished_spans()
    completion_span = spans[-1]
    assert completion_span.name == f"chat {llm_model_value}"

    attributes = completion_span.attributes
    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "OpenAI"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "openai"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == os.getenv('OPENAI_BASE_URL')
    assert attributes.get("llm.api") == APIS["CHAT_COMPLETION"]["ENDPOINT"]
    assert attributes.get("gen_ai.response.model") == "gpt-3.5-turbo-0125"
    assert attributes.get("gen_ai.prompt") == json.dumps(messages_value)
    assert attributes.get("llm.stream") is False

    assert_token_count(attributes)
    assert_response_format(attributes)

    agiflow_responses = json.loads(attributes.get("gen_ai.completion"))
    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response

    agiflow_responses = json.loads(attributes.get("gen_ai.completion"))
    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response


@pytest.mark.vcr()
def test_chat_completion_streaming(exporter, openai_client):
    llm_model_value = "gpt-3.5-turbo"
    messages_value = [{"role": "user", "content": "Say this is a test three times"}]

    kwargs = {
        "model": llm_model_value,
        "messages": messages_value,
        "stream": True,
    }

    response = openai_client.chat.completions.create(**kwargs)
    chunk_count = 0
    for _ in response:
        chunk_count += 1

    spans = exporter.get_finished_spans()
    streaming_span = spans[-1]

    assert streaming_span.name == f"chat {llm_model_value}"
    attributes = streaming_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "OpenAI"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "openai"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == os.getenv('OPENAI_BASE_URL')
    assert attributes.get("llm.api") == APIS["CHAT_COMPLETION"]["ENDPOINT"]
    assert attributes.get("gen_ai.response.model") == "gpt-3.5-turbo-0125"
    assert attributes.get("gen_ai.prompt") == json.dumps(messages_value)
    assert attributes.get("llm.stream") is True

    events = streaming_span.events
    assert len(events) - 2 == chunk_count  # -2 for start and end events

    assert_token_count(attributes)
    assert_response_format(attributes)

    agiflow_responses = json.loads(attributes.get("gen_ai.completion"))
    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response

    agiflow_responses = json.loads(attributes.get("gen_ai.completion"))
    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response


@pytest.mark.vcr()
@pytest.mark.asyncio()
async def test_async_chat_completion_streaming(exporter, async_openai_client):
    llm_model_value = "gpt-3.5-turbo"
    messages_value = [{"role": "user", "content": "Say this is a test three times"}]

    kwargs = {
        "model": llm_model_value,
        "messages": messages_value,
        "stream": True,
    }

    response = await async_openai_client.chat.completions.create(**kwargs)
    chunk_count = 0
    async for _ in response:
        chunk_count += 1

    spans = exporter.get_finished_spans()
    streaming_span = spans[-1]

    assert streaming_span.name == f"chat {llm_model_value}"
    attributes = streaming_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "OpenAI"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "openai"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == os.getenv('OPENAI_BASE_URL')
    assert attributes.get("llm.api") == APIS["CHAT_COMPLETION"]["ENDPOINT"]
    assert attributes.get("gen_ai.response.model") == "gpt-3.5-turbo-0125"
    assert attributes.get("gen_ai.prompt") == json.dumps(messages_value)
    assert attributes.get("llm.stream") is True

    events = streaming_span.events
    assert len(events) - 2 == chunk_count  # -2 for start and end events

    assert_token_count(attributes)
    assert_response_format(attributes)
