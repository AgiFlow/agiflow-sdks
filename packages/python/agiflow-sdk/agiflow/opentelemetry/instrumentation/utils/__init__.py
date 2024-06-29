import importlib.metadata
import inspect
from typing import List
from wrapt import wrap_function_wrapper

from agiflow.opentelemetry.instrumentation.utils.wrapper import (
  method_wrapper,
  async_method_wrapper,
  stream_wrapper,
  async_stream_wrapper,
  AbstractSpanCapture,
  BaseSpanCapture
)


def patch_module_classes(
    module_name,
    tracer,
    task,
    SpanCapture: type[AbstractSpanCapture] = AbstractSpanCapture,
    exclude_methods: List[str] = [],
    exclude_classes: List[str] = [],
):
    """
    Generic function to patch all public methods of all classes in a given module.

    Parameters:
    - module: The module object containing the classes to patch.
    - module_name: The name of the module, used in the prefix for `wrap_function_wrapper`.
    - tracer: The tracer object used in `generic_patch`.
    - task: The name used to identify the type of task in `generic_patch`.
    - exclude_private: Whether to exclude private methods (those starting with '_').
    """
    # import the module
    module = importlib.import_module(module_name)
    # loop through all public classes in the module
    for name, obj in inspect.getmembers(
        module,
        lambda member: inspect.isclass(member) and member.__module__ == module.__name__,
    ):
        # Skip private classes
        if name.startswith("_") or name in exclude_classes:
            continue

        # loop through all public methods of the class
        for method_name, _ in inspect.getmembers(obj, predicate=inspect.isfunction):
            # Skip private methods
            if method_name.startswith("_") or method_name in exclude_methods:
                continue
            try:
                method_path = f"{name}.{method_name}"
                wrap_function_wrapper(
                    module_name,
                    method_path,
                    method_wrapper(
                      tracer=tracer,
                      task=task,
                      SpanCapture=SpanCapture
                    )
                )
            # pylint: disable=broad-except
            except Exception:
                pass


__all__ = [
  'method_wrapper',
  'async_method_wrapper',
  'stream_wrapper',
  'async_stream_wrapper',
  'AbstractSpanCapture',
  'BaseSpanCapture',
  'patch_module_classes'
]
