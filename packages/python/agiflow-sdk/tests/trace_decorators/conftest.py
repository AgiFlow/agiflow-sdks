"""Unit tests configuration module."""

import pytest
from agiflow import Agiflow
from opentelemetry.sdk.trace.export import SimpleSpanProcessor


@pytest.fixture(autouse=True)
def clear_exporter(exporter):
    exporter.clear()


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "x-api-key"]}


@pytest.fixture(scope="session", autouse=True)
def instrument(exporter):
    Agiflow.init(
      exporter=exporter,
      Processor=SimpleSpanProcessor
    )
