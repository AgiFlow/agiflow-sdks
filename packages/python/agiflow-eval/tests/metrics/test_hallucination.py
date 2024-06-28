import pytest
from agiflow_eval import (
  HallucinationMetric,
  MetadataAggregator,
  LLMTestCase,
)


@pytest.mark.vcr()
async def test_hallucination_ameasure(llm):
    metadata = MetadataAggregator()
    metric = HallucinationMetric(model=llm, metadata=metadata)
    test_case = LLMTestCase(
        input="Which emotion is negative?",
        actual_output="Angry",
        context=[
          "Sad",
          "Angry",
          "Depressed"
        ]
    )
    score = await metric.a_measure(test_case=test_case)
    assert score == (1 * 2 / 3)


@pytest.mark.vcr()
def test_hallucination_measure(llm):
    metadata = MetadataAggregator()
    metric = HallucinationMetric(model=llm, metadata=metadata, async_mode=False)
    test_case = LLMTestCase(
        input="Which emotion is negative?",
        actual_output="Angry",
        context=[
          "Sad",
          "Angry",
          "Depressed"
        ]
    )
    score = metric.measure(test_case=test_case)
    assert score == (1 * 2 / 3)
