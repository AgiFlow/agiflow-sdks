import pytest
from agiflow_eval import (
  ToxicityMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_toxicity_ameasure(llm):
    metadata = MetadataAggregator()
    metric = ToxicityMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
      input="How are you doing?",
      actual_output="I'm busy; don't ask me"
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == 0


@pytest.mark.vcr()
def test_toxicity_measure(llm):
    metadata = MetadataAggregator()
    metric = ToxicityMetric(model=llm, metadata=metadata, async_mode=False)
    test_case = LLMTestCase(
      input="How are you doing?",
      actual_output="I'm busy; don't ask me"
    )
    score = metric.measure(test_case=test_case)
    assert score == 0
