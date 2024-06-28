import pytest
from agiflow_eval import (
  ContextualRelevancyMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_contextual_relevancy_ameasure(llm):
    metadata = MetadataAggregator()
    metric = ContextualRelevancyMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
        input="Which country is largest in size?",
        actual_output="Russia",
        retrieval_context=[
          "Russia",
          "US",
          "Australia"
        ]
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == (1 / 3)


@pytest.mark.vcr()
def test_contextual_relevancy_measure(llm):
    metadata = MetadataAggregator()
    metric = ContextualRelevancyMetric(model=llm, metadata=metadata, async_mode=False)
    test_case = LLMTestCase(
        input="Which country is largest in size?",
        actual_output="Russia",
        retrieval_context=[
          "Russia",
          "US",
          "Australia"
        ]
    )
    score = metric.measure(test_case=test_case)
    assert score == (1 / 3)
