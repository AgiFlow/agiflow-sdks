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

from agiflow.opentelemetry.convention.framework_span_attributes import (
  FrameworkSpanAttributesValidator,
  FrameworkSpanAttributes
)
from agiflow.opentelemetry.convention.agiflow_attributes import AgiflowSpanAttributes
from agiflow.utils import serialise_to_json
from .base import LanggraphSpanCapture


class GraphCallSpanCapture(LanggraphSpanCapture):
    method_name: str

    def __init__(self, *args, method_name='', **kwargs):
        super().__init__(*args, **kwargs)
        self.method_name = method_name

    def capture_input(self):
        span_attributes = {}

        attr = get_atrribute_key_value(self.method_name, self.fargs)
        if attr is not None:
            span_attributes.update(attr)

        self.set_span_attributes_from_pydantic(span_attributes, FrameworkSpanAttributesValidator)


def get_atrribute_key_value(method_name, args):
    if args is None or len(args) == 0:
        return None

    if "add_node" in method_name:
        return {
            FrameworkSpanAttributes.FRAMEWORK_NODE: serialise_to_json(
                {
                    "name": args[0],
                    "action": (
                        args[1].json()
                        if hasattr(args[1], "json")
                        else (
                            args[1].__name__
                            if hasattr(args[1], "__name__")
                            else str(args[1])
                        )
                    ),
                }
            ),
            AgiflowSpanAttributes.AGIFLOW_ENTITY_NAME: "add_node",
        }
    elif "add_edge" in method_name:
        return {
            FrameworkSpanAttributes.FRAMEWORK_EDGE: serialise_to_json(
                {
                    "source": args[0],
                    "destination": args[1],
                }
            ),
            AgiflowSpanAttributes.AGIFLOW_ENTITY_NAME: "add_edge",
        }
    elif "add_conditional_edges" in method_name:
        return {
            FrameworkSpanAttributes.FRAMEWORK_EDGE: serialise_to_json(
                {
                    "source": args[0],
                    "path": (
                        args[1].json()
                        if hasattr(args[1], "json")
                        else (
                            args[1].__name__
                            if hasattr(args[1], "__name__")
                            else str(args[1])
                        )
                    ),
                    "path_map": args[2],
                }
            ),
            AgiflowSpanAttributes.AGIFLOW_ENTITY_NAME: "add_conditional_edges",
        }
    elif "set_entry_point" in method_name:
        return {
            FrameworkSpanAttributes.FRAMEWORK_ENTRYPOINT: args[0],
            AgiflowSpanAttributes.AGIFLOW_ENTITY_NAME: "set_entry_point",
        }
    elif "set_finish_point" in method_name:
        return {
            FrameworkSpanAttributes.FRAMEWORK_FINISHPOINT: args[0],
            AgiflowSpanAttributes.AGIFLOW_ENTITY_NAME: "set_finish_point",
        }
    else:
        return None
