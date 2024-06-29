from typing import Any
from opentelemetry.sdk.trace.sampling import Sampler, SamplingResult, Decision, _get_parent_trace_state
from opentelemetry.util.types import Attributes


class NoSampler(Sampler):
    """
    Alway trace span.
    Using this Sampler to consistently sending trace to Agiflow
    to collect user feedback.
    """

    def __init__(self):
        self._decision = 1

    def should_sample(
        self,
        parent_context: Any,
        trace_id,
        name,
        kind: Any = None,
        attributes: Attributes = None,
        links: Any = None,
        trace_state: Any = None,
    ) -> "SamplingResult":
        return SamplingResult(
            Decision.RECORD_ONLY,
            attributes,
            _get_parent_trace_state(parent_context),
        )

    def get_description(self) -> str:
        return "NoSampler"
