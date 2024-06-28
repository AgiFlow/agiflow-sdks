# LLM Mocks
Welcome to the `llm-mocks` Library! This library is designed to provide mock responses for Large Language Models (LLMs) from popular providers. Whether you are developing, testing, or integrating LLM-based solutions, this library offers a reliable and efficient way to simulate LLM responses without needing direct access to the actual services.

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

## Supported providers
- [x] OpenAI (Chat CompletionS, Images Regenerations, Embedding)
- [x] Anthropic (Messages)
- [x] Cohere (Chat, Embed, Rerank)
- [ ] Groq specs 
- [ ] Cohere specs
- [ ] Azure specs 
- [ ] AWS Bedrock specs 
- [ ] Gemini specs 
- [ ] VertexAI specs 


## Usage
The library will try to return mock response if the providers and apis are supported; otherwise it will fallback to `vcrpy` implementation of network mocking.  

### With Pytest Recording
Pytest recording already implement `vcrpy`. Simply initialise `LLMMock` to mock response.  

``` python
from llm_mocks import LLMMock

...

LLMMock()
```

### Normal mock
Follow [vcrpy usage documentation](https://vcrpy.readthedocs.io/en/latest/usage.html) for setting up vcr. Then initialise `LLMMock` class for reponse mocking.  

## Customisation
By default, the mock client always returns the same response. There are a few ways to customise response for testing and development:  

### Randomise response
You can pass `faker` instance to `LLMMock` for randomisation. If you want to control the level of randomness, simply add `seed configuration` as `Faker(seed=...)`.

``` python
from llm_mocks import LLMMock
from faker import Faker

faker = Faker()
LLMMock(faker=faker)
```

### Provide your own response
If you would like the to return specific response, you can override response generate from mock client using `reponse_overwrite` hook:  

``` python
from llm_mocks import LLMMock

def response_overwrite(request, response):
    ...

LLMMock(reponse_overwrite=response_overwrite)
...
```

### Use vcr for recording and replay
This library monkey patch `vcrpy` to provide mock request before `vcr cassette` read local file or make network request. To resume `vcr` functionality, simply disable mock service:  

``` python
LLMMock(mock_disabled)
```

## Contributing
We welcome contributions from the community! If you have ideas for new features, improvements, or bug fixes, please check out our Contributing Guide to get started.

## Support
If you encounter any issues or have questions, please visit our Support Page or open an issue on our GitHub repository.

Thank you for using LLM Library! We hope it makes your development and testing processes smoother and more efficient.
