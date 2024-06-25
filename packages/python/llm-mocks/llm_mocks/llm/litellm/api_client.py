from typing import Callable
import logging
from wrapt import wrap_function_wrapper
from llm_mocks.llm.base import MockAPIClient
from .message import LitellmMessageFactory


logger = logging.getLogger(__name__)


class MockLitellmAPIClient(MockAPIClient):
    """
    Base APIClient mock class. Required concret implementation
    """
    _base_client = ''
    completion_method = ''
    completion_path = f'{_base_client}.{completion_method}'

    def __init__(
        self,
        *args,
        MessageFactory=LitellmMessageFactory,
        **kwargs
    ):
        super().__init__(self, *args, **kwargs)
        if kwargs.get('_base_client') is not None:
            self._base_client = kwargs.get('_base_client')
            self.completion_path = f'{self._base_client}.{self.completion_method}'
        self.chat_completion_factory = MessageFactory(faker=self.faker, selector=self.selector)

    def is_stream(self, kwargs):
        return kwargs.get('stream') is True

    def completion(self, *args, **kwargs):
        """
        Override this method to return correct mock response
        """
        pass

    def traced_method(self, path=None):
        """
        Override this method to monkey patch method
        """
        pass

    def patch(self, patch: Callable):
        """
        Substitue original method with new mock implementation
        """
        patch(self.completion_path, self.completion)

    def record(self, path=None):
        """
        Wrap original method and print/write response output to json
        """
        wrap_function_wrapper(
          self._base_client,
          self.completion_method,
          self.traced_method(path),
        )


class MockLitellmSyncAPIClient(MockLitellmAPIClient):
    """
    Monkey patch SyncAPIClient completion to return or record mock response
    """
    _base_client = 'litellm.main'
    completion_method = 'completion'
    completion_path = f'{_base_client}.{completion_method}'

    def completion(self, *args, **kwargs):
        self.log_function_call(logger, args, kwargs)

        if self.is_stream(kwargs):
            def iter():
                for item in self.chat_completion_factory.get_stream():
                    yield item
            return iter()

        else:
            return self.chat_completion_factory.get()

    def traced_method(self, path=None):
        def wrapped(wrapped, instance, args, kwargs):
            is_stream = self.is_stream(kwargs)
            file = self.get_json_path(path, module_name=self.completion_method, is_stream=is_stream)
            result = wrapped(*args, **kwargs)

            if is_stream:
                return self.record_stream_output(result, file)
            else:
                self.record_output(result.json(), file)
                return result

        return wrapped


class MockLitellmAsyncAPIClient(MockLitellmAPIClient):
    """
    Monkey patch SyncAPIClient completion to return or record mock response
    """
    _base_client = 'litellm.main'
    completion_method = 'acompletion'
    completion_path = f'{_base_client}.{completion_method}'

    async def completion(self, *args, **kwargs):
        self.log_function_call(logger, args, kwargs)

        if self.is_stream(kwargs):
            async def aiter():
                for item in self.chat_completion_factory.get_stream():
                    yield item
            return aiter()

        else:
            return self.chat_completion_factory.get()

    def traced_method(self, path=None):
        async def wrapped(wrapped, instance, args, kwargs):
            is_stream = self.is_stream(kwargs)
            file = self.get_json_path(path, module_name=self.completion_method, is_stream=is_stream)
            result = await wrapped(*args, **kwargs)

            if is_stream:
                return self.record_async_stream_output(result, file)
            else:
                self.record_output(result.json(), file)
                return result

        return wrapped
