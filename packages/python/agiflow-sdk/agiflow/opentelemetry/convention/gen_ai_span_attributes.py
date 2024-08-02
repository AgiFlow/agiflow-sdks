from __future__ import annotations

from typing import Optional

from pydantic import Field
from .agiflow_attributes import AgiflowSpanAttributesValidator


class GenAISpanAttributes():
    GEN_AI_REQUEST_MODEL = 'gen_ai.request.model'
    GEN_AI_REQUEST_MAX_TOKENS = 'gen_ai.request.max_tokens'
    GEN_AI_RESPONSE_MODEL = 'gen_ai.response.model'
    GEN_AI_OPERATION_NAME = 'gen_ai.operation.name'
    GEN_AI_PROMPT = 'gen_ai.prompt'
    GEN_AI_SYSTEM = 'gen_ai.system'
    GEN_AI_COMPLETION = 'gen_ai.completion'


class GenAISpanAttributesValidator(AgiflowSpanAttributesValidator):
    GEN_AI_REQUEST_MODEL: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_REQUEST_MODEL)
    GEN_AI_REQUEST_MAX_TOKENS: Optional[int] = Field(None, alias=GenAISpanAttributes.GEN_AI_REQUEST_MAX_TOKENS)
    GEN_AI_RESPONSE_MODEL: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_RESPONSE_MODEL)
    # Type of llm called (Completion, Chat, Image Genration)
    GEN_AI_OPERATION_NAME: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_OPERATION_NAME)
    GEN_AI_PROMPT: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_PROMPT)
    GEN_AI_COMPLETION: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_COMPLETION)
    GEN_AI_SYSTEM: Optional[str] = Field(None, alias=GenAISpanAttributes.GEN_AI_SYSTEM)
