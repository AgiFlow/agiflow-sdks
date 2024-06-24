# LLM Mocks
Welcome to the `llm-mocks` Library! This library is designed to provide comprehensive mock responses for Large Language Models (LLMs) from popular providers. Whether you are developing, testing, or integrating LLM-based solutions, this library offers a reliable and efficient way to simulate LLM responses without needing direct access to the actual services.

## Key Features
- Mock Responses: Predefined responses for various queries to simulate interactions with LLMs from providers like Anthropic and OpenAI.  

- Seamless Integration: Easy to integrate with your existing development and testing workflows such as Pytest.  

- Extensibility: Ability to customize mock responses to better match your specific use cases.  

- Performance: no network request, ensuring smooth development and testing processes.  

## Getting Started
To get started with LLM Library, follow the installation instructions and explore our examples to see how you can simulate LLM interactions in your projects. We provide [detailed guides](https://docs.agiflow.io/llm-mocks) to help you quickly integrate the library and start benefiting from its features.

## Installation
You can install the LLM Library using pip:

``` sh
pip install llm-mocks
```

For more information on installation and setup, please refer to our Installation Guide.

Here's a quick example of how to use the LLM Library to simulate a response from OpenAI's:

## Usage
``` python
from openai import AsyncOpenAI
from llm_mocks import MockOpenAIAsyncAPIClient

@pytest.fixture
def async_openai_client(mocker):
    mock_client = MockOpenAIAsyncAPIClient()
    mock_client.patch(mocker.patch)
    return AsyncOpenAI()
```

## Customisation
By default, the mock client always returns the same response. There are a few ways to customise response for testing and development:  

### Randomise response
You can pass `faker` instance to `mock client` for randomisation. If you want to control the level of randomness, simply add `seed configuration` as `Faker(seed=...)`.

``` python
from llm_mocks import MockOpenAISyncAPIClient
from faker import Faker

faker = Faker()
mock_client = MockOpenAISyncAPIClient(faker=faker)
```

### Provide your own response
If you would like the `mock client` to return specific response, you can override `DataFactory` classes as below:  

``` python
from llm_mocks import MockOpenAISyncAPIClient, OpenAIChatCompletionFactory

class MyChatCompletionFactory(OpenAIChatCompletionFactory):
    data = {...} # Your mock data
    stream_data = {...}

mock_client = MockOpenAISyncAPIClient(ChatCompletionFactory=MyChatCompletionFactory)
...
```

For more realistic testing, you can run unit test one-round with real API and capture the output using `llm-mocks`. Then using the `captured response` as mock data for the following runs to save LLM costs. This can be easily achieved using following strategy:  

1. Capture the response from real API  
NOTE: You would need to turn the mocking off for recording.  

``` python
from llm_mocks import MockOpenAISyncAPIClient, OpenAIChatCompletionFactory
import os

path = os.path.join(os.path.dirname(__file__), 'data')
MockOpenAISyncAPIClient().record(path)
```


2. This will record API response and save to json files in `data` directory. After recording, you can load saved data to `DataFactory` classes for testing:

``` python
...
class MyChatCompletionFactory(OpenAIChatCompletionFactory):
    data = OpenAIChatCompletionFactory.load_default_data(
      path, OpenAIChatCompletionFactory.name
    )
    stream_data = OpenAIChatCompletionFactory.load_default_data(
      path, f"{OpenAIChatCompletionFactory.name}Stream"
    )

mock_client = MockOpenAISyncAPIClient(ChatCompletionFactory=MyChatCompletionFactory)
...
```

## Contributing
We welcome contributions from the community! If you have ideas for new features, improvements, or bug fixes, please check out our Contributing Guide to get started.

## TODO
- [x] OpenAI AsyncAPIClient (Chat completion, ImagesResponse)
- [x] OpenAI SyncAPIClient (Chat completion, ImagesResponse)
- [x] Anthropic SyncAPIClient (Messages)
- [ ] Anthropic AsyncAPIClient (Messages)
- [ ] Groq specs 
- [ ] Cohere specs
- [ ] Azure specs 
- [ ] AWS Bedrock specs 
- [ ] Gemini specs 
- [ ] VertexAI specs 

## Support
If you encounter any issues or have questions, please visit our Support Page or open an issue on our GitHub repository.

Thank you for using LLM Library! We hope it makes your development and testing processes smoother and more efficient.
