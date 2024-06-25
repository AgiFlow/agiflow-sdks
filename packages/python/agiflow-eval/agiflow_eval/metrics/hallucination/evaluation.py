from typing import List, Optional
from pydantic import BaseModel, Field

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
from .template import HallucinationTemplate


required_params: List[LLMTestCaseParams] = [
    LLMTestCaseParams.INPUT,
    LLMTestCaseParams.ACTUAL_OUTPUT,
    LLMTestCaseParams.CONTEXT,
]


# HallucinationMetric runs a similar algorithm to Dhallucination: https://arxiv.org/pdf/2208.05777.pdf
class HallucinationVerdict(BaseModel):
    verdict: str
    reason: str = Field(default=None)


class HallucinationMetric(BaseMetric):
    def __init__(
        self,
        metadata: MetadataAggregator,
        model: EvalBaseLLM,
        template: Optional[HallucinationTemplate] = None,
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
        self.template = template or HallucinationTemplate()

    def measure(self, test_case: LLMTestCase) -> float:
        check_test_case_params(test_case, required_params, self.__name__)
        with metric_progress_indicator(self):
            if self.async_mode:
                loop = get_or_create_event_loop()
                loop.run_until_complete(
                    self.a_measure(test_case, _show_indicator=False)
                )
            else:
                self.verdicts: List[HallucinationVerdict] = (
                    self._generate_verdicts(
                        test_case.actual_output, test_case.context
                    )
                )
                self.score = self._calculate_score()
                self.reason = self._generate_reason()
                self.success = self.score <= self.threshold
                capture_metric_type(self.__name__)
                return self.score

    async def a_measure(
        self, test_case: LLMTestCase, _show_indicator: bool = True
    ) -> float:
        check_test_case_params(test_case, required_params, self.__name__)

        with metric_progress_indicator(
            self, async_mode=True, _show_indicator=_show_indicator
        ):
            self.verdicts: List[HallucinationVerdict] = (
                await self._a_generate_verdicts(
                    test_case.actual_output, test_case.context
                )
            )
            self.score = self._calculate_score()
            self.reason = await self._a_generate_reason()
            self.success = self.score <= self.threshold
            capture_metric_type(self.__name__)
            return self.score

    async def _a_generate_reason(self):
        if self.include_reason is False:
            return None

        factual_alignments = []
        contradictions = []
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                factual_alignments.append(verdict.reason)
            else:
                contradictions.append(verdict.reason)

        prompt: dict = self.template.generate_reason(
            factual_alignments=factual_alignments,
            contradictions=contradictions,
            score=format(self.score, ".2f"),
        )

        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    def _generate_reason(self):
        if self.include_reason is False:
            return None

        factual_alignments = []
        contradictions = []
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                factual_alignments.append(verdict.reason)
            else:
                contradictions.append(verdict.reason)

        prompt: dict = self.template.generate_reason(
            factual_alignments=factual_alignments,
            contradictions=contradictions,
            score=format(self.score, ".2f"),
        )

        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    async def _a_generate_verdicts(
        self, actual_output: str, contexts: List[str]
    ) -> List[HallucinationVerdict]:
        verdicts: List[HallucinationVerdict] = []
        prompt = self.template.generate_verdicts(
            actual_output=actual_output, contexts=contexts
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        verdicts = [HallucinationVerdict(**item) for item in data["verdicts"]]
        return verdicts

    def _generate_verdicts(
        self, actual_output: str, contexts: List[str]
    ) -> List[HallucinationVerdict]:
        verdicts: List[HallucinationVerdict] = []
        prompt = self.template.generate_verdicts(
            actual_output=actual_output, contexts=contexts
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        verdicts = [HallucinationVerdict(**item) for item in data["verdicts"]]
        return verdicts

    def _calculate_score(self) -> float:
        number_of_verdicts = len(self.verdicts)
        if number_of_verdicts == 0:
            return 0

        hallucination_count = 0
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                hallucination_count += 1

        score = hallucination_count / number_of_verdicts
        return 1 if self.strict_mode and score > self.threshold else score

    def is_successful(self) -> bool:
        self.success = self.score <= self.threshold
        return self.success

    @property
    def __name__(self):
        return "Hallucination"
