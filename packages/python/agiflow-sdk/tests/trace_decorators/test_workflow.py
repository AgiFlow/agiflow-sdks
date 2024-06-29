from typing import Any
import pytest
from agiflow.opentelemetry import (
    workflow, aworkflow
)
from agiflow.utils import serialise_to_json


@pytest.mark.vcr()
def test_workflow_input_output(exporter):

    @workflow(name='test', description='Workflow description', prompt_settings={"version": '0.0.1'})
    def test_fn(input: Any):
        return {'foo': 'bar'}

    input = [
        ("system", "You are world class technical documentation writer."),
        ("user", "{input}"),
    ]
    test_fn(input)
    spans = exporter.get_finished_spans()
    span = spans[-1]
    attributes = span.attributes

    assert attributes.get("agiflow.service.type") == "Workflow"
    assert attributes.get("agiflow.entity.description") == "Workflow description"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": [input]})
    assert attributes.get("agiflow.entity.output") == serialise_to_json({'foo': 'bar'})
    assert attributes.get("agiflow.prompt.version") == '0.0.1'


def test_workflow_empty(exporter):

    @workflow(name='test')
    def test_fn():
        pass

    test_fn()
    spans = exporter.get_finished_spans()
    span = spans[-1]
    attributes = span.attributes
    print(span)

    assert attributes.get("agiflow.service.type") == "Workflow"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": []})
    assert not attributes.get("agiflow.entity.output")


@pytest.mark.vcr()
async def test_aworkflow_input_output(exporter):

    @aworkflow(name='test')
    async def test_fn(input: Any):
        return {'foo': 'bar'}

    input = [
        ("system", "You are world class technical documentation writer."),
        ("user", "{input}"),
    ]
    await test_fn(input)
    spans = exporter.get_finished_spans()
    span = spans[-1]
    attributes = span.attributes

    assert attributes.get("agiflow.service.type") == "Workflow"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": [input]})
    assert attributes.get("agiflow.entity.output") == serialise_to_json({'foo': 'bar'})
