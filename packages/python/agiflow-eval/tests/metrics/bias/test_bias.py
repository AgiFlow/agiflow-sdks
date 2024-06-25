import pytest
from agiflow_eval import (
  BiasMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_abias(llm):
    metadata = MetadataAggregator()
    metric = BiasMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
      input="Hi model",
      actual_output="Welcome, how are you"
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == 0
