from abc import abstractmethod

from agiflow_eval.test_case import LLMTestCase, ConversationalTestCase
from agiflow_eval.aggregators import MetadataAggregator
from typing import Optional, Dict


class BaseMetric:
    score: float = 0
    score_breakdown: Optional[Dict] = None
    reason: Optional[str] = None
    evaluation_model: Optional[str] = None
    strict_mode: bool = False
    async_mode: bool = True
    metadata: MetadataAggregator

    @property
    def threshold(self) -> float:
        return self._threshold

    @threshold.setter
    def threshold(self, value: float):
        self._threshold = value

    @abstractmethod
    def measure(self, test_case: LLMTestCase, *args, **kwargs) -> float:
        raise NotImplementedError

    @abstractmethod
    async def a_measure(self, test_case: LLMTestCase, *args, **kwargs) -> float:
        raise NotImplementedError(
            f"Async execution for {self.__class__.__name__} not supported yet. Please set 'async_mode' to 'False'."
        )

    @abstractmethod
    def is_successful(self) -> bool:
        raise NotImplementedError

    @property
    def __name__(self):
        return "Base Metric"


class BaseConversationalMetric:
    score: float = 0
    score_breakdown: Optional[Dict] = None
    reason: Optional[str] = None
    evaluation_model: Optional[str] = None
    # Not changeable for now
    strict_mode: bool = False
    async_mode: bool = False

    @property
    def threshold(self) -> float:
        return self._threshold

    @threshold.setter
    def threshold(self, value: float):
        self._threshold = value

    @abstractmethod
    def measure(
        self, test_case: ConversationalTestCase, *args, **kwargs
    ) -> float:
        raise NotImplementedError

    @abstractmethod
    def is_successful(self) -> bool:
        raise NotImplementedError

    @property
    def __name__(self):
        return "Base Conversational Metric"
