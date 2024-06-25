from typing import Any
from litellm import acompletion, completion
from .base import EvalBaseLLM


class EvalLiteLLM(EvalBaseLLM):
    margs: Any
    mkwargs: Any

    def __init__(self, model: str = '', *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_name = model
        self.margs = args
        self.mkwargs = kwargs

    def load_model(self, *args, **kwargs):
        return

    def generate(self, prompt: str):
        res = completion(
            *self.margs,
            model=self.model_name,
            **self.mkwargs,
            messages=[{"content": prompt, "role": "user"}]
        )
        return EvalLiteLLM.get_response(res)

    async def a_generate(self, prompt: str):
        res = await acompletion(
            *self.margs,
            model=self.model_name,
            **self.mkwargs,
            messages=[{"content": prompt, "role": "user"}]
        )
        return EvalLiteLLM.get_response(res)

    @staticmethod
    def get_response(res: Any):
        return {
          "content": res["choices"][0]["message"]["content"],
          "usage": res["usage"]
        }

    def get_model_name(self):
        return self.model_name
