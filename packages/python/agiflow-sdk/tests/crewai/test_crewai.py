import pytest
from crewai import Agent, Task
from pathlib import Path
import os
from .MarkdownTools import markdown_validation_tool


def process_markdown_document(filename, llm=None):
    """
    Processes a markdown document by reviewing its syntax validation
    results and providing feedback on necessary changes.

    Args:
        filename (str): The path to the markdown file to be processed.

    Returns:
        str: The list of recommended changes to make to the document.

    """

    goal = """Provide a detailed list of the markdown
        linting results. Give a summary with actionable
        tasks to address the validation results. Write your
        response as if you were handing it to a developer
        to fix the issues.
        DO NOT provide examples of how to fix the issues or
        recommend other tools to use."""
    backstory = """You are an expert business analyst
        and software QA specialist. You provide high quality,
        thorough, insightful and actionable feedback via
        detailed list of changes and actionable tasks."""
    # Define general agent
    general_agent = Agent(
        role='Requirements Manager',
        goal=goal,
        backstory=backstory,
        allow_delegation=False,
        verbose=True,
        tools=[markdown_validation_tool],
        llm=llm
    )

    description = f"""
        Use the markdown_validation_tool to review
        the file(s) at this path: {filename}

        Be sure to pass only the file path to the markdown_validation_tool.
        Use the following format to call the markdown_validation_tool:
        Do I need to use a tool? Yes
        Action: markdown_validation_tool
        Action Input: {filename}

        Get the validation results from the tool
        and then summarize it into a list of changes
        the developer should make to the document.
        DO NOT recommend ways to update the document.
        DO NOT change any of the content of the document or
        add content to it. It is critical to your task to
        only respond with a list of changes.

        If you already know the answer or if you do not need
        to use a tool, return it as your Final Answer."""
    # Define Tasks Using Crew Tools
    syntax_review_task = Task(
        description=description,
        expected_output="",
        agent=general_agent
    )

    updated_markdown = syntax_review_task.execute()

    return updated_markdown


@pytest.mark.vcr()
def test_crewai(exporter, llm):
    file = os.path.join(Path(__file__).parent, 'test.md')
    process_markdown_document(file, llm=llm)
    spans = exporter.get_finished_spans()

    assert [
      'Agent',
      'Task'
    ] == [span.name for span in spans]
