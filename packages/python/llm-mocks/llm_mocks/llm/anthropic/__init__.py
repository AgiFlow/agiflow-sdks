import logging
from llm_mocks.llm.base import BaseDataFactory, BaseMockAPI


logger = logging.getLogger(__name__)


class AnthropicV1MessageFactory(BaseDataFactory):
    path = "/v1/messages"

    def get_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_messages.yaml')
        return data

    def get_stream_data(self):
        data = self.get_first_item_from_yaml(__file__, 'data/v1_messages_stream.yaml')
        return data


AnthropicDataFactories = [
    AnthropicV1MessageFactory,
]


class MockAnthropicAPI(BaseMockAPI):
    host = 'api.anthropic.com'

    def __init__(
        self,
        *args,
        Factories=AnthropicDataFactories,
        **kwargs
    ):
        super().__init__(self, *args, Factories=Factories, **kwargs)
        self.v1_messages_factory = AnthropicV1MessageFactory(faker=self.faker)


__all__ = [
    'MockAnthropicAPI',
    'AnthropicV1MessageFactory'
]
