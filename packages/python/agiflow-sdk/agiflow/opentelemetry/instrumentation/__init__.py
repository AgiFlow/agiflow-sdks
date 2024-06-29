from typing import Optional
from agiflow.telemetry import Telemetry
import importlib.util

from agiflow.opentelemetry.types import DisableInstrumentations, InstrumentationType

from opentelemetry.sdk.trace import TracerProvider


def init_openai_instrumentor(tracer_provider: TracerProvider):
    """
    Lazy load and initialise Instrumentor if intrument package exist
    """
    if importlib.util.find_spec("openai") is not None:
        Telemetry().capture("instrumentation:openai:init")
        from .openai import OpenAIInstrumentation

        instrumentor = OpenAIInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_cohere_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("cohere") is not None:
        Telemetry().capture("instrumentation:cohere:init")
        from .cohere import CohereInstrumentation

        instrumentor = CohereInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_anthropic_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("anthropic") is not None:
        Telemetry().capture("instrumentation:anthropic:init")
        from .anthropic import AnthropicInstrumentation

        instrumentor = AnthropicInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_groq_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("groq") is not None:
        Telemetry().capture("instrumentation:groq:init")
        from .groq import GroqInstrumentation

        instrumentor = GroqInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_pinecone_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("pinecone-client") is not None:
        Telemetry().capture("instrumentation:pinecone:init")
        from .pinecone import PineconeInstrumentation

        instrumentor = PineconeInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_llamaindex_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("llama-index") is not None:
        Telemetry().capture("instrumentation:llamaindex:init")
        from .llamaindex import LlamaIndexInstrumentation

        instrumentor = LlamaIndexInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_chroma_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("chromadb") is not None:
        Telemetry().capture("instrumentation:chroma:init")
        from .chroma import ChromaInstrumentation

        instrumentor = ChromaInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_qdrant_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("qdrant-client") is not None:
        Telemetry().capture("instrumentation:qdrant:init")
        from .qdrant import QdrantInstrumentation

        instrumentor = QdrantInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_weaviate_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("weaviate-client") is not None:
        Telemetry().capture("instrumentation:weaviate:init")
        from .weaviate import WeaviateInstrumentation

        instrumentor = WeaviateInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_langchain_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("langchain") is not None:
        Telemetry().capture("instrumentation:langchain:init")
        from .langchain import LangchainInstrumentation

        instrumentor = LangchainInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_langchain_core_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("langchain-core") is not None:
        Telemetry().capture("instrumentation:langchain:init")
        from .langchain_core import LangchainCoreInstrumentation

        instrumentor = LangchainCoreInstrumentation(enrich_assistant=True, tracer_provider=tracer_provider)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_langchain_community_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("langchain-community") is not None:
        Telemetry().capture("instrumentation:langchain:init")
        from .langchain_community import LangchainCommunityInstrumentation

        instrumentor = LangchainCommunityInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_langgraph_instrumentor(tracer_provider: TracerProvider):
    if importlib.util.find_spec("langgraph-client") is not None:
        Telemetry().capture("instrumentation:langgraph:init")
        from .langgraph import LanggraphInstrumentation

        instrumentor = LanggraphInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


def init_crewai_instrumentor(tracer_provider: TracerProvider):
    """
    Lazy load and initialise Instrumentor if intrument package exist
    """
    if importlib.util.find_spec("crewai") is not None:
        Telemetry().capture("instrumentation:crewai:init")
        from .crewai import CrewAIInstrumentation

        instrumentor = CrewAIInstrumentation(enrich_assistant=True)
        if not instrumentor.is_instrumented_by_opentelemetry:
            instrumentor.instrument(tracer_provider=tracer_provider)
    return True


all_instrumentations = {
    InstrumentationType.OPENAI: init_openai_instrumentor,
    InstrumentationType.COHERE: init_cohere_instrumentor,
    InstrumentationType.ANTHROPIC: init_anthropic_instrumentor,
    InstrumentationType.GROQ: init_groq_instrumentor,
    InstrumentationType.PINECONE: init_pinecone_instrumentor,
    InstrumentationType.LLAMAINDEX: init_llamaindex_instrumentor,
    InstrumentationType.CHROMADB: init_chroma_instrumentor,
    InstrumentationType.QDRANT: init_qdrant_instrumentor,
    InstrumentationType.WEAVIATE: init_weaviate_instrumentor,
    InstrumentationType.LANGCHAIN: init_langchain_instrumentor,
    InstrumentationType.LANGCHAIN_CORE: init_langchain_core_instrumentor,
    InstrumentationType.LANGCHAIN_COMMUNITY: init_langchain_community_instrumentor,
    InstrumentationType.LANGGRAPH: init_langgraph_instrumentor,
    InstrumentationType.CREWAI: init_crewai_instrumentor,
}


def init_instrumentations(
    disable_instrumentations: Optional[DisableInstrumentations] | None,
    all_instrumentations: dict,
    tracer_provider: TracerProvider
):
    if disable_instrumentations is None:
        for _, v in all_instrumentations.items():
            v(tracer_provider=tracer_provider)
    else:

        validate_instrumentations(disable_instrumentations)

        for key in disable_instrumentations:
            for vendor in disable_instrumentations[key]:
                if key == "only":
                    filtered_dict = {
                        k: v
                        for k, v in all_instrumentations.items()
                        if k != vendor.value
                    }
                    for _, v in filtered_dict.items():
                        v(tracer_provider=tracer_provider)
                else:
                    filtered_dict = {
                        k: v
                        for k, v in all_instrumentations.items()
                        if k == vendor.value
                    }

                    for _, v in filtered_dict.items():
                        v(tracer_provider=tracer_provider)


def validate_instrumentations(disable_instrumentations):
    if disable_instrumentations is not None:
        for key, value in disable_instrumentations.items():
            if isinstance(value, str):
                # Convert single string to list of enum values
                disable_instrumentations[key] = [InstrumentationType.from_string(value)]
            elif isinstance(value, list):
                # Convert list of strings to list of enum values
                disable_instrumentations[key] = [
                    (
                        InstrumentationType.from_string(item)
                        if isinstance(item, str)
                        else item
                    )
                    for item in value
                ]
            # Validate all items are of enum type
            if not all(
                isinstance(item, InstrumentationType)
                for item in disable_instrumentations[key]
            ):
                raise TypeError(
                    f"All items in {key} must be of type InstrumentationType"
                )
        if (
            disable_instrumentations.get("all_except") is not None
            and disable_instrumentations.get("only") is not None
        ):
            raise ValueError(
                "Cannot specify both only and all_except in disable_instrumentations"
            )


__all__ = [
  'init_instrumentations',
  'all_instrumentations'
]
