from __future__ import annotations

from typing import Optional

from pydantic import Field
from .agiflow_attributes import AgiflowSpanAttributesValidator


class LLMSpanAttributes():
    OPENAI_API_BASE = 'openai.api_base'
    OPENAI_API_VERSION = 'openai.api_version'
    OPENAI_API_TYPE = 'openai.api_type'
    URL_FULL = 'url.full'
    LLM_API = 'llm.api'
    LLM_MODEL = 'llm.model'
    LLM_TYPE = 'llm.type'
    # Detect if the wrapper include instrumented llm or not
    LLM_WRAPPER = 'llm.wrapper'
    LLM_TEMPERATURE = 'llm.temperature'
    LLM_TOP_P = 'llm.top_p'
    LLM_TOP_K = 'llm.top_k'
    LLM_USER = 'llm.user'
    LLM_SYSTEM_FINGERPRINT = 'llm.system.fingerprint'
    LLM_PROMPTS = 'llm.prompts'
    LLM_RESPONSES = 'llm.responses'
    LLM_TOKEN_COUNTS = 'llm.token.counts'
    LLM_STREAM = 'llm.stream'
    LLM_ENCODING_FORMAT = 'llm.encoding.format'
    LLM_DIMENSIONS = 'llm.dimensions'
    LLM_GENERATION_ID = 'llm.generation_id'
    LLM_RESPONSE_ID = 'llm.response_id'
    LLM_CITATIONS = 'llm.citations'
    LLM_DOCUMENTS = 'llm.documents'
    LLM_IS_SEARCH_REQUIRED = 'llm.is_search_required'
    LLM_SEARCH_RESULTS = 'llm.search_results'
    LLM_TOOL_CALLS = 'llm.tool_calls'
    LLM_MAX_TOKENS = 'llm.max_tokens'
    LLM_MAX_INPUT_TOKENS = 'llm.max_input_tokens'
    LLM_CONVERSATION_ID = 'llm.conversation_id'
    LLM_SEED = 'llm.seed'
    LLM_FREQUENCY_PENALTY = 'llm.frequency_penalty'
    LLM_PRESENCE_PENALTY = 'llm.presence_penalty'
    LLM_CONNECTORS = 'llm.connectors'
    LLM_TOOLS = 'llm.tools'
    LLM_TOOL_RESULTS = 'llm.tool_results'
    LLM_EMBEDDING_INPUTS = 'llm.embedding_inputs'
    LLM_EMBEDDING_DATASET_ID = 'llm.embedding_dataset_id'
    LLM_EMBEDDING_INPUT_TYPE = 'llm.embedding_input_type'
    LLM_EMBEDDING_JOB_NAME = 'llm.embedding_job_name'
    LLM_RETRIEVAL_QUERY = 'llm.retrieval.query'
    LLM_RETRIEVAL_RESULTS = 'llm.retrieval.results'
    HTTP_MAX_RETRIES = 'http.max.retries'
    HTTP_TIMEOUT = 'http.timeout'


class LLMSpanAttributesValidator(AgiflowSpanAttributesValidator):
    OPENAI_API_BASE: Optional[str] = Field(None, alias=LLMSpanAttributes.OPENAI_API_BASE)
    OPENAI_API_BASE_VERSION: Optional[str] = Field(None, alias=LLMSpanAttributes.OPENAI_API_VERSION)
    OPENAI_API_TYPE: Optional[str] = Field(None, alias=LLMSpanAttributes.OPENAI_API_TYPE)
    URL_FULL: Optional[str] = Field(None, alias=LLMSpanAttributes.URL_FULL)
    LLM_API: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_API)
    LLM_WRAPPER: Optional[bool] = Field(None, alias=LLMSpanAttributes.LLM_WRAPPER)
    LLM_MODEL: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_MODEL)
    # Type of llm called (Completion, Chat, Image Genration)
    LLM_TYPE: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_TYPE)
    LLM_TEMPERATURE: Optional[float] = Field(None, alias=LLMSpanAttributes.LLM_TEMPERATURE)
    LLM_TOP_P: Optional[float] = Field(None, alias=LLMSpanAttributes.LLM_TOP_P)
    LLM_TOP_K: Optional[float] = Field(None, alias=LLMSpanAttributes.LLM_TOP_K)
    LLM_USER: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_USER)
    LLM_SYSTEM_FINGERPRINT: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_SYSTEM_FINGERPRINT)
    LLM_PROMPTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_PROMPTS)
    LLM_RESPONSES: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_RESPONSES)
    LLM_TOKEN_COUNTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_TOKEN_COUNTS)
    LLM_STREAM: Optional[bool] = Field(None, alias=LLMSpanAttributes.LLM_STREAM)
    LLM_ENCODING_FORMATS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_ENCODING_FORMAT)
    LLM_DIMENSIONS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_DIMENSIONS)
    LLM_GENERATION_ID: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_GENERATION_ID)
    LLM_RESPONSE_ID: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_RESPONSE_ID)
    LLM_CITATIONS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_CITATIONS)
    LLM_DOCUMENTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_DOCUMENTS)
    LLS_IS_SEARCH_REQUIRED: Optional[bool] = Field(None, alias=LLMSpanAttributes.LLM_IS_SEARCH_REQUIRED)
    LLM_SEARCH_RESULTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_SEARCH_RESULTS)
    LLM_TOOL_CALLS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_TOOL_CALLS)
    LLM_MAX_TOKENS: Optional[int] = Field(None, alias=LLMSpanAttributes.LLM_MAX_TOKENS)
    LLM_MAX_INPUT_TOKENS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_MAX_INPUT_TOKENS)
    LLM_CONVERSATION_ID: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_CONVERSATION_ID)
    LLM_SEED: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_SEED)
    LLM_FREQUENCY_PENALTY: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_FREQUENCY_PENALTY)
    LLM_PRESENCE_PENALTY: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_PRESENCE_PENALTY)
    LLM_CONNECTORS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_CONNECTORS)
    LLM_TOOLS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_TOOLS)
    LLM_TOOL_RESULTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_TOOL_RESULTS)
    LLM_EMBEDDING_INPUTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_EMBEDDING_INPUTS)
    LLM_EMBEDDING_DATASET_ID: Optional[str] = Field(
        None, alias=LLMSpanAttributes.LLM_EMBEDDING_DATASET_ID
    )
    LLM_EMBEDDING_INPUT_TYPE: Optional[str] = Field(
        None, alias=LLMSpanAttributes.LLM_EMBEDDING_INPUT_TYPE
    )
    LLM_EMBEDDING_JOB_NAME: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_EMBEDDING_JOB_NAME)
    LLM_RETRIEVAL_QUERY: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_RETRIEVAL_QUERY)
    LLM_RETRIEVAL_RESULTS: Optional[str] = Field(None, alias=LLMSpanAttributes.LLM_RETRIEVAL_RESULTS)
    HTTP_MAX_RETRIES: Optional[int] = Field(None, alias=LLMSpanAttributes.HTTP_MAX_RETRIES)
    HTTP_TIMEOUT: Optional[int] = Field(None, alias=LLMSpanAttributes.HTTP_TIMEOUT)
