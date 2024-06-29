import logging
from typing import Callable


def error_handler(func: Callable):
    logger = logging.getLogger(func.__module__)
    """
    Guard hook error processing data
    Don't guard stream as it swallow error from chunk
    """
    try:
        return func()
    except Exception as e:
        mes = "Failed to execute %s, error: %s", func.__name__, str(e)
        logger.warning(mes)


def silently_fail(func):
    """
    A decorator that catches exceptions thrown by the decorated function and logs them as warnings.
    """

    logger = logging.getLogger(func.__module__)

    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as exception:
            mes = "Failed to execute %s, error: %s", func.__name__, str(exception)
            logger.warning(mes)

    return wrapper
