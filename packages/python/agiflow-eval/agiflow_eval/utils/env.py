from agiflow_eval.config import EnvironmentVars


def show_indicator():
    try:
        if EnvironmentVars.DISABLE_AGIFLOW_EVAL_INDICATOR == "YES":
            return False
        else:
            return True
    except Exception:
        return True
