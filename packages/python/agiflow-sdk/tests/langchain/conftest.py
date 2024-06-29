"""Unit tests configuration module."""

import os
import pytest

from agiflow.opentelemetry.instrumentation.openai.instrumentation import (
    OpenAIInstrumentation,
)
from agiflow.opentelemetry.instrumentation.langchain.instrumentation import (
    LangchainInstrumentation,
)
from agiflow.opentelemetry.instrumentation.langchain_core.instrumentation import (
    LangchainCoreInstrumentation,
)

from agiflow.opentelemetry.instrumentation.langchain_community.instrumentation import (
    LangchainCommunityInstrumentation,
)
from langchain_openai import ChatOpenAI


OPENAI_API_KEY = "none"


def is_mocked_env():
    return os.getenv("OPENAI_API_KEY") == OPENAI_API_KEY


@pytest.fixture(autouse=True)
def environment():
    if not os.environ.get("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
    if not os.getenv("OPENAI_BASE_URL"):
        os.environ["OPENAI_BASE_URL"] = 'https://api.openai.com/v1/'


@pytest.fixture(autouse=True)
def clear_exporter(exporter):
    exporter.clear()


@pytest.fixture
def llm():
    return ChatOpenAI()


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "x-api-key"]}


@pytest.fixture(scope="session", autouse=True)
def instrument():
    OpenAIInstrumentation().instrument()
    LangchainInstrumentation().instrument()
    LangchainCoreInstrumentation().instrument()
    LangchainCommunityInstrumentation().instrument()
