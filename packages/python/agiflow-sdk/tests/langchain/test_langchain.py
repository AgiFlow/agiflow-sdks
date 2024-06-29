import pytest
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


@pytest.mark.vcr()
def test_langchain(exporter, llm):
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are world class technical documentation writer."),
            ("user", "{input}"),
        ]
    )
    output_parser = StrOutputParser()
    chain = prompt | llm | output_parser
    chain.invoke({"input": "how can langsmith help with testing?"})
    spans = exporter.get_finished_spans()

    assert [
        "ChatPromptTemplate",
        "Completions",
        "ChatOpenAI",
        "RunnableSequence",
    ] == [span.name for span in spans]
