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

from agiflow.opentelemetry.convention.constants import Event, LLMTokenUsageKeys
from agiflow.opentelemetry.convention.database_span_attributes import DatabaseSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.pinecone import APIS
from agiflow.utils import serialise_to_json, silently_fail
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from opentelemetry.trace import StatusCode
from .base import PineconeSpanCapture


class GenericSpanCapture(PineconeSpanCapture):
    operation_name: str

    def __init__(self, *args, operation_name, **kwargs):
        super().__init__(*args, **kwargs)
        self.operation_name = operation_name

    def capture_input(self):
        api = APIS[self.operation_name]
        span_attributes = {
          SpanAttributes.DB_OPERATION: api['OPERATION']
        }

        if should_send_prompts():
            span_attributes[SpanAttributes.DB_QUERY] = serialise_to_json(self.fkwargs.get('query'))

        if hasattr(self.instance, "name") and self.instance.name is not None:
            span_attributes[SpanAttributes.DB_COLLECTION_NAME] = self.instance.name

        self.set_span_attributes_from_pydantic(span_attributes, DatabaseSpanAttributesValidator)

        if self.span.is_recording():
            self.set_span_attribute(SpanAttributes.SERVER_ADDRESS, self.instance._config.host)
            if self.operation_name == "QUERY":
                self.set_query_input_attributes()

    def capture_output(self, result):
        if should_send_prompts():
            if result:
                if self.span.is_recording():
                    self.set_query_response_attributes(result)

    def capture_stream_output(self, result):
        """Process and yield streaming response chunks."""
        result_content = []
        self.span.add_event(Event.STREAM_START.value)
        input_tokens = 0
        output_tokens = 0
        try:
            for chunk in result:
                if (
                    hasattr(chunk, "message")
                    and chunk.message is not None
                    and hasattr(chunk.message, "model")
                    and chunk.message.model is not None
                ):
                    self.set_span_attribute(SpanAttributes.LLM_MODEL, chunk.message.model)
                content = ""
                if hasattr(chunk, "delta") and chunk.delta is not None:
                    content = chunk.delta.text if hasattr(chunk.delta, "text") else ""
                # Assuming content needs to be aggregated before processing
                result_content.append(content if len(content) > 0 else "")

                if hasattr(chunk, "message") and hasattr(chunk.message, "usage"):
                    input_tokens += (
                        chunk.message.usage.input_tokens
                        if hasattr(chunk.message.usage, "input_tokens")
                        else 0
                    )
                    output_tokens += (
                        chunk.message.usage.output_tokens
                        if hasattr(chunk.message.usage, "output_tokens")
                        else 0
                    )

                # Assuming span.add_event is part of a larger logging or event system
                # Add event for each chunk of content
                if content:
                    self.span.add_event(
                        Event.STREAM_OUTPUT.value, {"response": "".join(content)}
                    )

                # Assuming this is part of a generator, yield chunk or aggregated content
                yield content
        finally:

            # Finalize span after processing all chunks
            self.span.add_event(Event.STREAM_END.value)
            self.set_span_attribute(
                SpanAttributes.LLM_TOKEN_COUNTS,
                serialise_to_json(
                    {
                        LLMTokenUsageKeys.PROMPT_TOKENS: input_tokens,
                        LLMTokenUsageKeys.COMPLETION_TOKENS: output_tokens,
                        LLMTokenUsageKeys.TOTAL_TOKENS: input_tokens + output_tokens,
                    }
                ),
            )
            self.set_span_attribute(
                SpanAttributes.LLM_RESPONSES,
                serialise_to_json([{"role": "assistant", "content": "".join(result_content)}]),
            )
            self.span.set_status(StatusCode.OK)
            self.span.end()

    @silently_fail
    def set_query_input_attributes(self):
        self.set_span_attribute(SpanAttributes.DB_TOP_K, self.fkwargs.get("top_k"))
        self.set_span_attribute(SpanAttributes.DB_NAMESPACE, self.fkwargs.get("namespace"))
        self.set_span_attribute(SpanAttributes.DB_INDEX, self.fkwargs.get("id"))
        filter = (
            serialise_to_json(self.fkwargs.get("filter"))
            if isinstance(self.fkwargs.get("filter"), dict)
            else self.fkwargs.get("filter")
        )
        self.set_span_attribute(SpanAttributes.DB_QUERY_FILTER, filter)
        self.set_span_attribute(
            SpanAttributes.DB_QUERY_INCLUDE_VALUES, serialise_to_json(self.fkwargs.get("include_values"))
        )
        self.set_span_attribute(
            SpanAttributes.DB_QUERY_INCLUDE_METADATA, serialise_to_json(self.fkwargs.get("include_metadata"))
        )

    @silently_fail
    def set_query_response_attributes(self, response):
        matches = response.get("matches")

        usage = response.get("usage")
        for match in matches:
            self.span.add_event(
                name="db.query.match",
                attributes={
                    "db.query.match.id": match.get("id"),
                    "db.query.match.score": match.get("score"),
                    "db.query.match.metadata": match.get("metadata"),
                    # "db.query.match.values": match.get("values"),
                },
            )

        if "read_units" in usage:
            self.set_span_attribute(
                SpanAttributes.DB_USAGE_READ_UNITS, usage.get("read_units")
            )

        if "write_units" in usage:
            self.set_span_attribute(
                SpanAttributes.DB_USAGE_WRITE_UNITS, usage.get("write_units")
            )
