"""
Created on Sun Mar 24 11:05:08 2024

@author: tevsl
"""


def extract_text(content, content_type):
    from bs4 import BeautifulSoup
    from docx import Document
    import fitz
    import io

    if 'html' in content_type:
        return BeautifulSoup(content, 'html.parser').get_text()
    elif 'docx' == content_type:
        return "\n".join([paragraph.text for paragraph in Document(io.BytesIO(content)).paragraphs])
    elif 'pdf' == content_type:
        text = []
        with fitz.open(stream=content, filetype="pdf") as doc:
            for page in doc:
                text.append(page.get_text())
        return text
    elif 'txt' == content_type:
        return content.decode('utf-8', errors='replace')
    else:
        raise ValueError("Unsupported file type or content")


def load_text_from_path(path):
    with open(path, 'rb') as file:
        content = file.read()
    content_type = path.split(".")[-1]
    return extract_text(content, content_type)


def load_text_from_url(url, timeout=10):
    import requests
    import mimetypes
    from playwright.sync_api import sync_playwright

    the_split = url.split(".")  # try to split out type
    if the_split[-1] in ['html', 'docx', 'text', 'txt', 'pdf']:  # if likely s static page or file
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'  # noqa: E501
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()  # caller will have to deal with error
        content_type = response.headers['Content-Type'].split(';')[0]
        content_type = (mimetypes.guess_extension(content_type))
        if content_type.startswith('.'):
            content_type = content_type[1:]
        if content_type not in [['html', 'docx', 'txt', 'pdf']]:  # if we don't recognize it
            content_type = the_split[-1]  # use it from file name
        return extract_text(response.content, content_type)
    else:  # if not known to be static page
        with sync_playwright() as playwright:
            chromium = playwright.chromium
            browser = chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url)
            html = page.content()
            # other actions...
            browser.close()
            return extract_text(html, "html")
