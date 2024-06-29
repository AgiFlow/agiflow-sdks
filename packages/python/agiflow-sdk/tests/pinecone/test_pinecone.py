import pytest
import json
from agiflow.opentelemetry.instrumentation.constants.common import SERVICE_PROVIDERS
from agiflow.opentelemetry.instrumentation.constants.pinecone import APIS
from agiflow.version import __version__
from importlib_metadata import version as v


def create_embedding(openai_client):
    result = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input="Some random text string goes here",
        encoding_format="float",
    )
    return result.data[0].embedding


@pytest.mark.vcr()
def test_upsert(openai_client, pinecone_client, exporter):
    embedding = create_embedding(openai_client)
    unique_id = "unique_random_id"
    data_to_upsert = {
        "id": unique_id,
        "values": embedding,
        "metadata": {"random": "random"},
    }
    index = pinecone_client.Index("test-index")
    index.upsert(vectors=[data_to_upsert], namespace="test-namespace")
    spans = exporter.get_finished_spans()
    pinecone_span = spans[-1]

    print(pinecone_span)

    assert pinecone_span.name == APIS["UPSERT"]["METHOD"]
    attributes = pinecone_span.attributes

    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("agiflow.service.name") == SERVICE_PROVIDERS["PINECONE"]
    assert attributes.get("agiflow.service.type") == "VectorDB"
    assert attributes.get("agiflow.service.version") == v("pinecone-client")
    assert attributes.get("db.system") == "pinecone"
    assert attributes.get("db.operation") == APIS["UPSERT"]["OPERATION"]


@pytest.mark.vcr()
def test_query(openai_client, pinecone_client, exporter):
    embedding = create_embedding(openai_client)
    unique_id = "unique_random_id"
    data_to_upsert = {
        "id": unique_id,
        "values": embedding,
        "metadata": {"random": "random"},
    }
    index = pinecone_client.Index("test-index")
    index.upsert(vectors=[data_to_upsert], namespace="test-namespace")
    filter = {"random": "random"}
    res = index.query(
        vector=embedding,
        top_k=3,
        include_values=True,
        namespace="test-namespace",
        include_metadata=True,
        filter=filter,
    )
    spans = exporter.get_finished_spans()
    query_span = spans[-1]
    assert query_span.name == APIS["QUERY"]["METHOD"]
    attributes = query_span.attributes
    assert attributes.get("agiflow.sdk.name") == "agiflow-python-sdk"
    assert attributes.get("agiflow.sdk.version") == __version__
    assert attributes.get("agiflow.service.name") == SERVICE_PROVIDERS["PINECONE"]
    assert attributes.get("agiflow.service.type") == "VectorDB"
    assert attributes.get("agiflow.service.version") == v("pinecone-client")
    assert attributes.get("db.system") == "pinecone"
    assert attributes.get("db.operation") == APIS["QUERY"]["OPERATION"]
    assert attributes.get("db.top_k") == 3
    assert attributes.get("db.namespace") == "test-namespace"
    assert attributes.get("db.query.include_values") == 'true'
    assert attributes.get("db.query.include_metadata") == 'true'
    assert attributes.get("db.usage.read_units") == 6
    assert json.loads(attributes.get("db.query.filter")) == filter
    res_matches = res.matches
    events = query_span.events
    assert len(res_matches) == len(events)
    for idx, event in enumerate(events):
        assert event.name == "db.query.match"
        attrs = event.attributes
        assert attrs.get("db.query.match.id") == res_matches[idx].id
        assert attrs.get("db.query.match.score") == res_matches[idx].score
