"""Unit tests configuration module."""

import pytest
import os

from agiflow_eval import (
  EvalLiteLLM,
)

OPENAI_API_KEY = "test_api_key"


def is_mocked_env():
    return os.getenv("OPENAI_API_KEY") == OPENAI_API_KEY


@pytest.fixture(autouse=True)
def environment():
    if not os.getenv("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY


@pytest.fixture
def llm():
    return EvalLiteLLM(model="gpt-4o")


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "api-key", "x-api-key"]}
