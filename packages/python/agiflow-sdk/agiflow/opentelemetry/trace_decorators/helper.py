from typing import NotRequired, Callable, TypedDict
from agiflow.opentelemetry.context import PromptSettings, AssociationProperties


class SharedKwargs(TypedDict):
    # Add description to workflow and task
    # to add more context for user to provide feedbacks
    description: NotRequired[str]
    # All span within workflow/task will receive the
    # prompt version, etc... from current span
    # Only LLM span actually store the prompt version
    # Passing a dictionary of PromptSettings or dynamically return PromptSettings from function
    prompt_settings: NotRequired[PromptSettings] | NotRequired[Callable]
    # All span within workflow/task will receive the
    # association_properties from current span
    # Passing a dictionary of AssociationProperties or dynamically return AssociationProperties from function
    association_properties: NotRequired[AssociationProperties] | NotRequired[Callable]


class SharedKwargsWithHooks(SharedKwargs):
    # Default input serialiser will try to serialize {args, kwargs}
    # Use this hook to input output and return what you need
    # Arguments: *args, **kwargs
    input_serializer: NotRequired[Callable]
    # If the default json serialiser does not work properly
    # Use this hook to parse output and return what you need
    # Arguments: *args, result=result, **kwargs
    output_serializer: NotRequired[Callable]
    # Using this to set context for current span and it's children
    # Return a carrier dictionary that you pass through to the message queue, etc...
    # Supported context passing: association_properties, prompt_settings
    context_parser: NotRequired[Callable]
