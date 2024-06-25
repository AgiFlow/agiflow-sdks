# AGIFlow Eval

## Overview

`agiflow_eval` is a customizable evaluation library designed to measure various metrics for language model outputs. It provides tools to evaluate aspects such as answer relevancy, hallucination, bias, faithfulness, contextual relevancy, and toxicity. The library is ported from the awesome [DeepEval](https://github.com/confident-ai/deepeval) to support custom evaluation templates and LLM models.

## Installation

First, ensure you have the necessary packages installed. You can install the required dependencies using `pip`:

```bash
pip install agiflow-eval
```

## Usage

To use the metrics, first initialize the model and aggregator:

```python
from agiflow_eval import (
  EvalLiteLLM,
  MetadataAggregator,
)

metadata = MetadataAggregator()
model = EvalLiteLLM()
```

Then create the test case and measure the metric as follows:

### Answer Relevancy Metric

Evaluates the relevancy of an answer given a specific input.

```python
from agiflow_eval import AnswerRelevancyMetric, LLMTestCase

metric = AnswerRelevancyMetric(metadata=metadata, model=model)
test_case = LLMTestCase(input="input text", actual_output="actual output text")
score = await metric.a_measure(test_case)
```

### Bias Metric

Measures the presence of bias in the model's output.

```python
from agiflow_eval import BiasMetric, LLMTestCase

metric = BiasMetric(metadata=metadata, model=model)
test_case = LLMTestCase(input="input text", actual_output="actual output text")
score = await metric.a_measure(test_case)
```

### Contextual Relevancy Metric

Assesses the relevancy of the output in a given context.

```python
from agiflow_eval import ContextualRelevancyMetric, LLMTestCase

metric = ContextualRelevancyMetric(metadata=metadata, model=model)
test_case = LLMTestCase(
  input="input text", 
  actual_output="actual output text",
  retrieval_context="retrieval context text"
)
score = await metric.a_measure(test_case)
```

### Faithfulness Metric

Determines the faithfulness of the model's output to the given context or input.

```python
from agiflow_eval import FaithfulnessMetric, LLMTestCase

metric = FaithfulnessMetric(metadata=metadata, model=model)
test_case = LLMTestCase(
  input="input text", 
  actual_output="actual output text",
  retrieval_context="retrieval context text"
)
score = await metric.a_measure(test_case)
```

### Hallucination Metric

Measures the degree of hallucination in the model's output.

```python
from agiflow_eval import HallucinationMetric, LLMTestCase

metric = HallucinationMetric(metadata=metadata, model=model)
test_case = LLMTestCase(
  input="input text", 
  actual_output="actual output text",
  context="context text"
)
score = await metric.a_measure(test_case)
```

### Toxicity Metric

Evaluates the toxicity level of the model's output.

```python
from agiflow_eval import ToxicityMetric, LLMTestCase

metric = ToxicityMetric(metadata=metadata, model=model)
test_case = LLMTestCase(
  input="input text", 
  actual_output="actual output text"
)
score = await metric.a_measure(test_case)
```

## Custom Template
You can simply extends the Default Metric Template class and pass it to Metric class as follow:  

``` python
from agiflow_eval import ToxicityMetric, ToxicityTemplate, LLMTestCase

class YourTemplate(ToxicityTemplate):
...

metric = ToxicityMetric(metadata=metadata, model=model, template=YourTemplate())
```


## Contributing

We welcome contributions to `agiflow_eval`. Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get involved.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Special thanks to the [DeepEval](https://github.com/confident-ai/deepeval) project for providing the foundation upon which this library is built.

## Contact

For any questions or feedback, please open an issue or reach out via the project's contact information.
