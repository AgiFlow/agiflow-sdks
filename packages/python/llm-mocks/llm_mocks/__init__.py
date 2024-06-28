from typing import Any, Callable, Optional
from .llm import (
    MockAnthropicAPI,
    AnthropicV1MessageFactory,
    OpenAIV1ChatCompletionsFactory,
    MockOpenAIAPI,
    OpenAIV1EmbeddingsFactory,
    OpenAIV1ImagesGenerationsFactory,
    MockCohereAPI,
    CohereV1ChatFactory,
    CohereV1EmbedFactory,
    CohereV1RerankFactory,
    BaseMockAPI,
    BaseDataFactory
)
from wrapt import wrap_function_wrapper
from urllib.parse import urlparse
from faker import Faker


def mock_can_play_response(mock_disabled: bool, mockService: Any):
    def wrap(wrapped, instance, args, kwargs):
        if mock_disabled:
            res = wrapped(*args, **kwargs)
            return res

        request = args[0]
        matched = mockService.match(request)

        if not matched:
            return wrapped(*args, **kwargs)

        return True

    return wrap


def mock_play_response(mock_disabled: bool, mockService: Any):
    def wrap(wrapped, instance, args, kwargs):
        if mock_disabled:
            res = wrapped(*args, **kwargs)
            return res

        request = args[0]
        matched = mockService.match(request)

        if not matched:
            return wrapped(*args, **kwargs)

        return mockService.generate(request)

    return wrap


Clients = [
    MockAnthropicAPI,
    MockOpenAIAPI,
    MockCohereAPI,
]


class MockService:
    def __init__(
        self,
        Clients=Clients,
        response_overwrite: Optional[Callable] = None,
        faker: Optional[Faker] = None,
    ):
        self.mockApis = [Client(faker=faker) for Client in Clients]
        self.response_overwrite = response_overwrite

    def match_client(self, request):
        url = request.url
        domain = urlparse(url).netloc
        try:
            client = next(api for api in self.mockApis if api.host == domain)
            return client
        except Exception:
            return None

    def match(self, request):
        matched = False
        client = self.match_client(request)

        if client is not None:
            if client.match(request):
                matched = True

        return matched

    def generate(self, request):
        client = self.match_client(request)
        if client is not None:
            response = client.generate(request)
            if self.response_overwrite is not None:
                response = self.response_overwrite(request, response)
            return response


class LLMMock():
    """
    Patch vcrpy cassette to return mock response without the need to record network request.
    If providers and apis are not supported, fallback to original vcr implementation.
    """
    def __init__(
        self,
        mock_disabled=False,
        MockService=MockService,
        response_overwrite: Optional[Callable] = None,
        faker: Optional[Faker] = None,
    ):
        self.mockService = MockService(response_overwrite=response_overwrite, faker=faker)
        wrap_function_wrapper(
            'vcr.cassette',
            'Cassette.can_play_response_for',
            mock_can_play_response(mock_disabled=mock_disabled, mockService=self.mockService),
        )
        wrap_function_wrapper(
            'vcr.cassette',
            'Cassette.play_response',
            mock_play_response(mock_disabled=mock_disabled, mockService=self.mockService),
        )


__all__ = [
    'MockAnthropicAPI',
    'AnthropicV1MessageFactory',
    'OpenAIV1ChatCompletionsFactory',
    'OpenAIV1EmbeddingsFactory',
    'OpenAIV1ImagesGenerationsFactory',
    'MockOpenAIAPI',
    'MockCohereAPI',
    'CohereV1ChatFactory',
    'CohereV1EmbedFactory',
    'CohereV1RerankFactory',
    'LLMMock',
    'MockService',
    'BaseMockAPI',
    'BaseDataFactory',
]
