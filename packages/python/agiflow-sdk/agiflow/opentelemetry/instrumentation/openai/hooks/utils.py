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
from agiflow.opentelemetry.convention import (
  LLMResponseKeys,
)


def extract_content(choice):
    if not hasattr(choice, 'message'):
        return

    message = choice.message

    if message is None:
        return

    response = {}
    # Check if choice.message exists and has a content attribute
    if (
        hasattr(message, "content")
        and message.content is not None
    ):
        response[LLMResponseKeys.CONTENT] = message.content

    # Check if choice.message exists and has a content attribute
    if (
        hasattr(message, "role")
        and message.role is not None
    ):
        response[LLMResponseKeys.ROLE] = message.role

    # Check if choice.message has tool_calls and extract information accordingly
    elif (
        hasattr(message, "tool_calls")
        and message.tool_calls is not None
    ):
        result = [
            {
                "id": tool_call.id,
                "type": tool_call.type,
                "function": {
                    "name": tool_call.function.name,
                    "arguments": tool_call.function.arguments,
                },
            }
            for tool_call in choice.message.tool_calls
        ]
        response[LLMResponseKeys.TOOL_CALLS] = result

    # Check if choice.message has a function_call and extract information accordingly
    elif (
        hasattr(message, "function_call")
        and message.function_call is not None
    ):
        response[LLMResponseKeys.FUNCTION_CALLS] = {
            "name": choice.message.function_call.name,
            "arguments": choice.message.function_call.arguments,
        }

    return response
