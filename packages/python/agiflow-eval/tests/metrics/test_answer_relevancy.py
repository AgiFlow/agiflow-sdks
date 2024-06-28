import pytest
from agiflow_eval import (
  AnswerRelevancyMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_answer_relevancy_ameasure(llm):
    metadata = MetadataAggregator()
    metric = AnswerRelevancyMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
      input="Hi model",
      actual_output="Welcome, how are you"
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == 0


@pytest.mark.vcr()
def test_answer_relevancy_measure(llm):
    metadata = MetadataAggregator()
    metric = AnswerRelevancyMetric(model=llm, metadata=metadata, async_mode=False)
    test_case = LLMTestCase(
      input="What is the current temperature",
      actual_output="Winter time, so 9deg"
    )
    score = metric.measure(test_case=test_case)
    assert score == 0.5
