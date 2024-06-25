from jinja2 import Template


STATEMENTS_TEMPLATE = """Given the text, breakdown and generate a list of statements presented. Ambiguous statements and single words can also be considered as statements.

Example:
Example text: Shoes. The shoes can be refunded at no extra cost. Thanks for asking the question!

{{ '{{' }}
    "statements": ["Shoes.", "Shoes can be refunded at no extra cost", "Thanks for asking the question!"]
{{ '}}' }}
===== END OF EXAMPLE ======

Text:
{{ actual_output }}

**
IMPORTANT: Please make sure to only return in JSON format, with the "statements" key mapping to a list of strings. No words or explanation is needed.
**

JSON:
"""  # noqa: E501

VERDICTS_TEMPLATE = """For the provided list of statements, determine whether each statement is relevant to address the input.
Please generate a list of JSON with two keys: `verdict` and `reason`.
The 'verdict' key should STRICTLY be either a 'yes', 'idk' or 'no'. Answer 'yes' if the statement is relevant to addressing the original input, 'no' if the statement is irrelevant, and 'idk' if it is ambiguous (eg., not directly relevant but could be used as a supporting point to address the input).
The 'reason' is the reason for the verdict.
Provide a 'reason' ONLY if the answer is 'no'.
The provided statements are statements made in the actual output.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'verdicts' key mapping to a list of JSON objects.
Example input: What should I do if there is an earthquake?
Example statements: ["Shoes.", "Thanks for asking the question!", "Is there anything else I can help you with?", "Duck and hide"]
Example JSON:
{{ '{{' }}
    "verdicts": [
        {{ '{{' }}
            "verdict": "no",
            "reason": "The 'Shoes.' statement made in the actual output is completely irrelevant to the input, which asks about what to do in the event of an earthquake."
        {{ '}}' }},
        {{ '{{' }}
            "verdict": "idk"
        {{ '}}' }},
        {{ '{{' }}
            "verdict": "idk"
        {{ '}}' }},
        {{ '{{' }}
            "verdict": "yes"
        {{ '}}' }}
    ]
{{ '}}' }}

Since you are going to generate a verdict for each statement, the number of 'verdicts' SHOULD BE STRICTLY EQUAL to the number of `statements`.
**

Input:
{{ input }}

Statements:
{{ actual_output }}

JSON:
"""  # noqa: E501

REASON_TEMPLATE = """Given the answer relevancy score, the list of reasons of irrelevant statements made in the actual output, and the input, provide a CONCISE reason for the score. Explain why it is not higher, but also why it is at its current score.
The irrelevant statements represent things in the actual output that is irrelevant to addressing whatever is asked/talked about in the input.
If there is nothing irrelevant, just say something positive with an upbeat encouraging tone (but don't overdo it otherwise it gets annoying).

Answer Relevancy Score:
{{ score }}

Reasons why the score can't be higher based on irrelevant statements in the actual output:
{{ irrelevant_statements }}

Input:
{{ input }}

Example:
The score is <answer_relevancy_score> because <your_reason>.

Reason:
"""  # noqa: E501


class AnswerRelevancyTemplate:
    def __init__(
        self,
        statements_template=None,
        verdicts_template=None,
        reason_template=None,
    ):
        self.statements_template = statements_template or STATEMENTS_TEMPLATE
        self.verdicts_template = verdicts_template or VERDICTS_TEMPLATE
        self.reason_template = reason_template or REASON_TEMPLATE

    def generate_statements(self, actual_output=None):
        return Template(self.statements_template).render(actual_output=actual_output)

    def generate_verdicts(self, input=None, actual_output=None):
        return Template(self.verdicts_template).render(
          input=input,
          actual_output=actual_output
        )

    def generate_reason(self, irrelevant_statements=None, input=None, score=None):
        return Template(self.reason_template).render(
          input=input,
          irrelevant_statements=irrelevant_statements,
          score=score
        )
