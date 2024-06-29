"""Unit tests configuration module."""

import pytest

from agiflow.opentelemetry.instrumentation.langgraph.instrumentation import (
    LanggraphInstrumentation,
)


@pytest.fixture(autouse=True)
def clear_exporter(exporter):
    exporter.clear()


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "x-api-key"]}


@pytest.fixture(scope="session", autouse=True)
def instrument():
    LanggraphInstrumentation().instrument()
