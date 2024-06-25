import json
from typing import Any


def clean_empty(d):
    """Recursively remove empty lists, empty dicts, or None elements from a dictionary."""
    if not isinstance(d, (dict, list)):
        return d
    if isinstance(d, list):
        return [v for v in (clean_empty(v) for v in d) if v != [] and v is not None]
    return {
        k: v
        for k, v in ((k, clean_empty(v)) for k, v in d.items())
        if v is not None and v != {}
    }


def custom_serializer(obj):
    """Fallback function to convert unserializable objects."""
    if hasattr(obj, "__dict__"):
        # Attempt to serialize custom objects by their __dict__ attribute.
        return clean_empty(obj.__dict__)
    else:
        # For other types, just convert to string
        return str(obj)


def non_serialize(value):
    return f"<<non-serializable: {type(value).__qualname__}>>"


def serialise_to_json(value, **kwargs) -> str:
    cleaned_object = clean_empty(value)
    try:
        return json.dumps(cleaned_object, **kwargs)
    except Exception as e:
        print(e)
        try:
            return json.dumps(cleaned_object, default=custom_serializer, **kwargs)
        except Exception as e:
            print(e)
            try:
                return json.dumps(cleaned_object, default=non_serialize, **kwargs)
            except Exception as e:
                print(e)
                return value


def write_to_json(result: Any, file: str):
    json = serialise_to_json(result, ensure_ascii=False, indent=4)
    with open(file, 'w') as f:
        f.write(json)


__all__ = [
  'serialise_to_json',
  'write_to_json',
]
