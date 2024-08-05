from __future__ import annotations

from typing import List, Optional

from pydantic import Field
from .agiflow_attributes import AgiflowSpanAttributesValidator


class GenAISpanAttributes():
    GEN_AI_REQUEST_MODEL = 'gen_ai.request.model'
    GEN_AI_REQUEST_MAX_TOKENS = 'gen_ai.request.max_tokens'
    GEN_AI_REQUEST_TEMPERATURE = 'gen_ai.request.temperature'
    GEN_AI_REQUEST_TOP_P = 'gen_ai.request.top_p'
    GEN_AI_RESPONSE_MODEL = 'gen_ai.response.model'
    GEN_AI_RESPONSE_ID = 'gen_ai.response.id'
    GEN_AI_RESPONSE_FINISH_REASONS = 'gen_ai.response.finish_reasons'
    GEN_AI_OPERATION_NAME = 'gen_ai.operation.name'
    GEN_AI_PROMPT = 'gen_ai.prompt'
    GEN_AI_SYSTEM = 'gen_ai.system'
    GEN_AI_COMPLETION = 'gen_ai.completion'
    GEN_AI_USAGE_OUTPUT_TOKENS = 'gen_ai.usage.output_tokens'
    GEN_AI_USAGE_INPUT_TOKENS = 'gen_ai.usage.input_tokens'
    GEN_AI_USAGE_SEARCH_UNITS = 'gen_ai.usage.search_units'


class GenAISpanAttributesValidator(AgiflowSpanAttributesValidator):
    GEN_AI_REQUEST_MODEL: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_REQUEST_MODEL)
    GEN_AI_REQUEST_MAX_TOKENS: Optional[int] = Field(None, alias=GenAISpanAttributes.GEN_AI_REQUEST_MAX_TOKENS)
    GEN_AI_REQUEST_TEMPERATURE: Optional[float] = Field(None, alias=GenAISpanAttributes.GEN_AI_REQUEST_TEMPERATURE)
    GEN_AI_REQUEST_TOP_P: Optional[float] = Field(None, alias=GenAISpanAttributes.GEN_AI_REQUEST_TOP_P)
    GEN_AI_RESPONSE_MODEL: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_RESPONSE_MODEL)
    GEN_AI_RESPONSE_ID: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_RESPONSE_ID)
    GEN_AI_RESPONSE_FINISH_REASONS: Optional[List[str]] = Field(
        None,
        alias=GenAISpanAttributes.GEN_AI_RESPONSE_FINISH_REASONS
        )
    # Type of llm called (Completion, Chat, Image Genration)
    GEN_AI_OPERATION_NAME: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_OPERATION_NAME)
    GEN_AI_PROMPT: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_PROMPT)
    GEN_AI_COMPLETION: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_COMPLETION)
    GEN_AI_SYSTEM: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_SYSTEM)
    GEN_AI_USAGE_OUTPUT_TOKENS: Optional[int] = Field(
        None,
        alias=GenAISpanAttributes.GEN_AI_USAGE_OUTPUT_TOKENS
        )
    GEN_AI_USAGE_INPUT_TOKENS: Optional[int] = Field(None, alias=GenAISpanAttributes.GEN_AI_USAGE_INPUT_TOKENS)
    GEN_AI_USAGE_SEARCH_UNITS: Optional[int] = Field(None, alias=GenAISpanAttributes.GEN_AI_USAGE_SEARCH_UNITS)
