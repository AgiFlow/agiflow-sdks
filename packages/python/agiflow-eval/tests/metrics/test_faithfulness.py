import pytest
from agiflow_eval import (
  FaithfulnessMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_faithfulness_ameasure(llm):
    metadata = MetadataAggregator()
    metric = FaithfulnessMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
        input="Which emotion is negative?",
        actual_output="Angry",
        retrieval_context=[
          "Sad",
          "Angry",
          "Depressed"
        ]
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == 1


@pytest.mark.vcr()
def test_faithfulness_measure(llm):
    metadata = MetadataAggregator()
    metric = FaithfulnessMetric(model=llm, metadata=metadata, async_mode=False)
    test_case = LLMTestCase(
        input="Which emotion is negative?",
        actual_output="Angry",
        retrieval_context=[
          "Sad",
          "Angry",
          "Depressed"
        ]
    )
    score = metric.measure(test_case=test_case)
    assert score == 1
