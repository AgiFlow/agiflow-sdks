"""
Copyright (c) 2024 AGIFlow

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import logging
from agiflow.opentelemetry.convention.constants import LLMResponseKeys, LLMTokenUsageKeys, LLMTypes
from agiflow.opentelemetry.convention.llm_span_attributes import LLMSpanAttributesValidator
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
  LLMPromptRoles,
  LLMPromptKeys
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import LangchainSpanCapture

logger = logging.getLogger(__name__)


class ChatSpanCapture(LangchainSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @staticmethod
    def get_model(instance):
        if hasattr(instance, "model"):
            model = instance.model
        elif hasattr(instance, "model_name"):
            model = instance.model_name
        elif hasattr(instance, "model_id"):
            model = instance.model_id
        else:
            model = "unknown"

        return model

    def capture_input(self):
        model = ChatSpanCapture.get_model(self.instance)
        base_url = ''

        if hasattr(self.instance, 'base_url'):
            base_url = self.instance.base_url

        span_attributes = {
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.URL_FULL: base_url,
          SpanAttributes.LLM_API: self.instance.__class__.__name__,
          SpanAttributes.LLM_MODEL: model,
          SpanAttributes.LLM_TYPE: LLMTypes.CHAT,
        }

        if hasattr(self.instance, "dict") and callable(self.instance.dict):
            params = self.instance.dict()
            options = params.get('options')
            if options is not None:
                try:
                    span_attributes[SpanAttributes.LLM_TEMPERATURE] = options.get("temperature")
                    span_attributes[SpanAttributes.LLM_TOP_P] = options.get("top_p")
                    span_attributes[SpanAttributes.LLM_TOP_K] = options.get("top_k")
                except Exception as e:
                    logger.error(e)

        prompts = []
        if should_send_prompts():
            messages = self.fargs[0] if len(self.fargs) > 0 else self.fkwargs.get("messages", [])
            prompts = []
            for idx, prompt in enumerate(messages[0]):
                prompts.append({
                  LLMPromptKeys.ROLE:
                  LLMPromptRoles.USER if prompt.type == "human" else prompt.type,
                  LLMPromptKeys.CONTENT:
                  serialise_to_json(prompt.content) if isinstance(prompt.content, list) else prompt.content
                })

        span_attributes[SpanAttributes.LLM_PROMPTS] = serialise_to_json(prompts)

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            completion_tokens = 0
            prompt_tokens = 0
            total_tokens = 0
            responses = []
            for idx, generation in enumerate(result.generations):
                responses.append({LLMResponseKeys.CONTENT: generation[0].text})

            self.set_span_attribute(
                SpanAttributes.LLM_RESPONSES,
                serialise_to_json(responses),
            )
            try:
                token_usage = generation[0].message.response_metadata['token_usage']
                if hasattr(token_usage, 'completion_tokens'):
                    completion_tokens += token_usage.completion_tokens
                    prompt_tokens += token_usage.prompt_tokens
                    total_tokens += (token_usage.completion_tokens + token_usage.prompt_tokens)
                elif token_usage is not None:
                    completion_tokens += token_usage.get('completion_tokens', 0)
                    prompt_tokens += token_usage.get('prompt_tokens', 0)
                    total_tokens += (token_usage.get('completion_tokens', 0) + token_usage.get('prompt_tokens', 0))
            except Exception:
                prompt_tokens = 0

            usage_dict = {
                LLMTokenUsageKeys.PROMPT_TOKENS: prompt_tokens,
                LLMTokenUsageKeys.COMPLETION_TOKENS: completion_tokens,
                LLMTokenUsageKeys.TOTAL_TOKENS: total_tokens,
            }
            self.set_span_attribute(SpanAttributes.LLM_TOKEN_COUNTS, serialise_to_json(usage_dict))
