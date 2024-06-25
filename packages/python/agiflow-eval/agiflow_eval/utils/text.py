import json
from typing import Any
import re
import string


def trim_and_load_json(input_string: str) -> Any:
    start = input_string.find("{")
    end = input_string.rfind("}") + 1
    jsonStr = input_string[start:end] if start != -1 and end != 0 else ""
    if jsonStr.startswith("{{") and jsonStr.endswith("}}"):
        jsonStr = jsonStr[1:(len(jsonStr) - 1)]

    try:
        return json.loads(jsonStr)
    except json.JSONDecodeError:
        raise ValueError(
            "Error: Evaluation LLM outputted an invalid JSON. Please use a better evaluation model."
        )
    except Exception as e:
        raise Exception(f"An unexpected error occurred: {str(e)}")


def chunk_text(text, chunk_size=20):
    words = text.split()
    chunks = [
        " ".join(words[i: i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]
    return chunks


def normalize_text(text: str) -> str:
    """Lower text and remove punctuation, articles and extra whitespace.
    Copied from the [QuAC](http://quac.ai/) evaluation script found at
    https://s3.amazonaws.com/my89public/quac/scorer.py"""

    def remove_articles(text: str) -> str:
        return re.sub(r"\b(a|an|the)\b", " ", text)

    def white_space_fix(text: str) -> str:
        return " ".join(text.split())

    def remove_punc(text: str) -> str:
        exclude = set(string.punctuation)
        return "".join(ch for ch in text if ch not in exclude)

    def lower(text: str) -> str:
        return text.lower()

    return white_space_fix(remove_articles(remove_punc(lower(text))))
