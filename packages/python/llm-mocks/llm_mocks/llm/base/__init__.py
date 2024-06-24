from logging import Logger
from typing import Any, Optional
from munch import Munch
from faker import Faker
from llm_mocks.utils import serialise_to_json, write_to_json
import json
import os

LLM_ROLES = {
  "assistant": "assistant",
  "user": "user",
}


class DataFactory(object):
    def __init__(self, faker: Optional[Faker] = None, random=False):
        self.faker = faker
        self.random = random

    def get_object_data(self, data, override=None):
        if override:
            data.update(override)
        return Munch.fromDict(data)

    @staticmethod
    def load_default_data(file: str, name: str):
        path = os.path.join(os.path.dirname(file), 'data', f"{name}.json")
        with open(path) as f:
            data = json.load(f)
        return data

    def get_stream(self, override=None):
        pass

    def get(self, override=None):
        pass


class MockAPIClient():
    def __init__(
        self,
        *args,
        faker: Optional[Faker] = None,
        debug=False,
        **kwargs
    ):
        self.faker = faker
        self.debug = debug

    def log_function_call(self, logger: Logger, args, kwargs):
        if self.debug:
            logger.info(
                '#post &args: %s &kwargs: %s',
                ''.join('%s, ' % arg for arg in args),
                ''.join('%s=%s, ' % arg for arg in kwargs.items())
            )

    def get_json_path(self, path: Optional[str], module_name: str = '', is_stream: bool = False):
        if path is not None:
            if not os.path.exists(path):
                os.makedirs(path)
            file = os.path.join(path, f"{module_name}{'Stream' if is_stream else ''}.json")
            return file

    def record_stream_output(self, result, file):
        try:
            data = []
            for chunk in result:
                data.append(chunk)
                yield chunk
        finally:
            self.record_output(data, file)

    async def record_async_stream_output(self, result, file):
        try:
            data = []
            async for chunk in result:
                data.append(chunk)
                yield chunk
        finally:
            self.record_output(data, file)

    def record_output(self, result: Any, file: Optional[str]):
        if file is not None:
            with open(file, 'w') as f:
                write_to_json(result, f, ensure_ascii=False, indent=4)
        else:
            print(serialise_to_json(result))


__all__ = [
  'DataFactory',
  'MockAPIClient',
]
