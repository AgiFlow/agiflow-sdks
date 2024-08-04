import os
from agiflow import Agiflow
from openai import OpenAI
# from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

# Initialize otel exporter and AGIFlow instrumentation
app_name = "agiflow-python-ollama"
# otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "http://localhost:4318/v1/traces")
# otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
otlp_exporter = ConsoleSpanExporter()
Agiflow.init(app_name=app_name, exporter=otlp_exporter)


def main():
    ollama_host = os.getenv('OLLAMA_HOST', 'localhost')
    # Use the OpenAI endpoint, not the Ollama API.
    base_url = 'http://' + ollama_host + ':11434/v1'
    client = OpenAI(base_url=base_url, api_key='unused')
    messages = [
      {
        'role': 'user',
        'content': '<|fim_prefix|>def hello_world():<|fim_suffix|><|fim_middle|>',
      },
    ]
    chat_completion = client.chat.completions.create(model='llama3.1', messages=messages)
    print(chat_completion.choices[0].message.content)


if __name__ == "__main__":
    main()
