from unittest.mock import MagicMock, patch
import json


def common_setup(data, method_to_mock=None):
    if method_to_mock:
        service_mock = patch(method_to_mock)
        mock_method = service_mock.start()
        mock_method.return_value = json.dumps(data)
    else:
        service_mock = MagicMock()
        service_mock.return_value = MagicMock(**data)

    tracer = MagicMock()
    span = MagicMock()

    context_manager_mock = MagicMock()
    context_manager_mock.__enter__.return_value = span
    tracer.start_as_current_span.return_value = context_manager_mock

    return service_mock, tracer, span


def assert_token_count(attributes):
    output_tokens = attributes.get("gen_ai.usage.output_tokens")
    prompt_tokens = attributes.get("gen_ai.usage.input_tokens")
    total_tokens = output_tokens + prompt_tokens

    assert (
        output_tokens is not None
        and prompt_tokens is not None
        and total_tokens is not None
    )
    assert output_tokens + prompt_tokens == total_tokens


def assert_response_format(span):
    if len(span.events) > 2:
        event = span.events[-2]
    else:
        event = span.events[-1]

    assert event.name == 'gen_ai.content.completion'
    agiflow_responses = json.loads(event.attributes.get('gen_ai.completion'))

    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response


def assert_prompt(span, value):
    event = span.events[0]

    assert event.name == 'gen_ai.content.prompt'
    prompt = event.attributes.get('gen_ai.prompt')
    print(prompt)
    assert prompt == value
