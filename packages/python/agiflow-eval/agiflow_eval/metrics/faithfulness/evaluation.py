from typing import List, Optional
from pydantic import BaseModel, Field
import asyncio

from agiflow_eval.metrics import BaseMetric
from agiflow_eval.test_case import LLMTestCase, LLMTestCaseParams, check_test_case_params
from agiflow_eval.metrics.indicator import metric_progress_indicator
from agiflow_eval.telemetry import capture_metric_type
from agiflow_eval.llm import EvalBaseLLM
from agiflow_eval.aggregators import MetadataAggregator
from agiflow_eval.utils import (
    trim_and_load_json,
    get_or_create_event_loop,
)
from .template import FaithfulnessTemplate


required_params: List[LLMTestCaseParams] = [
    LLMTestCaseParams.INPUT,
    LLMTestCaseParams.ACTUAL_OUTPUT,
    LLMTestCaseParams.RETRIEVAL_CONTEXT,
]


# FaithfulnessMetric runs a similar algorithm to Dfaithfulness: https://arxiv.org/pdf/2208.05777.pdf
class FaithfulnessVerdict(BaseModel):
    verdict: str
    reason: str = Field(default=None)


class FaithfulnessMetric(BaseMetric):
    def __init__(
        self,
        metadata: MetadataAggregator,
        model: EvalBaseLLM,
        template: Optional[FaithfulnessTemplate] = None,
        threshold: float = 0.5,
        include_reason: bool = True,
        async_mode: bool = True,
        strict_mode: bool = False,
    ):
        self.threshold = 0 if strict_mode else threshold
        self.model = model
        self.evaluation_model = self.model.get_model_name()
        self.include_reason = include_reason
        self.async_mode = async_mode
        self.strict_mode = strict_mode
        self.metadata = metadata
        self.template = template or FaithfulnessTemplate()

    def measure(self, test_case: LLMTestCase) -> float:
        check_test_case_params(test_case, required_params, self.__name__)

        with metric_progress_indicator(self):
            if self.async_mode:
                loop = get_or_create_event_loop()
                loop.run_until_complete(
                    self.a_measure(test_case, _show_indicator=False)
                )
            else:
                self.truths = self._generate_truths(test_case.retrieval_context)
                self.claims = self._generate_claims(test_case.actual_output)
                self.verdicts = self._generate_verdicts()
                self.score = self._calculate_score()
                self.reason = self._generate_reason()
                self.success = self.score >= self.threshold
                capture_metric_type(self.__name__)
                return self.score

    async def a_measure(
        self, test_case: LLMTestCase, _show_indicator: bool = True
    ) -> float:
        check_test_case_params(test_case, required_params, self.__name__)

        with metric_progress_indicator(
            self, async_mode=True, _show_indicator=_show_indicator
        ):
            self.truths, self.claims = await asyncio.gather(
                self._a_generate_truths(test_case.retrieval_context),
                self._a_generate_claims(test_case.actual_output),
            )
            self.verdicts = await self._a_generate_verdicts()
            self.score = self._calculate_score()
            self.reason = await self._a_generate_reason()
            self.success = self.score >= self.threshold
            capture_metric_type(self.__name__)
            return self.score

    async def _a_generate_reason(self) -> str:
        if self.include_reason is False:
            return None

        contradictions = []
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                contradictions.append(verdict.reason)

        prompt: dict = self.template.generate_reason(
            contradictions=contradictions,
            score=format(self.score, ".2f"),
        )
        res = await self.model.a_generate(prompt)
        return res

    def _generate_reason(self) -> str:
        if self.include_reason is False:
            return None

        contradictions = []
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                contradictions.append(verdict.reason)

        prompt: dict = self.template.generate_reason(
            contradictions=contradictions,
            score=format(self.score, ".2f"),
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    async def _a_generate_verdicts(self) -> List[FaithfulnessVerdict]:
        if len(self.claims) == 0:
            return []

        verdicts: List[FaithfulnessVerdict] = []
        prompt = self.template.generate_verdicts(
            claims=self.claims, retrieval_context="\n\n".join(self.truths)
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        verdicts = [FaithfulnessVerdict(**item) for item in data["verdicts"]]
        return verdicts

    def _generate_verdicts(self) -> List[FaithfulnessVerdict]:
        if len(self.claims) == 0:
            return []

        verdicts: List[FaithfulnessVerdict] = []
        prompt = self.template.generate_verdicts(
            claims=self.claims, retrieval_context="\n\n".join(self.truths)
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        verdicts = [FaithfulnessVerdict(**item) for item in data["verdicts"]]
        return verdicts

    async def _a_generate_truths(self, retrieval_context: str) -> List[str]:
        prompt = self.template.generate_truths(
            text="\n\n".join(retrieval_context)
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        return data["truths"]

    def _generate_truths(self, retrieval_context: str) -> List[str]:
        prompt = self.template.generate_truths(
            text="\n\n".join(retrieval_context)
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        return data["truths"]

    async def _a_generate_claims(self, actual_output: str) -> List[str]:
        prompt = self.template.generate_claims(text=actual_output)
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        return data["claims"]

    def _generate_claims(self, actual_output: str) -> List[str]:
        prompt = self.template.generate_claims(text=actual_output)
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        return data["claims"]

    def _calculate_score(self) -> float:
        number_of_verdicts = len(self.verdicts)
        if number_of_verdicts == 0:
            return 1

        faithfulness_count = 0
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() != "no":
                faithfulness_count += 1

        score = faithfulness_count / number_of_verdicts
        return 0 if self.strict_mode and score < self.threshold else score

    def is_successful(self) -> bool:
        self.success = self.score >= self.threshold
        return self.success

    @property
    def __name__(self):
        return "Faithfulness"
