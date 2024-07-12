import streamlit as st
import src.agent as agent
import dotenv


dotenv.load_dotenv()


def process_form(form_number, article):
    def set_value():
        print("set value", st.session_state.url)
        st.session_state["newvalues"]["url"] = st.session_state.url
        del st.session_state.newvalues["next"]

    def set_file():
        st.session_state["newvalues"].update({
            "raw": st.session_state.input_file.getvalue(),
            "file_name": st.session_state.input_file.name
        })

        del st.session_state.newvalues["next"]

    def do_first_dialog():
        words_in_article = st.slider("Words in article", 100, 2000, 500)

        # Radio buttons
        source_document = st.radio("Retrieve source document from:", ["the internet", "my computer"])

        # Buttons and logic
        if st.button('OK'):
            st.session_state['newvalues'] = {
                'origin': "internet" if source_document == "the internet" else "upload",
                "words": words_in_article,
                "next": True
            }
            st.rerun()

    if form_number == 0:
        if "origin" in article:  # if initial dialog happened
            if article["origin"] == "internet":
                st.text_input(
                    "Enter the URL of your source document:",
                    key="url",
                    on_change=set_value)
            else:  # if have to upload file
                st.file_uploader(
                    'Choose your source document',
                    type=['pdf', 'docx', 'html', 'txt'],
                    accept_multiple_files=False,
                    help="""
                    This is the source for the story you want written.
                    It can be a pdf, docx, html, or text file
                    """,
                    on_change=(set_file),
                    key="input_file"
                )
        if "origin" not in article:  # if this is initial dialog
            do_first_dialog()
    elif form_number == 1:
        header = article["title"]
        st.title(header)

        # Instructions (if any)
        instruction_text = "You can edit either the article or the critique.\n Clear the critique to use the article as displayed. "  # noqa: E501
        if instruction_text:
            st.write(instruction_text)

        # Text Boxes and Labels
        initial_contents = [article["body"], article["critique"]]
        titles = ["Draft Article", "Critique"]

        text_boxes = []
        for content, title in zip(initial_contents, titles):
            st.subheader(title)
            text_input = st.text_area("", value=content, height=150 if titles.index(title) == 0 else 50)
            text_boxes.append(text_input)

        if "url" in article:
            link_text = "Click here to open source document in browser."
            link_url = article["url"]
            st.markdown(f"[{link_text}]({link_url})", unsafe_allow_html=True)

        # OK Button
        if st.button('OK'):
            # Perform actions based on the form submission here
            # For example, print or store the contents of text_boxes

            st.session_state["newvalues"] = {"body": text_boxes[0], "critique": text_boxes[1], "button": "OK"}


def rerun():
    st.session_state['dm'] = None
    st.session_state['result'] = None
    st.session_state["newvalues"] = None


if 'dm' not in st.session_state:
    st.session_state['dm'] = None
    st.session_state['result'] = None
    st.session_state["newvalues"] = None

# App title
st.title("Human-In-The-Loop AI Collaboration with Reflection Agent")

with st.sidebar:
    st.markdown("""
### What it's all about:

    This application demonstrates
    how artificial intelligence
    agents and a human (you) can
    collaborate on a task.

    Today's task is to write a news
    article about a meeting for
    which a text transcript or
    minutes are available.

    You point to that source;
    the writer agent drafts;
    the critique agent critiques;
    you can edit either the draft or
    the critique. This repeats until
    you are satisfied with a draft.
""")

if st.session_state["dm"] is None:
    st.session_state['dm'] = agent.StateMachine()
    st.session_state["result"] = st.session_state['dm'].start()


if st.session_state["result"]:
    print("have result")
    if "quit" not in st.session_state['result']:
        if st.session_state["newvalues"] is None:
            process_form(st.session_state['result']["form"], st.session_state['result'])
        if st.session_state["newvalues"] and "next" in st.session_state.newvalues:
            process_form(st.session_state['result']["form"], st.session_state.newvalues)
        if st.session_state["newvalues"] and "next" not in st.session_state.newvalues:
            with st.spinner("Please wait... Bots at work"):
                st.session_state["result"] = st.session_state['dm'].resume(st.session_state["newvalues"])
            st.session_state["newvalues"] = None
            st.rerun()
    if "quit" in st.session_state["result"]:
        st.subheader(st.session_state.result["title"])
        st.write(st.session_state.result["date"])
        st.markdown(st.session_state.result["body"])
        st.write("\n")
        st.write("summary:", st.session_state.result["summary"])
        st.button("Run with new document", key="rerun", on_click=rerun)

        with st.sidebar:
            st.button("Run with new document", key="rerun1", on_click=rerun)
