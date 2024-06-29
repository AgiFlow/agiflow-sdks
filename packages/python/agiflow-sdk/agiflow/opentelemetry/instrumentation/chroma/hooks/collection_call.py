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
from agiflow.opentelemetry.instrumentation.constants.chroma import APIS
from agiflow.utils import serialise_to_json, silently_fail
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from opentelemetry.trace import StatusCode
from .base import ChromaSpanCapture


class CollectionCallSpanCapture(ChromaSpanCapture):
    method: str
    operation: str

    def __init__(self, *args, method, **kwargs):
        super().__init__(*args, **kwargs)
        self.method = method
        api = APIS[self.method]
        self.operation = api['OPERATION']

    def capture_input(self):
        span_attributes = {
          SpanAttributes.DB_OPERATION: self.operation
        }

        if self.operation == "add":
            self._set_chroma_add_attributes()
        elif self.operation == "get":
            self._set_chroma_get_attributes()
        elif self.operation == "query":
            self._set_chroma_query_attributes()
        elif self.operation == "peek":
            self._set_chroma_peek_attributes()
        elif self.operation == "update":
            self._set_chroma_update_attributes()
        elif self.operation == "upsert":
            self._set_chroma_upsert_attributes()
        elif self.operation == "modify":
            self._set_chroma_modify_attributes()
        elif self.operation == "delete":
            self._set_chroma_delete_attributes()

        if should_send_prompts():
            span_attributes[SpanAttributes.DB_QUERY] = serialise_to_json(self.fkwargs.get('query'))

        if hasattr(self.instance, "name") and self.instance.name is not None:
            span_attributes[SpanAttributes.DB_COLLECTION_NAME] = self.instance.name

        self.set_span_attributes_from_pydantic(span_attributes, DatabaseSpanAttributesValidator)

    def capture_output(self, result):
        if should_send_prompts():
            if self.operation == "query":
                events = self._set_chroma_query_response(result)
                for event in events:
                    self.span.add_event(name="db.chroma.query.result", attributes=event)

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
    def _set_chroma_add_attributes(self):
        self.set_span_attribute(
            "db.chroma.add.ids_count", get_count_or_none(self.fkwargs.get("ids"))
        )
        self.set_span_attribute(
            "db.chroma.add.embeddings_count",
            get_count_or_none(self.fkwargs.get("embeddings")),
        )
        self.set_span_attribute(
            "db.chroma.add.metadatas_count",
            get_count_or_none(self.fkwargs.get("metadatas")),
        )
        self.set_span_attribute(
            "db.chroma.add.documents_count",
            get_count_or_none(self.fkwargs.get("documents")),
        )

    @silently_fail
    def _set_chroma_get_attributes(self):
        self.set_span_attribute(
            "db.chroma.get.ids_count", get_count_or_none(self.fkwargs.get("ids"))
        )
        self.set_span_attribute(
            "db.chroma.get.where", handle_null_params(self.fkwargs.get("where"))
        )
        self.set_span_attribute("db.chroma.get.limit", self.fkwargs.get("limit"))
        self.set_span_attribute("db.chroma.get.offset", self.fkwargs.get("offset"))
        self.set_span_attribute(
            "db.chroma.get.where_document",
            handle_null_params(self.fkwargs.get("where_document")),
        )
        self.set_span_attribute(
            "db.chroma.get.include", handle_null_params(self.fkwargs.get("include"))
        )

    @silently_fail
    def _set_chroma_query_attributes(self):
        self.set_span_attribute(
            "db.chroma.query.query_embeddings_count",
            get_count_or_none(self.fkwargs.get("query_embeddings")),
        )
        self.set_span_attribute(
            "db.chroma.query.query_texts_count",
            get_count_or_none(self.fkwargs.get("query_texts")),
        )
        self.set_span_attribute(
          "db.chroma.query.n_results",
          self.fkwargs.get("n_results")
        )
        self.set_span_attribute(
            "db.chroma.query.where", handle_null_params(self.fkwargs.get("where"))
        )
        self.set_span_attribute(
            "db.chroma.query.where_document",
            handle_null_params(self.fkwargs.get("where_document")),
        )
        self.set_span_attribute(
            "db.chroma.query.include", handle_null_params(self.fkwargs.get("include"))
        )

    @silently_fail
    def _set_chroma_peek_attributes(self):
        self.set_span_attribute("db.chroma.peek.limit", self.fkwargs.get("limit"))

    @silently_fail
    def _set_chroma_update_attributes(self):
        self.set_span_attribute(
            "db.chroma.update.ids_count", get_count_or_none(self.fkwargs.get("ids"))
        )
        self.set_span_attribute(
            "db.chroma.update.embeddings_count",
            get_count_or_none(self.fkwargs.get("embeddings")),
        )
        self.set_span_attribute(
            "db.chroma.update.metadatas_count",
            get_count_or_none(self.fkwargs.get("metadatas")),
        )
        self.set_span_attribute(
            "db.chroma.update.documents_count",
            get_count_or_none(self.fkwargs.get("documents")),
        )

    @silently_fail
    def _set_chroma_modify_attributes(self):
        self.set_span_attribute("db.chroma.modify.name", self.fkwargs.get("name"))

    @silently_fail
    def _set_chroma_upsert_attributes(self):
        self.set_span_attribute(
            "db.chroma.upsert.embeddings_count",
            get_count_or_none(self.fkwargs.get("embeddings")),
        )
        self.set_span_attribute(
            "db.chroma.upsert.metadatas_count",
            get_count_or_none(self.fkwargs.get("metadatas")),
        )
        self.set_span_attribute(
            "db.chroma.upsert.documents_count",
            get_count_or_none(self.fkwargs.get("documents")),
        )

    @silently_fail
    def _set_chroma_delete_attributes(self):
        self.set_span_attribute(
            "db.chroma.delete.ids_count", get_count_or_none(self.fkwargs.get("ids"))
        )
        self.set_span_attribute(
            "db.chroma.delete.where", handle_null_params(self.fkwargs.get("where"))
        )
        self.set_span_attribute(
            "db.chroma.delete.where_document",
            handle_null_params(self.fkwargs.get("where_document")),
        )

    @silently_fail
    def _set_chroma_query_response(self, result):

        attributes = []
        ids = result.get("ids")[0]
        distances = result.get("distances")[0]
        metadatas = result.get("metadatas")[0]
        documents = result.get("documents")[0]

        for idx, _ in enumerate(ids):
            attribute = {
                "id": ids[idx],
                "distance": distances[idx],
                "metadata": metadatas[idx],
                "document": documents[idx],
            }
            attributes.append(attribute)
        return attributes


def get_count_or_none(value):
    return len(value) if value is not None else None


def handle_null_params(param):
    return str(param) if param else None
