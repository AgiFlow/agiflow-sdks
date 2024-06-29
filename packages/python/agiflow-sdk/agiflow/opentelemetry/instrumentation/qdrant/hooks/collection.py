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

from agiflow.opentelemetry.convention.database_span_attributes import DatabaseSpanAttributesValidator
from agiflow.opentelemetry.instrumentation.constants.qdrant import APIS
from agiflow.utils import silently_fail
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from .base import QdrantSpanCapture


class CollectionCallSpanCapture(QdrantSpanCapture):
    method: str
    operation: str

    def __init__(self, *args, method, **kwargs):
        super().__init__(*args, **kwargs)
        self.method = method
        api = APIS[self.method]
        self.operation = api['OPERATION']

    def capture_input(self):
        span_attributes = {
          SpanAttributes.DB_OPERATION: self.operation,
          SpanAttributes.DB_COLLECTION_NAME: self.fkwargs.get("collection_name") or self.fargs[0]
        }

        if self.operation == "add":
            self._set_upload_attributes("documents")

        elif self.operation == "upsert":
            self._set_upsert_attributes()

        elif self.operation in ["query", "discover", "recommend", "retrieve", "search"]:
            self._set_search_attributes()
        elif self.operation in [
            "query_batch",
            "discover_batch",
            "recommend_batch",
            "search_batch",
        ]:
            self._set_batch_search_attributes(self.operation)

        self.set_span_attributes_from_pydantic(span_attributes, DatabaseSpanAttributesValidator)

    @silently_fail
    def _set_upsert_attributes(self):
        points = self.fkwargs.get("points") or self.fargs[1]
        if isinstance(points, list):
            length = len(points)
        else:
            # In case of using Batch.
            length = len(points.ids)
        self.set_span_attribute("db.upsert.points_count", length)

    @silently_fail
    def _set_upload_attributes(self, field):
        docs = self.fkwargs.get(field) or self.fargs[0]
        if isinstance(docs, list):
            length = len(docs)
        else:
            # In case of using Batch.
            length = len(docs.ids)

        self.set_span_attribute(f"db.upload.{field}_count", length)

    @silently_fail
    def _set_search_attributes(self):
        limit = self.fkwargs.get("limit") or 10
        self.set_span_attribute("db.query.top_k", limit)

    @silently_fail
    def _set_batch_search_attributes(self, method):
        requests = self.fkwargs.get("requests") or []
        self.set_span_attribute(f"db.{method}.requests_count", len(requests))
