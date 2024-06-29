<div align="center">

![Logo of AGIFlow](./docs/agiflow_logo.png)

# **AGIFlow**

🤖 **AGIFlow**: LLM QA and Observability. We streamline LLM and Agentic Workflow development with real-time tracing and a visual debugger. Easily test prompt and model performance while continuously monitoring performance in production.

[Homepage](https://agiflow.io/) | [Documentation](https://docs.agiflow.com/) | [Discord](https://discord.gg/KCMyce2J) | [Newsletter](https://mailchi.mp/agiflow/agiflow-sub)

</div>

## Table of contents

- [Why AGIFlow?](#why-agiflow)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [Contribution](#contribution)
- [License](#license)
- [Support](#support)

## Why AGIFLow?

LLM Ops not only help ensuring all risks are monitored but also significantly reduces debugging time and simplifies AI workflows.  

With automatic logging and detailed traces, AGIFlow optimizes performance and resolves issues efficiently. Additionally, its intuitive dashboards accelerate QA and feedback loops, boosting team productivity and reducing training time.

### 🌟 What's Inside?

This mono-repo includes various libraries and packages such as:

- 🔍 **LLM Ops**: Effective monitoring, deployment, and management of machine learning models to ensure optimal performance and reliability.
- 🧪 **Testing Tools**: Validate the performance, accuracy, and robustness of your language models, ensuring they function correctly and reliably in various scenarios.
- 📣 **User In-the-loop Feedback**: Gather quantitative and qualitative user feedback to enhance your AI through fine-tuning and prompt benchmarking.


## Getting Started

This repo uses `NX` for task management and `Pnpm` + `Poetry` for package management. To get started, simply clone the repo and run `pnpm install` to install all dependencies.

1. **Clone the Repository**:
```bash
git clone https://github.com/AgiFlow/agiflow-sdks.git
cd agiflow-sdks
```

2. **Install Dependencies**:
```bash
pnpm install
```

3. **Run the development app**: 
```bash
cd dockers/dev
docker-compose up
```

Get the API key and follow [this documentation](https://docs.agiflow.io/python) to get telemetry from your LLM app to Agiflow dashboard.

## Key Features

Our mono-repo is designed with the goal of building robust and scalable AI products. Here is an overview of our packages:

- [x] **[llm-mocks](https://docs.agiflow.io/llm-mocks)**: Mocking library for LLM providers, simplifying TDD, reducing CI/CD costs on regression testing, and facilitating API development.
- [x] **[agiflow-eval](https://docs.agiflow.io/python-agiflow-eval)**: Python SDK for LLM evaluations, supporting custom templates and multiple models.
- [x] **[agiflow-sdk](https://docs.agiflow.io/python)**: Python SDK built on top of Open-Telemetry to collect LLM metrics, supporting prompt and model registry synchronization for multiple LLM usages.
- [ ] **[@agiflow/js-sdk](https://docs.agiflow.io/web)**: Web SDK for frontend analytics on how users interact with LLM apps, allowing full-stack traceability.
- [ ] **[@agiflow/web-feedback](https://docs.agiflow.io/web/feedback)**: Feedback widget with session replay and workflow visualization to get high-quality feedback from simple chat apps to complex agentic workflows.
- [ ] **dockers**: Docker compose to run and self-host AGIFlow.

We're making sources available on a rolling basis from our internal repo. For comprehensive documentation, please visit [AGIFlow's docs](https://docs.agiflow.io).

## Contribution

We welcome contributions from the community! If you would like to contribute, please follow [this guide](./Contribution.md).

## License

This repository is a mono-repo that contains various packages, modules, and applications, each of which may be governed by different licenses. Unless otherwise explicitly stated within the respective package, module, or application subdirectory, the code in this repository is licensed under the Business Source License (BSL). For more details, refer to the [License Notice](./LICENSE).

## Support

If you have any questions or need support, please open an issue in this repository or contact our support team at vuong@agiflow.com.

To stay updated, get support, and engage with fellow developers, join our [Discord community](https://discord.gg/KCMyce2J). Click the link below to connect with us and be part of the conversation!

Thank you for using AGIFlow SDKs! We look forward to seeing the amazing things you build.
