from typing import Callable
import logging
from wrapt import wrap_function_wrapper
from llm_mocks.llm.base import MockAPIClient
from .message import AnthropicMessageFactory


logger = logging.getLogger(__name__)


class MockAnthropicAPIClient(MockAPIClient):
    """
    Base APIClient mock class. Required concret implementation
    """
    _base_client = ''
    post_method = ''
    post_path = f'{_base_client}.{post_method}'

    def __init__(
        self,
        *args,
        MessageFactory=AnthropicMessageFactory,
        **kwargs
    ):
        super().__init__(self, *args, **kwargs)
        self.chat_completion_factory = MessageFactory(faker=self.faker)

    def is_stream(self, kwargs):
        return kwargs.get('body', {}).get('stream') is True

    def post(self, *args, **kwargs):
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
        patch(self.post_path, self.post)

    def record(self, path=None):
        """
        Wrap original method and print/write response output to json
        """
        wrap_function_wrapper(
          self._base_client,
          self.post_method,
          self.traced_method(path),
        )


class MockAnthropicSyncAPIClient(MockAnthropicAPIClient):
    """
    Monkey patch SyncAPIClient post to return or record mock response
    """
    _base_client = 'anthropic._base_client'
    post_method = 'SyncAPIClient.post'
    post_path = f'{_base_client}.{post_method}'

    def post(self, *args, **kwargs):
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
            request_name = kwargs.get('cast_to').__name__
            file = self.get_json_path(path, module_name=request_name, is_stream=is_stream)
            result = wrapped(*args, **kwargs)

            if is_stream:
                return self.record_stream_output(result, file)
            else:
                self.record_output(result, file)
                return result

        return wrapped
