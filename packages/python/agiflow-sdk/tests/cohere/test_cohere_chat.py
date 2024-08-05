import json
from agiflow.opentelemetry.instrumentation.constants.cohere import APIS
from agiflow.opentelemetry.instrumentation.constants.common import SERVICE_PROVIDERS
import pytest
import importlib
from agiflow.version import __version__
from tests.utils import assert_response_format, assert_token_count


@pytest.mark.vcr
def test_cohere_chat(cohere_client, exporter):
    llm_model_value = "command"
    messages_value = "Tell me a story in 3 sentences or less?"
    preamble_value = "answer like a pirate"
    connectors = [{"id": "web-search"}]
    kwargs = {
        "model": llm_model_value,
        "message": messages_value,
        "preamble": preamble_value,
        "connectors": connectors,
        "temperature": 0.1,
        "chat_history": [
            {"role": "USER", "message": "Who discovered gravity?"},
            {
                "role": "CHATBOT",
                "message": "The man who is widely credited with discovering gravity is Sir Isaac Newton",
            },
        ],
    }
    res = cohere_client.chat(**kwargs)
    spans = exporter.get_finished_spans()
    cohere_span = spans[-1]
    assert cohere_span.name == APIS["CHAT_CREATE"]["METHOD"]
    attributes = cohere_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == SERVICE_PROVIDERS["COHERE"]
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "cohere"
    )

    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == APIS["CHAT_CREATE"]["URL"]
    assert attributes.get("llm.api") == APIS["CHAT_CREATE"]["ENDPOINT"]
    assert attributes.get("gen_ai.request.model") == llm_model_value
    assert attributes.get("llm.generation_id") == res.generation_id
    assert attributes.get("gen_ai.request.temperature") == kwargs.get("temperature")
    assert attributes.get("llm.stream") is False

    assert json.loads(attributes.get("llm.connectors")) == connectors
    assert json.loads(attributes.get("gen_ai.prompt"))[-1]["content"] == messages_value

    assert_token_count(attributes)
    assert_response_format(cohere_span)


@pytest.mark.vcr
def test_cohere_chat_streaming(cohere_client, exporter):
    llm_model_value = "command"
    messages_value = "Tell me a story in 3 sentences or less?"
    preamble_value = "answer like a pirate"
    connectors = [{"id": "web-search"}]
    kwargs = {
        "model": llm_model_value,
        "message": messages_value,
        "preamble": preamble_value,
        "connectors": connectors,
        "temperature": 0.1,
        "chat_history": [
            {"role": "USER", "message": "Who discovered gravity?"},
            {
                "role": "CHATBOT",
                "message": "The man who is widely credited with discovering gravity is Sir Isaac Newton",
            },
        ],
    }

    res = cohere_client.chat_stream(**kwargs)

    chunks_count = 0
    streamed_response = ""
    for chunk in res:
        if chunk.event_type == "text-generation":
            streamed_response += chunk.text
        chunks_count += 1

    spans = exporter.get_finished_spans()
    cohere_span = spans[-1]
    assert cohere_span.name == APIS["CHAT_STREAM"]["METHOD"]
    attributes = cohere_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == SERVICE_PROVIDERS["COHERE"]
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "cohere"
    )

    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == APIS["CHAT_STREAM"]["URL"]
    assert attributes.get("llm.api") == APIS["CHAT_STREAM"]["ENDPOINT"]
    assert attributes.get("gen_ai.request.model") == llm_model_value
    assert attributes.get("gen_ai.request.temperature") == kwargs.get("temperature")
    assert attributes.get("llm.stream") is True
    assert json.loads(attributes.get("llm.connectors")) == connectors
    assert json.loads(attributes.get("gen_ai.prompt"))[-1]["content"] == messages_value
    events = cohere_span.events
    assert events[-1].name == "stream.end"
    assert len(events) - 2 == chunks_count + 1

    assert_token_count(attributes)
    assert_response_format(cohere_span)
