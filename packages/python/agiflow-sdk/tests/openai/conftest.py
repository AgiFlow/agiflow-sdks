"""Unit tests configuration module."""

import pytest
import os
from openai import OpenAI, AsyncOpenAI
from agiflow.opentelemetry.instrumentation.openai.instrumentation import (
    OpenAIInstrumentation,
)


OPENAI_API_KEY = 'none'


def is_mocked_env():
    return os.getenv("OPENAI_API_KEY") == OPENAI_API_KEY


@pytest.fixture(autouse=True)
def environment():
    if not os.getenv("OPENAI_BASE_URL"):
        os.environ["OPENAI_BASE_URL"] = 'https://api.openai.com/v1/'
    if not os.getenv("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY


@pytest.fixture
def openai_client():
    return OpenAI()


@pytest.fixture
def async_openai_client():
    return AsyncOpenAI()


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "api-key"]}


@pytest.fixture(scope="session", autouse=True)
def instrument():
    OpenAIInstrumentation().instrument()
