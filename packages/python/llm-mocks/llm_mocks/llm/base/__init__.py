from logging import Logger
from typing import Any, Optional, List
from munch import Munch
from faker import Faker
from llm_mocks.utils import serialise_to_json, write_to_json
from abc import ABC
import json
import os
from datetime import datetime
from multiprocessing.pool import ThreadPool

LLM_ROLES = {
  "assistant": "assistant",
  "user": "user",
}


class AbstracSelectorStrategy(ABC):
    """
    Control how data is selected from factory for the model response
    """
    def get_data(self, list: Any):
        pass


class StaticSelectorStrategy(AbstracSelectorStrategy):
    """
    Alway return the first item from data list as model response
    """
    def __init__(self):
        self.position = 0

    def get_data(self, list: List[Any]):
        return list[self.position]


class RecycleSelectorStrategy(AbstracSelectorStrategy):
    """
    Alway return the first item from data list as model response
    """
    def __init__(self):
        self.position = 0

    def get_data(self, list: List[Any]):
        item = list[self.position]
        if item is not None:
            self.position += 1
            return item
        else:
            self.positon = 0
            return list[self.position]


class DataFactory(object):
    """
    Generate data from file or randomise with faker.
    Extend this class to generate correct data per model.
    """
    data: Any
    stream_data: Any

    def __init__(self, faker: Optional[Faker] = None, random=False, selector=AbstracSelectorStrategy):
        self.faker = faker
        self.random = random
        self.selector = selector

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
        """
        Return a single item from stream_data
        """
        pass

    def get(self, override=None):
        """
        Return a single item from data
        """
        pass


class MockAPIClient():
    """
    Mock APIClient method or wrap it to record response.
    """
    def __init__(
        self,
        *args,
        faker: Optional[Faker] = None,
        SelectorStrategy: Optional[AbstracSelectorStrategy] = StaticSelectorStrategy,
        debug=False,
        **kwargs
    ):
        self.faker = faker
        self.debug = debug
        self.pool = ThreadPool(10)
        self.selector = SelectorStrategy()

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
            now = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3]
            file = os.path.join(path, f"{module_name}{'Stream' if is_stream else ''}_{now}.json")
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
            self.pool.apply_async(write_to_json, (result, file))
        else:
            print(serialise_to_json(result))


__all__ = [
    'DataFactory',
    'MockAPIClient',
    'StaticSelectorStrategy',
    'AbstracSelectorStrategy',
    'RecycleSelectorStrategy'
]
