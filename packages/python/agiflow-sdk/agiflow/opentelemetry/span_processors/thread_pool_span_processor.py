import logging
import typing

from opentelemetry.sdk.trace import SpanProcessor, ReadableSpan, Span
from opentelemetry.sdk.trace.export import SpanExporter
from opentelemetry.context import (
    _SUPPRESS_INSTRUMENTATION_KEY,
    Context,
    attach,
    detach,
    set_value,
)
from collections import deque
from multiprocessing.dummy import Pool
import atexit

logger = logging.getLogger(__name__)


class ThreadPoolSpanProcessor(SpanProcessor):
    """ThreaPoolSpanProcessor implementation.

    ThreadPoolSpanProcessor is an implementation of `SpanProcessor` that
    send and forget remote request using threadpool instead of long-running thread.

    Replace BatchSpanProcessor with this in serverless environment if the long-running
    thread do not consistently send telemetry data and you cannot use SimpleSpanProcessor
    as it increase the latency of you application.
    """

    def __init__(
        self,
        span_exporter: SpanExporter,
        max_queue_size=10,
        pool_size=4,
        pool_queue_size=10
    ):
        self.pool = Pool(pool_size)
        self.max_queue_size = max_queue_size
        self.futures = deque([], pool_queue_size)
        self.span_exporter = span_exporter
        self.pool_size = pool_size
        self.queue = []
        # Wait for all requests to be finished before shutdown
        try:
            atexit.register(self.wait_for_flush)
        except Exception as e:
            logger.warn(e)

    def on_start(
        self,
        span: Span,
        parent_context: typing.Optional[Context] = None
    ) -> None:
        pass

    def renew_pool(self):
        try:
            self.pool._check_running()
        except Exception as e:
            logger.warn(e)
            self.pool = Pool(self.pool_size)

    def on_end(self, span: ReadableSpan) -> None:
        token = attach(set_value(_SUPPRESS_INSTRUMENTATION_KEY, True))
        self.queue.append(span)
        self.renew_pool()
        if len(self.queue) == self.max_queue_size:
            chunk = self.queue.copy()
            self.queue = []
            self.futures.append([self.pool.apply_async(self._export, chunk), chunk])
        detach(token)

    def shutdown(self) -> None:
        self.span_exporter.shutdown()

    def _export(self, *seq):
        self.span_exporter.export(seq)

    def force_flush(self, timeout_millis: int = 30000) -> bool:
        self.renew_pool()
        if len(self.queue) != 0:
            chunk = self.queue.copy()
            self.queue = []
            self.futures.append([self.pool.apply_async(self._export, chunk), chunk])
        # pylint: disable=unused-argument
        return True

    def wait_for_flush(self):
        result_list = []
        while len(self.futures) != 0:
            result_list.append(self.futures.pop())
        for [future, chunk] in result_list:
            try:
                res = future.get()
                logger.info(res)
            except Exception as e:
                logger.error(e)
                try:
                    self._export(chunk)
                except Exception as e:
                    logger.info('Failed to send trace')
                    logger.error(e)
