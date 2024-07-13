import pytest
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Annotated
import operator


class State(TypedDict):
    input: str
    all_actions: Annotated[List[str], operator.add]


# Define nodes
def start_action(state):
    print("Starting process")
    return {"all_actions": ["start"]}


def end_action(state):
    print("Ending process")
    return {"all_actions": state["all_actions"] + ["end"], "next_state": END}


@pytest.mark.vcr()
def test_langgraph(exporter):
    # Initialize StateGraph
    graph = StateGraph(State)

    graph.add_node("start", start_action)
    graph.add_node("end", end_action)

    # Define edge
    graph.set_entry_point("start")
    graph.add_edge("start", "end")

    # Properly define the end node transition
    graph.add_edge("end", END)

    # Run the graph
    app = graph.compile()
    app.invoke({"input": "start"})

    spans = exporter.get_finished_spans()

    assert [
        'Graph.add_node',
        'Graph.add_node',
        'Graph.add_edge',
        'Graph.set_entry_point',
        'Graph.add_edge',
        'Graph.add_edge',
        "RunnableSequence",
        "RunnableSequence",
        'Pregel.invoke',
    ] == [span.name for span in spans]
