from abc import ABC, abstractmethod
from typing import Optional, TypedDict


TokenUsage = TypedDict('TokenUsage', {
  "completion_tokens": int,
  "prompt_tokens": int,
  "total_tokens": int,
})


GenerateReturn = TypedDict('GenerateReturn', {
  "content": str,
  "usage": Optional[TokenUsage],
})


class EvalBaseLLM(ABC):
    def __init__(self, model_name: Optional[str] = None, *args, **kwargs):
        self.model_name = model_name
        self.model = self.load_model(*args, **kwargs)

    def get_model_name(self):
        return self.model_name

    @abstractmethod
    def load_model(self, *args, **kwargs):
        """Loads a model, that will be responsible for scoring.

        Returns:
            A model object
        """
        pass

    @abstractmethod
    def generate(self, *args, **kwargs) -> GenerateReturn:
        """Runs the model to output LLM response.

        Returns:
            A string.
        """
        pass

    @abstractmethod
    async def a_generate(self, *args, **kwargs) -> GenerateReturn:
        """Runs the model to output LLM response.

        Returns:
            A string.
        """
        pass
