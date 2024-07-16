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
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
  AgiflowServiceTypes,
  Event,
  LLMPromptRoles,
  LLMResponseKeys,
  LLMTypes,
  LLMSpanAttributesValidator
)
from agiflow.opentelemetry.utils import should_send_prompts
from opentelemetry.trace import StatusCode
from .base import LangchainCoreSpanCapture

logger = logging.getLogger(__name__)


class LLMSpanCapture(LangchainCoreSpanCapture):
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
        span_attributes = {
          SpanAttributes.URL_FULL: "",
          SpanAttributes.LLM_API: self.instance.__class__.__name__,
          SpanAttributes.LLM_MODEL: LLMSpanCapture.get_model(self.instance),
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.LLM_TYPE: LLMTypes.COMPLETION,
        }

        if hasattr(self.instance, "_identifying_params"):
            try:
                params = self.instance._identifying_params
                options = params.get("options")
                if options is not None:
                    span_attributes[SpanAttributes.LLM_TEMPERATURE] = options.get("temperature")
                    span_attributes[SpanAttributes.LLM_TOP_P] = options.get("top_p")
                    span_attributes[SpanAttributes.LLM_TOP_K] = options.get("top_k")
            except Exception as e:
                logger.error(e)

        if should_send_prompts() and self.fargs[0]:
            prompts = []
            for idx, prompt in enumerate(self.fargs[0]):
                prompts.append({LLMPromptRoles.USER: prompt})

            span_attributes[SpanAttributes.LLM_PROMPTS] = serialise_to_json(prompts)

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            responses = []
            for idx, generation in enumerate(result.generations):
                responses.append({LLMResponseKeys.CONTENT: generation[0].text})
            self.set_span_attribute(
                SpanAttributes.LLM_RESPONSES,
                serialise_to_json(responses),
            )


class LLMStreamSpanCapture(LangchainCoreSpanCapture):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def is_streaming(self):
        return True

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
        span_attributes = {
          SpanAttributes.URL_FULL: "",
          SpanAttributes.LLM_API: self.instance.__class__.__name__,
          SpanAttributes.LLM_MODEL: LLMSpanCapture.get_model(self.instance),
          SpanAttributes.AGIFLOW_SERVICE_TYPE: AgiflowServiceTypes.LLM,
          SpanAttributes.LLM_TYPE: LLMTypes.COMPLETION,
        }

        if hasattr(self.instance, "_identifying_params"):
            try:
                params = self.instance._identifying_params
                options = params.get("options")
                if options is not None:
                    span_attributes[SpanAttributes.LLM_TEMPERATURE] = options.get("temperature")
                    span_attributes[SpanAttributes.LLM_TOP_P] = options.get("top_p")
                    span_attributes[SpanAttributes.LLM_TOP_K] = options.get("top_k")
            except Exception as e:
                logger.error(e)

        if should_send_prompts() and self.fargs[0]:
            prompts = []
            for idx, prompt in enumerate(self.fargs[0]):
                prompts.append({LLMPromptRoles.USER: prompt})

            span_attributes[SpanAttributes.LLM_PROMPTS] = serialise_to_json(prompts)

        self.set_span_attributes_from_pydantic(span_attributes, LLMSpanAttributesValidator)

    def capture_stream_end(self, result, result_content):
        # Finalize span after processing all chunks
        self.span.add_event(Event.STREAM_END)
        self.span.set_attribute(
            SpanAttributes.LLM_RESPONSES,
            serialise_to_json(
                [
                    {
                        LLMResponseKeys.ROLE: "assistant",
                        LLMResponseKeys.CONTENT: "".join(result_content),
                    }
                ]
            ),
        )
        self.span.set_status(StatusCode.OK)
        self.span.end()

    def capture_chunk(self, result_content, chunk):
        if hasattr(chunk, "model") and chunk.model is not None:
            self.span.set_attribute(SpanAttributes.LLM_MODEL, chunk.model)

        result_content.append(chunk)

    def capture_stream_output(self, result):
        """Process and yield streaming response chunks synchronously."""
        result_content = []
        self.span.add_event(Event.STREAM_START)
        try:
            for chunk in result:
                self.capture_chunk(result_content, chunk)
                yield chunk
        finally:
            self.capture_stream_end(result, result_content)

    async def acapture_stream_output(self, result):
        """Process and yield streaming response chunks asynchronously."""
        result_content = []
        self.span.add_event(Event.STREAM_START)
        try:
            async for chunk in result:
                self.capture_chunk(result_content, chunk)
                yield chunk
        finally:
            self.capture_stream_end(result, result_content)
