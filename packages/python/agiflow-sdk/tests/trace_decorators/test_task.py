from typing import Any
import pytest
from agiflow.opentelemetry import (
    task, atask, agent
)
from agiflow.utils import serialise_to_json


@pytest.mark.vcr()
def test_task_input_output(exporter):

    @task(name='test')
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

    assert attributes.get("agiflow.service.type") == "Task"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": [input]})
    assert attributes.get("agiflow.entity.output") == serialise_to_json({'foo': 'bar'})


def test_task_empty(exporter):

    @task(name='test')
    def test_fn():
        pass

    test_fn()
    spans = exporter.get_finished_spans()
    span = spans[-1]
    attributes = span.attributes
    print(span)

    assert attributes.get("agiflow.service.type") == "Task"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": []})
    assert not attributes.get("agiflow.entity.output")


@pytest.mark.vcr()
async def test_atask_input_output(exporter):

    @atask(name='test')
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

    assert attributes.get("agiflow.service.type") == "Task"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": [input]})
    assert attributes.get("agiflow.entity.output") == serialise_to_json({'foo': 'bar'})


@pytest.mark.vcr()
def test_agent_input_output(exporter):

    @agent(name='test')
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

    assert attributes.get("agiflow.service.type") == "Agent"
    assert attributes.get("agiflow.entity.name") == "test"
    assert attributes.get("agiflow.entity.input") == serialise_to_json({"args": [input]})
    assert attributes.get("agiflow.entity.output") == serialise_to_json({'foo': 'bar'})
