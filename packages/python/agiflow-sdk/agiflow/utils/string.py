import json
from agiflow.utils.debugging import Debugger

debugger = Debugger(__name__)


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


def serialise_to_json(value) -> str:
    cleaned_object = clean_empty(value)
    try:
        return json.dumps(cleaned_object)
    except Exception as e:
        debugger.warn(f"Failed to json.dump {str(e)}")
        try:
            return json.dumps(cleaned_object, default=custom_serializer)
        except Exception as e:
            debugger.warn(f"Failed to json.dump with custom_serializer {str(e)}")
            try:
                return json.dumps(cleaned_object, default=non_serialize)
            except Exception as e:
                debugger.warn(f"Failed to json.dump with non_serialize {str(e)}")
                return value


def cameltosnake(camel_string: str) -> str:
    if not camel_string:
        return ""
    elif camel_string[0].isupper():
        return f"_{camel_string[0].lower()}{cameltosnake(camel_string[1:])}"
    else:
        return f"{camel_string[0]}{cameltosnake(camel_string[1:])}"


def camel_to_snake(s):
    if len(s) <= 1:
        return s.lower()

    return cameltosnake(s[0].lower() + s[1:])
