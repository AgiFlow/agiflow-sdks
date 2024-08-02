from agiflow.opentelemetry.instrumentation.constants.cohere import APIS
from agiflow.opentelemetry.instrumentation.constants.common import SERVICE_PROVIDERS
import pytest
import json
from tests.utils import assert_token_count
from importlib_metadata import version as v
from agiflow.version import __version__


@pytest.mark.vcr
def test_cohere_rerank(cohere_client, exporter):
    llm_model_value = "rerank-english-v2.0"
    query = "What is the capital of the United States?"
    docs = [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",  # noqa: E501
        "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",  # noqa: E501
        "Capital punishment (the death penalty) has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states.",  # noqa: E501
    ]

    kwargs = {
        "model": llm_model_value,
        "query": query,
        "documents": docs,
        "top_n": 3,
    }

    results = cohere_client.rerank(**kwargs)
    spans = exporter.get_finished_spans()
    cohere_span = spans[-1]
    assert cohere_span.name == APIS["RERANK"]["METHOD"]
    attributes = cohere_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.service.name") == SERVICE_PROVIDERS["COHERE"]
    assert attributes.get("agiflow.service.type") == "LLM"
    assert attributes.get("agiflow.service.version") == v("cohere")

    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("url.full") == APIS["RERANK"]["URL"]
    assert attributes.get("llm.api") == APIS["RERANK"]["ENDPOINT"]
    assert attributes.get("gen_ai.request.model") == llm_model_value

    agiflow_results = json.loads(attributes.get("llm.retrieval.results"))
    for idx, res in enumerate(results.results):
        lang_res = json.loads(agiflow_results[idx])
        assert lang_res["index"] == res.index
        assert lang_res["relevance_score"] == res.relevance_score

    assert_token_count(attributes)
