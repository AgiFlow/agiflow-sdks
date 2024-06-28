import logging
from llm_mocks.llm.base import BaseMockAPI, BaseDataFactory


logger = logging.getLogger(__name__)


class CohereV1ChatFactory(BaseDataFactory):
    path = "/v1/chat"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_chat.yaml')
        return data

    def get_stream_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_chat_stream.yaml')
        return data


class CohereV1EmbedFactory(BaseDataFactory):
    path = "/v1/embed"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_embed.yaml')
        return data


class CohereV1RerankFactory(BaseDataFactory):
    path = "/v1/rerank"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_rerank.yaml')
        return data


CohereDataFactories = [
    CohereV1ChatFactory,
    CohereV1EmbedFactory,
    CohereV1RerankFactory,
]


class MockCohereAPI(BaseMockAPI):
    host = 'api.cohere.com'

    def __init__(
        self,
        *args,
        Factories=CohereDataFactories,
        **kwargs
    ):
        super().__init__(self, *args, Factories=Factories, **kwargs)
        self.v1_chat_factory = CohereV1ChatFactory(faker=self.faker)


__all__ = [
    'MockCohereAPI',
    'CohereV1ChatFactory',
    'CohereV1EmbedFactory',
    'CohereV1RerankFactory',
]
