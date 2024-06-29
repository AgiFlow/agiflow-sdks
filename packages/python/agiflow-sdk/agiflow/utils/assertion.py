def is_notebook():
    try:
        from IPython import get_ipython

        ip = get_ipython()
        if ip is None:
            return False
        return True
    except Exception:
        return False
