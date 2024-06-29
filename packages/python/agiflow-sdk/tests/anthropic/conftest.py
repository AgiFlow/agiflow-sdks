"""Unit tests configuration module."""

import pytest
import os
from anthropic import Anthropic

from agiflow.opentelemetry.instrumentation.anthropic.instrumentation import (
    AnthropicInstrumentation,
)

ANTHROPIC_API_KEY = "test_api_key"


def is_mocked_env():
    return os.getenv("ANTHROPIC_API_KEY") == ANTHROPIC_API_KEY


class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)


@pytest.fixture(autouse=True)
def environment():
    if not os.getenv("ANTHROPIC_API_KEY"):
        os.environ["ANTHROPIC_API_KEY"] = ANTHROPIC_API_KEY


@pytest.fixture
def anthropic_client():
    return Anthropic()


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "x-api-key"]}


@pytest.fixture(scope="session", autouse=True)
def instrument():
    AnthropicInstrumentation().instrument()
