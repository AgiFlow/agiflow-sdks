from jinja2 import Template


VERDICTS_TEMPLATE = """For each context in contexts, which is a list of strings, please generate a list of JSON objects to indicate whether the given 'actual output' agrees with EACH context. The JSON will have 2 fields: 'verdict' and 'reason'.
The 'verdict' key should STRICTLY be either 'yes' or 'no', and states whether the given text agrees with the context.
The 'reason' is the reason for the verdict. When the answer is 'no', try to provide a correction in the reason.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'verdicts' key as a list of JSON objects.
Example contexts: ["Einstein won the Nobel Prize for his discovery of the photoelectric effect.", "Einstein won the Nobel Prize in 1968."]
Example actual output: "Einstein won the Nobel Prize in 1969 for his discovery of the photoelectric effect."

Example:
{{ '{{' }}
    "verdicts": [
        {{ '{{' }}
            "verdict": "yes",
            "reason": "The actual output agrees with the provided context which states that Einstein won the Nobel Prize for his discovery of the photoelectric effect."
        {{ '}}' }},
        {{ '{{' }}
            "verdict": "no",
            "reason": "The actual output contradicts the provided context which states that Einstein won the Nobel Prize in 1968, not 1969."
        {{ '}}' }}
    ]
{{ '}}' }}

You should NOT incorporate any prior knowledge you have and take each context at face value. Since you are going to generate a verdict for each context, the number of 'verdicts' SHOULD BE STRICTLY EQUAL to that of contexts.
You should FORGIVE cases where the actual output is lacking in detail, you should ONLY provide a 'no' answer if IT IS A CONTRADICTION.
**

Contexts:
{{ contexts }}

Actual Output:
{{ actual_output }}

JSON:
"""  # noqa: E501

REASON_TEMPLATE = """Given a list of factual alignments and contradictions, which highlights alignment/contradictions between the `actual output` and `contexts, use it to provide a reason for the hallucination score in a CONCISELY. Note that The hallucination score ranges from 0 - 1, and the lower the better.

Factual Alignments:
{{ factual_alignments }}

Contradictions:
{{ contradictions }}

Hallucination Score:
{{ score }}

Example:
The score is <hallucination_score> because <your_reason>.

Reason:
"""  # noqa: E501


class HallucinationTemplate:
    def __init__(
        self,
        verdicts_template=None,
        reason_template=None,
    ):
        self.verdicts_template = verdicts_template or VERDICTS_TEMPLATE
        self.reason_template = reason_template or REASON_TEMPLATE

    def generate_verdicts(self, actual_output=None, contexts=None):
        return Template(self.verdicts_template).render(
          actual_output=actual_output,
          contexts=contexts,
        )

    def generate_reason(self, factual_alignments=None, contradictions=None, score=None):
        return Template(self.reason_template).render(
          factual_alignments=factual_alignments,
          contradictions=contradictions,
          score=score,
        )
