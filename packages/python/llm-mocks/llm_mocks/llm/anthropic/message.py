from llm_mocks.llm.base import DataFactory, LLM_ROLES
from .constants import ANTHROPIC_MODELS


MODULE_NAME = "Message"


class AnthropicMessageFactory(DataFactory):
    """
    Data Factory to return Anthropic Message response in stream or normal format
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
        data = AnthropicMessageFactory.stream_data
        if self.faker:
            model = self.faker.random_choices(ANTHROPIC_MODELS)
            role = self.faker.random_choices(LLM_ROLES)
            data = [
              {
                  "message": {
                      "id": self.faker.uuid4(),
                      "content": [],
                      "model": model,
                      "role": role,
                      "type": "message",
                      "usage": {
                          **self.random_usage()
                      }
                  },
                  "type": "message_start"
                },
              {
                  "delta": {
                      "text": self.faker.text(),
                      "type": "text_delta",
                  },
                  "index": 0,
                  "type": "content_block_delta"
              },
              {
                  "index": 0,
                  "type": "content_block_stop"
              },
              {
                  "delta": {
                      "stop_reason": "end_turn"
                  },
                  "type": "message_delta",
                  "usage": {
                      "output_tokens": self.faker.random_int(),
                  }
              },
              {
                  "type": "message_stop"
              }
            ]
        return self.get_object_data(data, override=override)

    def get(self, override=None):
        data = AnthropicMessageFactory.data
        if self.faker:
            data = {
                "id": self.faker.uuid4(),
                "model": self.faker.random_choices(ANTHROPIC_MODELS),
                "role": self.faker.random_choices(LLM_ROLES),
                "stop_reason": "end_turn",
                "content": [{
                    "text": self.faker.text(),
                    "type": "",
                }],
                "usage": {
                    **self.random_usage(),
                }
            }

        return self.get_object_data(data, override=override)
