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

from typing import Collection

from opentelemetry.instrumentation.instrumentor import BaseInstrumentor
from opentelemetry.trace import get_tracer
from agiflow.opentelemetry.instrumentation.utils import patch_module_classes
from agiflow.version import __version__
from .hooks import (
  GenericSpanCapture,
)


class LangchainCommunityInstrumentation(BaseInstrumentor):
    """
    Instrumentor for langchain-community.
    """

    def instrumentation_dependencies(self) -> Collection[str]:
        return ["langchain-community >= 0.0.24"]

    def _instrument(self, **kwargs):
        tracer_provider = kwargs.get("tracer_provider")
        tracer = get_tracer(__name__, __version__, tracer_provider)

        # List of modules to patch, with their corresponding patch names
        modules_to_patch = [
            ("langchain_community.document_loaders.pdf", "load_pdf"),
            ("langchain_community.vectorstores.faiss", "vector_store"),
            ("langchain_community.vectorstores.pgvector", "vector_store"),
            ("langchain_community.vectorstores.pinecone", "vector_store"),
            (
                "langchain_community.vectorstores.mongodb_atlas",
                "vector_store",
            ),
            (
                "langchain_community.vectorstores.azuresearch",
                "vector_store",
            ),
            (
                "langchain_community.vectorstores.azure_cosmos_db",
                "vector_store",
            ),
            (
                "langchain_community.vectorstores.cassandra",
                "vector_store",
            ),
            ("langchain_community.vectorstores.chroma", "vector_store"),
            (
                "langchain_community.vectorstores.clickhouse",
                "vector_store",
            ),
            (
                "langchain_community.vectorstores.elasticsearch",
                "vector_store",
            ),
            ("langchain_community.vectorstores.supabase", "vector_store"),
            ("langchain_community.vectorstores.weaviate", "vector_store"),
            ("langchain_community.vectorstores.vectara", "vector_store"),
        ]

        for module_name, task in modules_to_patch:
            patch_module_classes(
                module_name, tracer, task, SpanCapture=GenericSpanCapture
            )

    def _uninstrument(self, **kwargs):
        pass
