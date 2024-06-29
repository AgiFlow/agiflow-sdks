"""Unit tests configuration module."""

import pytest
import os
from langchain_openai import ChatOpenAI

from agiflow.opentelemetry.instrumentation.crewai.instrumentation import (
    CrewAIInstrumentation,
)


OPENAI_API_KEY = "none"


def is_mocked_env():
    return os.getenv("OPENAI_API_KEY") == OPENAI_API_KEY


@pytest.fixture(autouse=True)
def environment():
    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
    if not os.getenv("OPENAI_BASE_URL"):
        os.environ["OPENAI_BASE_URL"] = 'https://api.openai.com/v1/'


@pytest.fixture
def llm():
    return ChatOpenAI()


@pytest.fixture(autouse=True)
def clear_exporter(exporter):
    exporter.clear()


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "x-api-key"]}


@pytest.fixture(scope="session", autouse=True)
def instrument():
    CrewAIInstrumentation().instrument()
