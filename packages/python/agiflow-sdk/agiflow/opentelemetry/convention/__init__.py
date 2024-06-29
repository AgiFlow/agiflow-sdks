from .database_span_attributes import (
  DatabaseSpanAttributes,
  DatabaseSpanAttributesValidator
)
from .framework_span_attributes import (
  FrameworkSpanAttributes,
  FrameworkSpanAttributesValidator
)
from .llm_span_attributes import (
  LLMSpanAttributes,
  LLMSpanAttributesValidator
)
from .agiflow_attributes import (
  AgiflowSpanAttributes,
  AgiflowSpanAttributesValidator
)
from .constants import (
  Event,
  OpenAIMethods,
  ChromaDBMethods,
  PineconeMethods,
  AgiflowServiceTypes,
  WeaviateMethods,
  LLMTypes,
  LLMPromptKeys,
  LLMPromptRoles,
  LLMResponseKeys,
  LLMTokenUsageKeys,
)


class SpanAttributes(AgiflowSpanAttributes, LLMSpanAttributes, FrameworkSpanAttributes, DatabaseSpanAttributes):
    """
    All span attributes collected by Agiflow.
    Using this for key value instead of hard coding to ensure
    consistent telemetry schema.
    """
    def __init__(self):
        super()


__all__ = [
  'LLMSpanAttributes',
  'DatabaseSpanAttributes',
  'FrameworkSpanAttributes',
  'Event',
  'OpenAIMethods',
  'ChromaDBMethods',
  'PineconeMethods',
  'FrameworkSpanAttributesValidator',
  'DatabaseSpanAttributesValidator',
  'LLMSpanAttributesValidator',
  'AgiflowSpanAttributesValidator',
  'AgiflowSpanAttributes',
  'AgiflowServiceTypes',
  "LLMTypes",
  "LLMPromptKeys",
  "LLMPromptRoles",
  "LLMResponseKeys",
  "LLMTokenUsageKeys",
  "SpanAttributes",
  "WeaviateMethods",
  ]
