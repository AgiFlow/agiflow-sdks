from llm_mocks.llm.base import DataFactory, LLM_ROLES
from .constants import OPEN_AI_CHAT_MODELS


MODULE_NAME = "ChatCompletion"


class OpenAIChatCompletionFactory(DataFactory):
    """
    Data Factory to return OpenAI ChatCompletion response in stream or normal format
    """
    name = MODULE_NAME
    stream_data = DataFactory.load_default_data(__file__, f"{MODULE_NAME}Stream")
    data = DataFactory.load_default_data(__file__, MODULE_NAME)

    def random_usage(self):
        if self.faker:
            promt_tokens = self.faker.random_int()
            completion_tokens = self.faker.random_int()
            return {
                "prompt_tokens": promt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": promt_tokens + completion_tokens,
            }
        return {}

    def get_stream(self, override=None):
        data = OpenAIChatCompletionFactory.stream_data
        if self.faker:
            model = self.faker.random_choices(OPEN_AI_CHAT_MODELS)
            obj = "chat.completion.chunk"
            data = [
                {
                    "id": self.faker.uuid4(),
                    "model": model,
                    "object": obj,
                    "choices": [
                        {
                            "delta": {
                                "role": LLM_ROLES.get('assistant'),
                                "content": self.faker.text(),
                            },
                            "index": 0,
                        }
                    ]
                },
                {
                    "id": self.faker.uuid4(),
                    "model": model,
                    "object": obj,
                    "choices": [
                        {
                            "delta": {
                                "content": self.faker.text(),
                            },
                            "index": 0,
                        }
                    ]
                },
                {
                    "id": self.faker.uuid4(),
                    "model": model,
                    "object": obj,
                    "choices": [
                        {
                            "delta": {},
                            "finish_reason": "stop",
                            "index": 0,
                        }
                    ]
                },
            ]
        return self.get_object_data(data, override=override)

    def get(self, override=None):
        data = OpenAIChatCompletionFactory.data
        if self.faker:
            data = {
                "id": self.faker.uuid4(),
                "model": self.faker.random_choices(OPEN_AI_CHAT_MODELS),
                "object": "chat.completion",
                "usage": {
                    **self.random_usage(),
                },
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": 0,
                        "message": {
                            "id": self.faker.uuid4(),
                            "role": self.faker.random_choices(LLM_ROLES),
                            "content": self.faker.text()
                        }
                    }
                ]
            }

        return self.get_object_data(data, override=override)
