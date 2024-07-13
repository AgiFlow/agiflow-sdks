from datetime import datetime
import json5 as json

from langgraph.graph import Graph
import litellm
from agiflow.opentelemetry import agent

MODEL = 'gpt-4o'


@agent(name="WriterAgent", method_name='writer')
@agent(name="WriterAgent", method_name='revise')
class WriterAgent:

    def writer(self, the_text: str, word_count=500):

        sample_json = """
            {
              "title": title of the article,
              "date": today's date,
              "body": The body of the article,
                "summary": "2 sentences summary of the article"
            }
            """

        prompt = [{
            "role": "system",
            "content": "You are a newspaper writer. Your sole purpose is to write a well-written article about the meeting described in the minutes "  # noqa: E501
        }, {
            "role": "user",
            "content": f"Today's date is {datetime.now().strftime('%d/%m/%Y')}\n."

                       f"{the_text}\n"
                       f""""Your task is to write an article for me about the meeting described above covering what seems most important.
                       The article should be approximately {word_count} words and should be divided into paragraphs
                       using newline characters.
                       You are reporting news. Do not editorialize."""  # noqa: E501
                       f"Please return nothing but a JSON in the following format:\n"
                       f"{sample_json}\n "

        }]

        response = litellm.completion(
            model=MODEL,
            messages=prompt,
            temperature=.5,
            num_retries=1,
            response_format={"type": "json_object"}
        )
        return json.loads(response['choices'][0]['message']['content'])

    def revise(self, article: dict):
        sample_revise_json = """
            {
                "body": The body of the article,,
                "message": "message to the critique"
            }
            """
        prompt = [{
            "role": "system",
            "content": "You are a newspaper editor. Your sole purpose is to edit a well-written article about a "
                       "topic based on given critique\n "
        }, {
            "role": "user",
            "content": f"{str(article)}\n"
                       f"Your task is to edit the article based on the critique given.\n "
                       f"Please return json format of the 'paragraphs' and a new 'message' field"
                       f"to the critique that explain your changes or why you didn't change anything.\n"
                       f"please return nothing but a JSON in the following format:\n"
                       f"{sample_revise_json}\n "

        }]

        res = litellm.completion(
            model=MODEL,
            messages=prompt,
            temperature=.5,
            num_retries=1,
            response_format={"type": "json_object"}
        )

        content = res['choices'][0]['message']['content']
        response = json.loads(content)
        print(f"For article: {article['title']}")
        print(f"Writer Revision Message: {content}\n")
        return response

    def run(self, article: dict):
        print("writer working...", article.keys())
        critique = article.get("critique")
        if critique is not None:
            article.update(self.revise(article))
        else:
            article.update(self.writer(article["source"], word_count=article['words']))
        return article


@agent(name="CritiqueAgent", method_name='critique')
class CritiqueAgent:

    def critique(self, article: dict):
        short_article = article.copy()
        del short_article['source']
        prompt = [{
            "role": "system",
            "content": "You are a newspaper writing critique. Your sole purpose is to provide short feedback on a written "  # noqa: E501
                       "article so the writer will know what to fix.\n "
        }, {
            "role": "user",
            "content": f"Today's date is {datetime.now().strftime('%d/%m/%Y')}\n."
                       f"{str(short_article)}\n"
                       f"Your task is to provide  feedback on the article only if necessary.\n"
                       f"the article is a news story so should not include editorial comments."
                       f"Be sure that names are given for split votes and for debate."
                       f"The maker of each motion should be named."
                       f"if you think the article is good, please return only the word 'None' without the surrounding hash marks.\n"  # noqa: E501
                       f"do NOT return any text except the word 'None' without surrounding hash marks if no further work is needed onthe article."  # noqa: E501
                       f"if you noticed the field 'message' in the article, it means the writer has revised the article"
                       f"based on your previous critique. The writer may have explained in message why some of your"
                       f"critique could not be accomodated. For example, something you asked for is not available information."  # noqa: E501
                       f"you can provide feedback on the revised article or "
                       f"return only the word 'None' without surrounding hash mark if you think the article is good."
        }]

        res = litellm.completion(
            model=MODEL,
            messages=prompt,
            temperature=.5,
            num_retries=1,
        )

        response = res['choices'][0]['message']['content']

        if response == 'None':
            return {'critique': None}
        else:
            print(f"For article: {article['title']}")
            print(f"Feedback: {response}\n")
            return {'critique': response, 'message': None}

    def run(self, article: dict):
        print("critiquer working...", article.keys())
        article.update(self.critique(article))
        article["form"] = 1
        if "message" in article:
            print('message', article['message'])
        return article


@agent(name="InputAgent", method_name='run')
class InputAgent:

    def run(self, article: dict):
        from src.tools import extract_text, load_text_from_path, load_text_from_url

        print("input agent running...")
        print(article.keys())
        if "url" in article:
            the_text = load_text_from_url(article["url"])

        else:
            if "raw" in article:
                raw = article['raw'].encode('latin-1')
                the_text = extract_text(content=raw, content_type=article["file_name"].split('.')[-1])
                del article["raw"]
            else:
                the_text = load_text_from_path(article['file_name'])

        article["source"] = the_text
        return article


@agent(name="OutputAgent", method_name='run')
class OutputAgent:

    def run(self, article: dict):
        print(f"Title: {article['title']}\nSummary: {article['summary']}\nBody:{article['body']}")
        return article


@agent(name="HumanReviewAgent", method_name='run')
class HumanReviewAgent:

    def run(self, article: dict):
        print("human review agent running", article.keys())
        if article["button"] == 'OK':
            if not article["critique"]:
                article["critique"] = None
                article["quit"] = "yes"
        else:
            assert False, "Canceled by editor"
        return article


@agent(name="StartAgent", method_name='run')
class StartAgent:
    name = 'start'

    def run(self, dummy):
        print("start agent working")
        return {"form": 0, "name": self.name}


class StateMachine:
    def __init__(self, api_key=None):
        import os
        from langgraph.checkpoint.sqlite import SqliteSaver
        import sqlite3

        def from_conn_stringx(cls, conn_string: str,) -> "SqliteSaver":
            return SqliteSaver(conn=sqlite3.connect(conn_string, check_same_thread=False))
        SqliteSaver.from_conn_stringx = classmethod(from_conn_stringx)

        if api_key:
            os.environ['OPENAI_API_KEY'] = api_key
        else:
            from dotenv import load_dotenv
            load_dotenv()

        self.memory = SqliteSaver.from_conn_stringx(":memory:")

        start_agent = StartAgent()
        input_agent = InputAgent()
        writer_agent = WriterAgent()
        critique_agent = CritiqueAgent()
        output_agent = OutputAgent()
        human_review = HumanReviewAgent()

        workflow = Graph()

        workflow.add_node(start_agent.name, start_agent.run)
        workflow.add_node("input", input_agent.run)
        workflow.add_node("write", writer_agent.run)
        workflow.add_node("critique", critique_agent.run)
        workflow.add_node("output", output_agent.run)
        workflow.add_node("human_review", human_review.run)

        workflow.add_edge("input", "write")

        workflow.add_edge('write', 'critique')
        workflow.add_edge('critique', 'human_review')
        workflow.add_edge(start_agent.name, "input")
        workflow.add_conditional_edges(
            'human_review',
            lambda x: "accept" if x['critique'] is None else "revise",
            path_map={"accept": "output", "revise": "write"}
        )

        # set up start and end nodes
        workflow.set_entry_point(start_agent.name)
        workflow.set_finish_point("output")

        self.thread = {"configurable": {"thread_id": "2"}}
        self.chain = workflow.compile(checkpointer=self.memory, interrupt_after=[start_agent.name, "critique"])

    def start(self):
        result = self.chain.invoke("", self.thread)

        if result is None:
            values = self.chain.get_state(self.thread).values
            last_state = next(iter(values))
            return values[last_state]
        return result

    def resume(self, new_values: dict):
        values = self.chain.get_state(self.thread).values
        last_state = next(iter(values))

        if new_values.get('raw') is not None:
            new_values['raw'] = new_values['raw'].decode('latin-1')

        values[last_state].update(new_values)
        self.chain.update_state(self.thread, values[last_state])
        result = self.chain.invoke(None, self.thread, output_keys=last_state)

        if result is None:
            values = self.chain.get_state(self.thread).values
            last_state = next(iter(values))
            return self.chain.get_state(self.thread).values[last_state]
        return result
