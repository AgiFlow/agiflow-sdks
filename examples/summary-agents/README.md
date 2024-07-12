# Summary Agents

This project leverages Streamlit, LangGraph, and LiteLLM to provide a demo on [AGIFlow's LLMOps] integration. The project is ported from [meeting_reporter](https://github.com/tevslin/meeting-reporter/blob/main/README.md), for conceptual implementation, visit the original repo. 

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with Summary Agents, follow these steps:

1. Clone the repository:
```sh
git clone https://github.com/AgiFlow/agiflow-sdks
cd agiflow-sdks
```

2. Install dependencies:
```sh
pnpm install
```

3. Configure environment:
```sh
cp .env.example .env
```
Set `OPENAI_API_KEY`, `AGIFLOW_API_KEY`.

NOTE: You can run AGIFlow development with docker-compose by `cd dockers/dev`, or sign-up with [AGIFLow's controlplane](https://app.agiflow.io) and get the keys. With docker-compose setup, set additional environment variable  `AGIFLOW_BASE_URL=https://localhost:3000/api/dataplane`.

## Usage

To run the application, execute the following command:
```sh
cd examples/summary-agents
source ./.venv/bin/activate
nx run examples-summary-agents:run-app
```

This will start the Streamlit server and open the web application in your default browser. You can now upload a file or enter a URL to get a summary.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
