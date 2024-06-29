from enum import Enum


class AgiflowServiceTypes(str, Enum):
    LLM = 'LLM'
    DATABASE = 'Database'
    FRAMEWORK = 'Framework'
    VECTORDB = 'VectorDB'
    WORKFLOW = "Workflow"
    TASK = "Task"
    AGENT = "Agent"
    TOOL = "Tool"
    UNKNOWN = "Unknown"
    CHAT = "Chat"

    def __str__(self):
        return str(self.value)


class LLMTypes(str, Enum):
    CHAT = 'Chat'
    COMPLETION = 'Completion'
    IMAGE_GENERATION = 'ImageGeneration'
    EMBEDDING = 'Embedding'
    RERANK = 'Rerank'

    def __str__(self):
        return str(self.value)


class LLMPromptKeys(str, Enum):
    ROLE = 'role'
    CONTENT = 'content'

    def __str__(self):
        return str(self.value)


class LLMPromptRoles(str, Enum):
    USER = 'user'
    ASSISTANT = 'assistant'

    def __str__(self):
        return str(self.value)


class LLMResponseKeys(str, Enum):
    CONTENT = 'content'
    ROLE = 'role'
    FUNCTION_CALLS = 'function_calls'
    TOOL_CALLS = 'tool_calls'
    FINISH_REASON = 'finish_reason'
    CONTENT_FILTER_RESULTS = 'content_filter_results'

    def __str__(self):
        return str(self.value)


class LLMTokenUsageKeys(str, Enum):
    PROMPT_TOKENS = 'prompt_tokens'
    COMPLETION_TOKENS = 'completion_tokens'
    TOTAL_TOKENS = 'total_tokens'
    SEARCH_UNITS = 'search_units'

    def __str__(self):
        return str(self.value)


class Event(str, Enum):
    STREAM_START = "stream.start"
    STREAM_OUTPUT = "stream.output"
    STREAM_END = "stream.end"
    RESPONSE = "response"

    def __str__(self):
        return str(self.value)


class OpenAIMethods(str, Enum):
    CHAT_COMPLETION = "openai.chat.completions.create"
    IMAGES_GENERATION = "openai.images.generate"
    EMBEDDINGS_CREATE = "openai.embeddings.create"

    def __str__(self):
        return str(self.value)


class ChromaDBMethods(str, Enum):
    ADD = "chromadb.collection.add"
    GET = "chromadb.collection.get"
    QUERY = "chromadb.collection.query"
    DELETE = "chromadb.collection.delete"
    PEEK = "chromadb.collection.peek"
    UPDATE = "chromadb.collection.update"
    UPSERT = "chromadb.collection.upsert"
    MODIFY = "chromadb.collection.modify"
    COUNT = "chromadb.collection.count"

    def __str__(self):
        return str(self.value)


class QdrantDBMethods(str, Enum):
    ADD = "qdrantdb.add"
    GET_COLLECTION = "qdrantdb.get_collection"
    GET_COLLECTIONS = "qdrantdb.get_collections"
    QUERY = "qdrantdb.query"
    QUERY_BATCH = "qdrantdb.query_batch"
    DELETE = "qdrantdb.delete"
    DISCOVER = "qdrantdb.discover"
    DISCOVER_BATCH = "qdrantdb.discover_batch"
    RECOMMEND = "qdrantdb.recommend"
    RECOMMEND_BATCH = "qdrantdb.recommend_batch"
    RETRIEVE = "qdrantdb.retrieve"
    SEARCH = "qdrantdb.search"
    SEARCH_BATCH = "qdrantdb.search_batch"
    UPSERT = "qdrantdb.upsert"
    COUNT = "qdrantdb.count"
    UPDATE_COLLECTION = "qdrantdb.update_collection"
    UPDATE_VECTORS = "qdrantdb.update_vectors"

    def __str__(self):
        return str(self.value)


class PineconeMethods(str, Enum):
    UPSERT = "pinecone.index.upsert"
    QUERY = "pinecone.index.query"
    DELETE = "pinecone.index.delete"

    def __str__(self):
        return str(self.value)


class WeaviateMethods(Enum):
    QUERY_BM25 = "weaviate.collections.queries.bm25"
    QUERY_FETCH_OBJECT_BY_ID = "weaviate.collections.queries.fetch_object_by_id"
    QUERY_FETCH_OBJECTS = "weaviate.collections.queries.fetch_objects"
    QUERY_HYBRID = "weaviate.collections.queries.hybrid"
    QUERY_NEAR_IMAGE = "weaviate.collections.queries.near_image"
    QUERY_NEAR_MEDIA = "weaviate.collections.queries.near_media"
    QUERY_NEAR_OBJECT = "weaviate.collections.queries.near_object"
    QUERY_NEAR_TEXT = "weaviate.collections.queries.near_text"
    QUERY_NEAR_VECTOR = "weaviate.collections.queries.near_vector"
    COLLECTIONS_OPERATIONS = "weaviate.collections.collections"
