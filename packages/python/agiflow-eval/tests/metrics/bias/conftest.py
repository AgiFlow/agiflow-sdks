"""Unit tests configuration module."""

import pytest
import os

from agiflow_eval import (
  EvalLiteLLM,
)
from llm_mocks import MockLitellmAsyncAPIClient, LitellmMessageFactory, RecycleSelectorStrategy

OPENAI_API_KEY = "test_api_key"


def is_mocked_env():
    return os.getenv("OPENAI_API_KEY") == OPENAI_API_KEY


@pytest.fixture(autouse=True)
def environment():
    if not os.getenv("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY


@pytest.fixture
def llm(mocker):
    _base_client = 'agiflow_eval.llm.lite_llm'
    path = os.path.join(os.path.dirname(__file__), 'data')

    class MessageFactory(LitellmMessageFactory):
        data = LitellmMessageFactory.load_default_data(path, LitellmMessageFactory.name)

    if is_mocked_env():
        async_client_mock = MockLitellmAsyncAPIClient(
          _base_client=_base_client,
          MessageFactory=MessageFactory,
          SelectorStrategy=RecycleSelectorStrategy,
        )
        async_client_mock.patch(mocker.patch)
    else:
        async_client_mock = MockLitellmAsyncAPIClient(_base_client=_base_client)
        async_client_mock.record(path)
    return EvalLiteLLM(model="gpt-4o")


@pytest.fixture(scope="module")
def vcr_config():
    return {"filter_headers": ["authorization", "x-api-key"]}
