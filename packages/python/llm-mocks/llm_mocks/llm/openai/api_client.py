from typing import Callable
import logging
from llm_mocks.llm.base import MockAPIClient
from wrapt import wrap_function_wrapper
from .chat_completion import OpenAIChatCompletionFactory
from .images_response import OpenAIImagesResponseFactory

logger = logging.getLogger(__name__)


class MockOpenAIClient(MockAPIClient):
    """
    Base APIClient mock class. Required concret implementation
    """
    _base_client = ''
    _request_method = ''
    _request_path = f'{_base_client}.{_request_method}'

    def __init__(
        self,
        *args,
        ChatCompletionFactory=OpenAIChatCompletionFactory,
        ImagesResponseFactory=OpenAIImagesResponseFactory,
        **kwargs
    ):
        super().__init__(self, *args, **kwargs)
        self.chat_completion_factory = ChatCompletionFactory(faker=self.faker)
        self.images_response_factory = ImagesResponseFactory(faker=self.faker)

    def is_stream(self, kwargs):
        return kwargs.get('stream') is True

    def _request(self, *args, **kwargs):
        """
        Override this method to return correct mock response
        """
        pass

    def traced_method(self, *args, **kwargs):
        """
        Override this method to monkey patch method
        """
        pass

    def patch(self, patch: Callable):
        """
        Substitue original method with new mock implementation
        """
        patch(self._request_path, self._request)

    def record(self, path):
        """
        Wrap original method and print/write response output to json
        """
        wrap_function_wrapper(
          self._base_client,
          self._request_method,
          self.traced_method(path),
        )


class MockOpenAISyncAPIClient(MockOpenAIClient):
    """
    Monkey patch SyncAPIClient post to return or record mock response
    """
    _base_client = 'openai._base_client'
    _request_method = 'SyncAPIClient._request'
    _request_path = f'{_base_client}.{_request_method}'

    def _request(self, *args, **kwargs):
        self.log_function_call(logger, args, kwargs)

        request_name = kwargs.get('cast_to').__name__
        if self.is_stream(kwargs):
            if request_name == self.chat_completion_factory.name:
                def iter():
                    for item in self.chat_completion_factory.get_stream():
                        yield item
                return iter()

            return []
        else:
            if request_name == self.images_response_factory.name:
                return self.images_response_factory.get()

            if request_name == self.chat_completion_factory.name:
                return self.chat_completion_factory.get()

            return {}

    def traced_method(self, path=None):
        def wrapped(wrapped, instance, args, kwargs):
            is_stream = self.is_stream(kwargs)
            request_name = kwargs.get('cast_to').__name__
            file = self.get_json_path(path, module_name=request_name, is_stream=is_stream)
            result = wrapped(*args, **kwargs)

            if is_stream:
                return self.record_stream_output(result, file)
            else:
                self.record_output(result, file)
                return result

        return wrapped


class MockOpenAIAsyncAPIClient(MockOpenAIClient):
    """
    Monkey patch AsyncAPIClient post to return or record mock response
    """
    _base_client = 'openai._base_client'
    _request_method = 'AsyncAPIClient._request'
    _request_path = f'{_base_client}.{_request_method}'

    async def _request(self, *args, **kwargs):
        self.log_function_call(logger, args, kwargs)

        request_name = kwargs.get('cast_to').__name__
        if self.is_stream(kwargs):
            if request_name == self.chat_completion_factory.name:
                async def aiter():
                    for item in self.chat_completion_factory.get_stream():
                        yield item
                return aiter()

            return []
        else:
            if request_name == self.images_response_factory.name:
                return self.images_response_factory.get()

            if request_name == self.chat_completion_factory.name:
                return self.chat_completion_factory.get()

            return {}

    def traced_method(self, path=None):
        async def wrapped(wrapped, instance, args, kwargs):
            is_stream = self.is_stream(kwargs)
            request_name = kwargs.get('cast_to').__name__
            file = self.get_json_path(path, module_name=request_name, is_stream=is_stream)
            result = await wrapped(*args, **kwargs)

            if is_stream:
                return self.record_async_stream_output(result, file)
            else:
                self.record_output(result, file)
                return result

        return wrapped
