from __future__ import annotations

from typing import Optional

from pydantic import Field
from .agiflow_attributes import AgiflowSpanAttributesValidator


class DatabaseSpanAttributes():
    SERVER_ADDRESS = 'server.address'
    DB_QUERY = 'db.query'
    DB_RESPONSE = 'db.response'
    DB_OPERATION = 'db.operation'
    DB_SYSTEM = 'db.system'
    DB_INDEX = 'db.index'
    DB_COLLECTION_NAME = 'db.collection.name'
    DB_NAMESPACE = 'db.namespace'
    DB_TOP_K = 'db.top_k'
    DB_EMBEDDING_MODEL = 'db.embedding_model'
    DB_QUERY_FILTER = 'db.query.filter'
    DB_QUERY_INCLUDE_VALUES = 'db.query.include_values'
    DB_QUERY_INCLUDE_METADATA = 'db.query.include_metadata'
    DB_USAGE_READ_UNITS = 'db.usage.read_units'
    DB_USAGE_WRITE_UNITS = 'db.usage.write_units'


class DatabaseSpanAttributesValidator(AgiflowSpanAttributesValidator):
    SERVER_ADDRESS: Optional[str] = Field(None, alias=DatabaseSpanAttributes.SERVER_ADDRESS)
    DB_QUERY: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_QUERY)
    DB_RESPONSE: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_RESPONSE)
    DB_OPERATION: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_OPERATION)
    DB_SYSTEM: str = Field(..., alias=DatabaseSpanAttributes.DB_SYSTEM)
    DB_NAMESPACE: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_NAMESPACE)
    DB_INDEX: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_INDEX)
    DB_COLLECTION_NAME: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_COLLECTION_NAME)
    DB_TOP_K: Optional[float] = Field(None, alias=DatabaseSpanAttributes.DB_TOP_K)
    DB_EMBEDDING_MODEL: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_EMBEDDING_MODEL)
    DB_QUERY_FILTER: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_QUERY_FILTER)
    DB_QUERY_INCLUDE_VALUES: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_QUERY_INCLUDE_VALUES)
    DB_QUERY_INCLUDE_METADATA: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_QUERY_INCLUDE_METADATA)
    DB_USAGE_READ_UNITS: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_USAGE_READ_UNITS)
    DB_USAGE_WRITE_UNITS: Optional[str] = Field(None, alias=DatabaseSpanAttributes.DB_USAGE_WRITE_UNITS)
