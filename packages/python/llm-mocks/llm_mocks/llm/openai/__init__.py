import logging
import os
from llm_mocks.llm.base import BaseDataFactory, BaseMockAPI


logger = logging.getLogger(__name__)


class OpenAIV1ChatCompletionsFactory(BaseDataFactory):
    path = "/v1/chat/completions"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_chat_completions.yaml')
        return data

    def get_stream_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_chat_completions_stream.yaml')
        return data


class OpenAIV1ImagesGenerationsFactory(BaseDataFactory):
    path = "/v1/images/generations"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_images_generations.yaml')
        return data


class OpenAIV1EmbeddingsFactory(BaseDataFactory):
    path = "/v1/embeddings"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_embeddings.yaml')
        return data


OpenAIDataFactories = [
    OpenAIV1ChatCompletionsFactory,
    OpenAIV1ImagesGenerationsFactory,
    OpenAIV1EmbeddingsFactory
]


class MockOpenAIAPI(BaseMockAPI):
    host = os.getenv("OPENAI_BASE_URL") or 'api.openai.com'

    def __init__(
        self,
        *args,
        Factories=OpenAIDataFactories,
        **kwargs
    ):
        super().__init__(self, *args, Factories=Factories, **kwargs)

    def is_stream(self, body):
        return body.get('stream') is True


__all__ = [
    'OpenAIV1ChatCompletionsFactory',
    'OpenAIV1EmbeddingsFactory',
    'OpenAIV1ImagesGenerationsFactory',
    'MockOpenAIAPI'
]
