from typing import List, Optional
from pydantic import BaseModel, Field

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
from .template import AnswerRelevancyTemplate

required_params: List[LLMTestCaseParams] = [
    LLMTestCaseParams.INPUT,
    LLMTestCaseParams.ACTUAL_OUTPUT,
]


class AnswerRelvancyVerdict(BaseModel):
    verdict: str
    reason: str = Field(default=None)


class AnswerRelevancyMetric(BaseMetric):
    def __init__(
        self,
        metadata: MetadataAggregator,
        model: EvalBaseLLM,
        template: Optional[AnswerRelevancyTemplate] = None,
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
        self.template = template or AnswerRelevancyTemplate()

    def measure(self, test_case: LLMTestCase) -> float:
        check_test_case_params(test_case, required_params, self.__name__)

        with metric_progress_indicator(self):
            if self.async_mode:
                loop = get_or_create_event_loop()
                loop.run_until_complete(
                    self.a_measure(test_case, _show_indicator=False)
                )
            else:
                self.statements: List[str] = self._generate_statements(
                    test_case.actual_output
                )
                self.verdicts: List[AnswerRelvancyVerdict] = (
                    self._generate_verdicts(test_case.input)
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
            self, async_mode=True, _show_indicator=_show_indicator
        ):
            self.statements: List[str] = await self._a_generate_statements(
                test_case.actual_output
            )
            self.verdicts: List[AnswerRelvancyVerdict] = (
                await self._a_generate_verdicts(test_case.input)
            )
            self.score = self._calculate_score()
            self.reason = await self._a_generate_reason(test_case.input)
            self.success = self.score >= self.threshold
            capture_metric_type(self.__name__)
            return self.score

    async def _a_generate_reason(self, input: str) -> str | None:
        if self.include_reason is False:
            return None

        irrelevant_statements = []
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                irrelevant_statements.append(verdict.reason)

        prompt = self.template.generate_reason(
            irrelevant_statements=irrelevant_statements,
            input=input,
            score=format(self.score, ".2f"),
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    def _generate_reason(self, input: str) -> str | None:
        if self.include_reason is False:
            return None

        irrelevant_statements = []
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() == "no":
                irrelevant_statements.append(verdict.reason)

        prompt = self.template.generate_reason(
            irrelevant_statements=irrelevant_statements,
            input=input,
            score=format(self.score, ".2f"),
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        return res.get('content')

    async def _a_generate_verdicts(
        self, input: str
    ) -> List[AnswerRelvancyVerdict]:
        if len(self.statements) == 0:
            return []

        prompt = self.template.generate_verdicts(
            input=input,
            actual_output=self.statements,
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        verdicts = [AnswerRelvancyVerdict(**item) for item in data["verdicts"]]
        return verdicts

    def _generate_verdicts(self, input: str) -> List[AnswerRelvancyVerdict]:
        if len(self.statements) == 0:
            return []

        prompt = self.template.generate_verdicts(
            input=input,
            actual_output=self.statements,
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        verdicts = [AnswerRelvancyVerdict(**item) for item in data["verdicts"]]
        return verdicts

    async def _a_generate_statements(
        self,
        actual_output: str,
    ) -> List[str]:
        prompt = self.template.generate_statements(
            actual_output=actual_output,
        )
        res = await self.model.a_generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        return data["statements"]

    def _generate_statements(
        self,
        actual_output: str,
    ) -> List[str]:
        prompt = self.template.generate_statements(
            actual_output=actual_output,
        )
        res = self.model.generate(prompt)
        self.metadata.collect_metadata(res.get('response_metadata'))
        data = trim_and_load_json(res.get('content'))
        return data["statements"]

    def _calculate_score(self) -> float:
        number_of_verdicts = len(self.verdicts)
        if number_of_verdicts == 0:
            return 1

        relevant_count = 0
        for verdict in self.verdicts:
            if verdict.verdict.strip().lower() != "no":
                relevant_count += 1

        score = relevant_count / number_of_verdicts
        return 0 if self.strict_mode and score < self.threshold else score

    def is_successful(self) -> bool:
        self.success = self.score >= self.threshold
        return self.success

    @property
    def __name__(self):
        return "Answer Relevancy"
