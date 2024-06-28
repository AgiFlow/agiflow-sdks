import os
from typing import List, Optional, Type
from faker import Faker
import yaml
from pathlib import Path
import json
import urllib.parse


class BaseDataFactory():
    """
    Extend this class to read mockdata from file and return response
    """
    path = ''

    def __init__(
        self,
        *args,
        faker: Optional[Faker] = None,
        **kwargs
    ):
        self.faker = faker

    def get_data(self):
        pass

    def get_stream_data(self):
        pass

    @staticmethod
    def get_yaml_file(current, relative_path: str):
        if relative_path is not None:
            file = os.path.join(Path(current).parent, relative_path)
            return file

    @staticmethod
    def read_interaction_yaml(path: str):
        with open(path) as file:
            list = yaml.safe_load(file)
            return list

    @staticmethod
    def get_first_item_from_yaml(current, path):
        file = BaseDataFactory.get_yaml_file(current, path)
        data = BaseDataFactory.read_interaction_yaml(file)
        return data['interactions'][0]['response']


class BaseMockAPI():
    """
    Mock APIClient method or wrap it to record response.
    """
    def __init__(
        self,
        *args,
        debug=False,
        Factories: List[Type[BaseDataFactory]] = [],
        faker: Optional[Faker] = None,
        **kwargs
    ):
        self.debug = debug
        self.faker = faker
        self.factories = [Factory(faker=self.faker) for Factory in Factories]

    def is_stream(self, body):
        """
        Override this method for subclass if stream assertion is different
        """
        return body.get('stream') is True

    def match_factory(self, request):
        req = BaseMockAPI.parse_request(request)

        try:
            factory = next(api for api in self.factories if api.path == req['path'])
            return factory
        except Exception:
            return None

    def match(self, request):
        factory = self.match_factory(request)
        return factory is not None

    def generate(self, request):
        req = BaseMockAPI.parse_request(request)
        is_stream = self.is_stream(req['body'])
        factory = self.match_factory(request)

        if factory is not None:
            if is_stream:
                return factory.get_stream_data()
            else:
                return factory.get_data()

    @staticmethod
    def parse_request(request):
        req = {
            "url": "",
            "body": {},
            "headers": {},
            "path": "",
        }
        if hasattr(request, 'body'):
            req['body'] = json.loads(request.body)
        if hasattr(request, 'url'):
            req['url'] = request.url
            url_parsed = urllib.parse.urlparse(req['url'])
            req['path'] = url_parsed.path
        if hasattr(request, 'headers'):
            req['headers'] = request.headers
        return req


__all__ = [
    'BaseDataFactory',
    'BaseMockAPI'
]
