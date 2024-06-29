from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class AgiflowSpanAttributes:
    # Library name or decorator name
    AGIFLOW_SERVICE_NAME = 'agiflow.service.name'
    # Service type: LLM, Database, etc... from AgiflowServiceTypes
    AGIFLOW_SERVICE_TYPE = 'agiflow.service.type'
    # Library version
    AGIFLOW_SERVICE_VERSION = 'agiflow.service.version'
    # Set span as root of feedback rather than top parent span
    AGIFLOW_FEEDBACK_ROOT = "agiflow.feedback.root"

    # Function or class name
    AGIFLOW_ENTITY_NAME = "agiflow.entity.name"
    # Function input
    AGIFLOW_ENTITY_INPUT = "agiflow.entity.input"
    # Function output
    AGIFLOW_ENTITY_OUTPUT = "agiflow.entity.output"
    # Function description
    AGIFLOW_ENTITY_DESCRIPTION = "agiflow.entity.description"

    # Association properties from context.AssociationProperties
    AGIFLOW_ASSOCIATION_PROPERTIES = "agiflow.association.properties"

    AGIFLOW_TEST_ID = 'agiflow.testId'
    AGIFLOW_SDK_NAME = 'agiflow.sdk.name'
    AGIFLOW_SDK_VERSION = 'agiflow.sdk.version'

    # Prompt settings
    AGIFLOW_PROMPT_KEY = "agiflow.prompt.key"
    AGIFLOW_PROMPT_VERSION = "agiflow.prompt.version"
    AGIFLOW_PROMPT_VERSION_NAME = "agiflow.prompt.version_name"
    AGIFLOW_PROMPT_VERSION_HASH = "agiflow.prompt.version_hash"
    AGIFLOW_PROMPT_TEMPLATE_VARIABLES = "agiflow.prompt.template_variables"


class AgiflowSpanAttributesValidator(BaseModel):
    model_config = ConfigDict(extra='forbid', use_enum_values=True)

    # Service Provider
    AGIFLOW_SERVICE_NAME: str = Field(..., alias=AgiflowSpanAttributes.AGIFLOW_SERVICE_NAME)
    # Service type: LLM, Database, etc...
    AGIFLOW_SERVICE_TYPE: str = Field(..., alias=AgiflowSpanAttributes.AGIFLOW_SERVICE_TYPE)
    # Service Provider Version
    AGIFLOW_SERVICE_VERSION: Optional[str] = Field(
        None, alias=AgiflowSpanAttributes.AGIFLOW_SERVICE_VERSION
    )
    AGIFLOW_TES_ID: Optional[str] = Field(None, alias=AgiflowSpanAttributes.AGIFLOW_TEST_ID)
    AGIFLOW_ENTITY_NAME: str = Field(None, alias=AgiflowSpanAttributes.AGIFLOW_ENTITY_NAME)
    AGIFLOW_ENTITY_INPUT: str = Field(None, alias=AgiflowSpanAttributes.AGIFLOW_ENTITY_INPUT)
    AGIFLOW_ENTITY_OUTPUT: Optional[str] = Field(
        None, alias=AgiflowSpanAttributes.AGIFLOW_ENTITY_OUTPUT
    )
    AGIFLOW_ENTITY_DESCRIPTION: str = Field(None, alias=AgiflowSpanAttributes.AGIFLOW_ENTITY_DESCRIPTION)
    AGIFLOW_ASSOCIATION_PROPERTIES: str = Field(None, alias=AgiflowSpanAttributes.AGIFLOW_ASSOCIATION_PROPERTIES)
