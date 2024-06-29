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
from agiflow.opentelemetry.instrumentation.constants.weaviate import APIS
from agiflow.utils import serialise_to_json
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import WeaviateSpanCapture


class GenericCollectionSpanCapture(WeaviateSpanCapture):
    method: str
    operation: str

    def __init__(self, *args, method, **kwargs):
        super().__init__(*args, **kwargs)
        self.method = method
        api = APIS[self.method]
        self.operation = api['OPERATION']

    def capture_input(self):
        collection_name = self.fkwargs.get('name')

        span_attributes = {
          SpanAttributes.DB_OPERATION: self.operation,
          SpanAttributes.DB_COLLECTION_NAME: collection_name,
        }

        if should_send_prompts():
            span_attributes[SpanAttributes.DB_QUERY] = serialise_to_json({"args": self.fargs, "kwargs": self.fkwargs})

        self.set_span_attributes_from_pydantic(span_attributes, DatabaseSpanAttributesValidator)
