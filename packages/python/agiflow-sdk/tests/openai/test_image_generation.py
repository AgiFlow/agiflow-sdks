import pytest
import json
import importlib
import os
from agiflow.opentelemetry.instrumentation.constants.openai import APIS
from agiflow.version import __version__


@pytest.mark.vcr()
def test_image_generation(openai_client, exporter):
    llm_model_value = "dall-e-3"
    prompt = "A charming and adorable baby sea otter. This small, fluffy creature is floating gracefully on its back, with its tiny webbed paws folded cutely over its fuzzy belly. It has big, round, innocent eyes that are brimming with youthful curiosity. As it blissfully floats on the calm, sparkling ocean surface under the glow of the golden sunset, it playfully tosses a shiny seashell from one paw to another, showcasing its playful and distinctively otter-like behavior." # noqa: E501, E261

    kwargs = {
        "model": llm_model_value,
        "prompt": prompt,
    }

    response = openai_client.images.generate(**kwargs)
    spans = exporter.get_finished_spans()
    image_generation_span = spans[-1]
    assert image_generation_span.name == "Images"

    attributes = image_generation_span.attributes
    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "OpenAI"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "openai"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == os.getenv('OPENAI_BASE_URL')
    assert attributes.get("llm.api") == APIS["IMAGES_GENERATION"]["ENDPOINT"]
    assert attributes.get("llm.model") == llm_model_value
    prompts = json.loads(attributes.get("gen_ai.prompt"))
    assert prompts[0]["content"] == prompt

    agiflow_responses = json.loads(attributes.get("llm.responses"))
    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response
        assert response.data[0].url == agiflow_response["content"]["url"]
        assert (
            response.data[0].revised_prompt
            == agiflow_response["content"]["revised_prompt"]
        )


@pytest.mark.vcr()
@pytest.mark.asyncio()
async def test_async_image_generation(async_openai_client, exporter):
    llm_model_value = "dall-e-3"
    prompt = "A charming and adorable baby sea otter. This small, fluffy creature is floating gracefully on its back, with its tiny webbed paws folded cutely over its fuzzy belly. It has big, round, innocent eyes that are brimming with youthful curiosity. As it blissfully floats on the calm, sparkling ocean surface under the glow of the golden sunset, it playfully tosses a shiny seashell from one paw to another, showcasing its playful and distinctively otter-like behavior." # noqa: E501, E261

    kwargs = {
        "model": llm_model_value,
        "prompt": prompt,
    }

    response = await async_openai_client.images.generate(**kwargs)
    spans = exporter.get_finished_spans()
    image_generation_span = spans[-1]
    assert image_generation_span.name == "AsyncImages"

    attributes = image_generation_span.attributes
    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == "OpenAI"
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == importlib.metadata.version(
        "openai"
    )
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == os.getenv('OPENAI_BASE_URL')
    assert attributes.get("llm.api") == APIS["IMAGES_GENERATION"]["ENDPOINT"]
    assert attributes.get("llm.model") == llm_model_value
    prompts = json.loads(attributes.get("gen_ai.prompt"))
    assert prompts[0]["content"] == prompt

    agiflow_responses = json.loads(attributes.get("llm.responses"))
    assert isinstance(agiflow_responses, list)
    for agiflow_response in agiflow_responses:
        assert isinstance(agiflow_response, dict)
        assert "role" in agiflow_response
        assert "content" in agiflow_response
        assert response.data[0].url == agiflow_response["content"]["url"]
        assert (
            response.data[0].revised_prompt
            == agiflow_response["content"]["revised_prompt"]
        )
