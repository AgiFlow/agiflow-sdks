from typing import List, Optional
from pydantic import BaseModel, Field
import asyncio

from agiflow_eval.utils import (
    trim_and_load_json,
    get_or_create_event_loop,
)
from agiflow_eval.test_case import LLMTestCase, LLMTestCaseParams, check_test_case_params
from agiflow_eval.metrics import BaseMetric
from agiflow_eval.llm import EvalBaseLLM
from agiflow_eval.telemetry import capture_metric_type
from agiflow_eval.aggregators import MetadataAggregator
from agiflow_eval.metrics.indicator import metric_progress_indicator
from .template import ContextualRelevancyTemplate

required_params: List[LLMTestCaseParams] = [
    LLMTestCaseParams.INPUT,
    LLMTestCaseParams.ACTUAL_OUTPUT,
    LLMTestCaseParams.RETRIEVAL_CONTEXT,
]


class ContextualRelevancyVerdict(BaseModel):
    verdict: str
    reason: str = Field(default=None)


class ContextualRelevancyMetric(BaseMetric):
    def __init__(
        self,
        metadata: MetadataAggregator,
        model: EvalBaseLLM,
        template: Optional[ContextualRelevancyTemplate] = None,
        threshold: float = 0.5,
        include_reason: bool = True,
        async_mode: bool = True,
        strict_mode: bool = False,
    ):
        self.threshold = 1 if strict_mode else threshold
        self.model = model
        self.evaluation_model = self.model.get_model_name()
        self.include_reason = include_reason
        self.async_mode = async_mode
        self.strict_mode = strict_mode
        self.metadata = metadata
        self.template = template or ContextualRelevancyTemplate()

    def measure(self, test_case: LLMTestCase) -> float:
        check_test_case_params(test_case, required_params, self.__name__)

        with metric_progress_indicator(self):
            if self.async_mode:
                loop = get_or_create_event_loop()
                loop.run_until_complete(
                    self.a_measure(test_case, _show_indicator=False)
                )
            else:
                self.verdicts: List[ContextualRelevancyVerdict] = (
                    self._generate_verdicts(
                        test_case.input, test_case.retrieval_context
                    )
                )
                self.score = self._calculate_score()
                self.reason = self._generate_reason(test_case.input)
                self.success = self.score >= self.threshold
                capture_metric_type(self.__name__)
                return self.score

    async def a_measure(
        self, test_case: LLMTestCase, _show_indicator: bool = True
    ) -> float:
        check_test_case_params(test_case, required_params, self.__name__)

        with metric_progress_indicator(
            self,
            async_mode=True,
            _show_indicator=_show_indicator,
        ):
            verdicts = await self._a_generate_verdicts(
                test_case.input, test_case.retrieval_context
            )
            self.verdicts: List[ContextualRelevancyVerdict] = verdicts
            self.score = self._calculate_score()
            self.reason = await self._a_generate_reason(test_case.input)
            self.success = self.score >= self.threshold
            capture_metric_type(self.__name__)
            return self.score

    async def _a_generate_reason(self, input: str):
        if self.include_reason is False:
            return None

        irrelevancies = []
        for verdict in self.verdicts:
            if verdict.verdict.lower() == "no":
                irrelevancies.append(verdict.reason)

        prompt: dict = self.template.generate_reason(
            input=input,
            irrelevancies=irrelevancies,
            score=format(self.score, ".2f"),
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    def _generate_reason(self, input: str):
        if self.include_reason is False:
            return None

        irrelevancies = []
        for verdict in self.verdicts:
            if verdict.verdict.lower() == "no":
                irrelevancies.append(verdict.reason)

        prompt: dict = self.template.generate_reason(
            input=input,
            irrelevancies=irrelevancies,
            score=format(self.score, ".2f"),
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    def _calculate_score(self):
        total_verdicts = len(self.verdicts)
        if total_verdicts == 0:
            return 0

        relevant_nodes = 0
        for verdict in self.verdicts:
            if verdict.verdict.lower() == "yes":
                relevant_nodes += 1

        score = relevant_nodes / total_verdicts
        return 0 if self.strict_mode and score < self.threshold else score

    async def _a_generate_verdicts(
        self,
        text: str,
        retrieval_context: List[str]
    ) -> List[ContextualRelevancyVerdict]:
        tasks = []
        for context in retrieval_context:
            prompt = self.template.generate_verdicts(
                text=text, retrieval_context=context
            )
            task = asyncio.create_task(self.model.a_generate(prompt))
            tasks.append(task)

        results = await asyncio.gather(*tasks)

        verdicts: List[ContextualRelevancyVerdict] = []
        for res in results:
            self.metadata.collect_metadata(res.get('response_metadata'))
            data = trim_and_load_json(res.get('content'))
            verdict = ContextualRelevancyVerdict(**data)
            verdicts.append(verdict)

        return verdicts

    def _generate_verdicts(
        self, text: str, retrieval_context: List[str]
    ) -> List[ContextualRelevancyVerdict]:
        verdicts: List[ContextualRelevancyVerdict] = []
        for context in retrieval_context:
            prompt = self.template.generate_verdicts(
                text=text, retrieval_context=context
            )
            res = self.model.generate(prompt)
            self.metadata.collect_metadata(res.get('response_metadata'))
            data = trim_and_load_json(res.get('content'))
            verdict = ContextualRelevancyVerdict(**data)
            verdicts.append(verdict)

        return verdicts

    def is_successful(self) -> bool:
        self.success = self.score >= self.threshold
        return self.success

    @property
    def __name__(self):
        return "Contextual Relevancy"
