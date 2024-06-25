from llm_mocks.llm.base import DataFactory, LLM_ROLES
from llm_mocks.llm.openai.constants import OPEN_AI_CHAT_MODELS


MODULE_NAME = "completion"


class LitellmMessageFactory(DataFactory):
    """
    Data Factory to return Litellm Message response in stream or normal format
    """
    name = MODULE_NAME
    stream_data = DataFactory.load_default_data(__file__, f"{MODULE_NAME}Stream")
    data = DataFactory.load_default_data(__file__, MODULE_NAME)

    def random_usage(self):
        if self.faker:
            return {
              "input_token": self.faker.random_int(),
              "output_token": self.faker.random_int(),
            }
        return {}

    def get_stream(self, override=None):
        data = self.selector.get_data(self.stream_data)
        if self.faker:
            data = [
            ]
        return self.get_object_data(data, override=override)

    def get(self, override=None):
        data = self.selector.get_data(self.data)
        if self.faker:
            data = {
                "id": self.faker.uuid4(),
                "model": self.faker.random_choices(OPEN_AI_CHAT_MODELS),
                "object": "chat.completion",
                "system_fingerprint": self.faker.text(),
                "choices": [{
                    "finish_reason": "stop",
                    "index": 0,
                    "message": {
                        "content": self.faker.text(),
                        "role": self.faker.random_choices(LLM_ROLES),
                    }
                }],
                "usage": {
                    **self.random_usage(),
                }
            }

        return self.get_object_data(data, override=override)
