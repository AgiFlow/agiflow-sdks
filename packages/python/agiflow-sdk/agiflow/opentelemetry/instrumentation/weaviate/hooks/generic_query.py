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
from agiflow.utils import serialise_to_json, to_iso_format
from agiflow.opentelemetry.convention import (
  SpanAttributes,
)
from agiflow.opentelemetry.utils import should_send_prompts
from .base import WeaviateSpanCapture

# Predefined metadata response attributes
METADATA_ATTRIBUTES = [
    "creation_time",
    "last_update_time",
    "distance",
    "certainty",
    "score",
    "explain_score",
    "is_consistent",
    "rerank_score",
]


class GenericQuerySpanCapture(WeaviateSpanCapture):
    method: str
    operation: str

    def __init__(self, *args, method, **kwargs):
        super().__init__(*args, **kwargs)
        self.method = method
        api = APIS[self.method]
        self.operation = api['OPERATION']

    def capture_input(self):
        collection_name = ""
        if hasattr(self.instance, '_name'):
            collection_name = self.instance._name

        span_attributes = {
          SpanAttributes.DB_OPERATION: self.operation,
          SpanAttributes.DB_COLLECTION_NAME: collection_name,
        }

        if should_send_prompts():
            span_attributes[SpanAttributes.DB_QUERY] = serialise_to_json({"args": self.fargs, "kwargs": self.fkwargs})

        self.set_span_attributes_from_pydantic(span_attributes, DatabaseSpanAttributesValidator)

    def capture_output(self, result):
        self.span.add_event(
            name="db.response",
            attributes={"db.response": aggregate_responses(result)},
        )


def extract_metadata(metadata):
    # Extraction response Query metadata
    extracted_metadata = {
        attr: (
            to_iso_format(getattr(metadata, attr))
            if "time" in attr
            else getattr(metadata, attr)
        )
        for attr in METADATA_ATTRIBUTES
        if hasattr(metadata, attr)
    }

    return {k: v for k, v in extracted_metadata.items() if v is not None}


def aggregate_responses(result):
    all_responses = []

    if hasattr(result, "objects") and result.objects is not None:
        for each_obj in result.objects:
            # Loop for multiple object responses
            response_attributes = get_response_object_attributes(each_obj)
            all_responses.append(response_attributes)
    else:
        # For single object responses
        all_responses = get_response_object_attributes(result)

    return serialise_to_json(all_responses)


def get_response_object_attributes(response_object):
    response_attributes = {
        **response_object.properties,
        "uuid": str(response_object.uuid) if hasattr(response_object, "uuid") else None,
        "collection": (
            response_object.collection
            if hasattr(response_object, "collection")
            else None
        ),
        "vector": (
            response_object.vector if hasattr(response_object, "vector") else None
        ),
        "references": (
            response_object.references
            if hasattr(response_object, "references")
            else None
        ),
        "metadata": (
            extract_metadata(response_object.metadata)
            if hasattr(response_object, "metadata")
            else None
        ),
    }
    response_attributes = {
        k: v for k, v in response_attributes.items() if v is not None
    }
    return response_attributes
