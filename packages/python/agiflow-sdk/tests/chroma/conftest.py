import chromadb
import pytest
from agiflow.opentelemetry.instrumentation.chroma import (
    ChromaInstrumentation,
)


@pytest.fixture
def chroma_client():
    return chromadb.Client()


@pytest.fixture(scope="session", autouse=True)
def instrument():
    ChromaInstrumentation().instrument()
