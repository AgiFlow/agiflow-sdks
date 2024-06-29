"""Unit tests configuration module."""

import pytest


from agiflow.opentelemetry.instrumentation.qdrant import (
    QdrantInstrumentation,
)
from qdrant_client import QdrantClient


@pytest.fixture
def qdrant_client():
    return QdrantClient(":memory:")


@pytest.fixture(scope="session", autouse=True)
def instrument():
    QdrantInstrumentation().instrument()
