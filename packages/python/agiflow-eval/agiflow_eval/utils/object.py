from enum import Enum
import copy
from typing import Any
from collections.abc import Iterable
from dataclasses import asdict, is_dataclass


def drop_and_copy(obj, drop_attrs):
    # Function to drop attributes from a single object
    def drop_attrs_from_single_obj(single_obj, drop_attrs):
        temp_attrs = {}
        for attr in drop_attrs:
            if hasattr(single_obj, attr):
                temp_attrs[attr] = getattr(single_obj, attr)
                delattr(single_obj, attr)
        return temp_attrs

    # Check if obj is iterable (but not a string)
    if isinstance(obj, Iterable) and not isinstance(obj, str):
        copied_objs = []
        for item in obj:
            temp_attrs = drop_attrs_from_single_obj(item, drop_attrs)
            copied_objs.append(copy.deepcopy(item))
            # Restore attributes to the original item
            for attr, value in temp_attrs.items():
                setattr(item, attr, value)
        return copied_objs
    else:
        # If obj is not iterable, apply directly
        temp_attrs = drop_attrs_from_single_obj(obj, drop_attrs)
        copied_obj = copy.deepcopy(obj)
        # Restore attributes to the original object
        for attr, value in temp_attrs.items():
            setattr(obj, attr, value)
        return copied_obj


def dataclass_to_dict(instance: Any) -> Any:
    if is_dataclass(instance):
        return {k: dataclass_to_dict(v) for k, v in asdict(instance).items()}
    elif isinstance(instance, Enum):
        return instance.value
    elif isinstance(instance, list):
        return [dataclass_to_dict(item) for item in instance]
    elif isinstance(instance, tuple):
        return tuple(dataclass_to_dict(item) for item in instance)
    elif isinstance(instance, dict):
        return {k: dataclass_to_dict(v) for k, v in instance.items()}
    else:
        return instance
