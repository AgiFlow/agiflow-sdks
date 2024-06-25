from agiflow_eval.llm.base import GenerateReturn


class MetadataAggregator:
    def __init__(self):
        self.completion_tokens = 0
        self.prompt_tokens = 0
        self.total_tokens = 0
        self.model_name = ''

    def collect_metadata(self, metadata: GenerateReturn | None):
        if metadata is None:
            return
        token_usage = metadata.get('usage')

        if token_usage is not None:
            self.completion_tokens += token_usage.get('completion_tokens')
            self.prompt_tokens += token_usage.get('prompt_tokens')
            self.total_tokens += token_usage.get('total_tokens')

        self.model_name = metadata.get('model_name')

    def get(self):
        return {
          "completion_tokens": self.completion_tokens,
          "prompt_tokens": self.prompt_tokens,
          "total_tokens": self.total_tokens,
          "model_name": self.model_name,
        }
