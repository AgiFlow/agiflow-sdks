import pytest
from agiflow_eval import (
  AnswerRelevancyMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_abias(llm):
    metadata = MetadataAggregator()
    metric = AnswerRelevancyMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
      input="Hi model",
      actual_output="Welcome, how are you"
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == 0
