# AGIFlow SDKs Mono-Repo

![Discord Shield](https://discord.com/api/guilds/1254667011884187718/widget.png?style=shield) [Join Us On Discord](https://discord.gg/KCMyce2J) or [Subscribe to our Newsletter](https://mailchi.mp/agiflow/agiflow-sub)

Welcome to the [AGIFlow](https://agiflow.io) SDKs mono-repo! This repository serves as a centralized location for all the Software Development Kits (SDKs) developed by AGIFlow. Whether you're building applications, integrating with our services, or exploring our technology, this mono-repo provides you with the necessary tools and resources.

## Purpose

The primary purpose of this repository is to facilitate the development and integration of AGIFlow's services by providing comprehensive SDKs for LLM Observability, testing and user feedbacks. This repository is structured to accommodate multiple SDKs, each tailored to different platforms, languages, and use cases.

## Scope

This mono-repo encompasses a wide range of SDKs designed to meet various development needs. Each SDK is organized into its respective subdirectory and may include:

- **API Clients**: Simplified interfaces to interact with AGIFlow's APIs.
- **Utilities**: Helper functions and utilities to streamline common tasks.
- **Examples**: Sample code and projects demonstrating how to use the SDKs effectively.
- **Documentation**: Detailed documentation to guide users through installation, configuration, and usage.

### Rolling release

We're making sources available on rolling basic. For comprehensive documentations, please visit [AGIFLow's docs](https://docs.agiflow.io).
- [x] llm-mocks: Mocking library for LLM providers
- [ ] agiflow-sdk: Agiflow python SDK for observability and tracing
- [ ] agiflow-eval: Agiflow python SDK for LLM Evaluations
- [ ] @agiflow/js-sdk: Agiflow web sdk for analytics
- [ ] @agiflow/web-feedback: Agiflow web sdk to get user feedback
- [ ] dockers: Docker compose to run and self-host Agiflow

## Getting Started

This repo use `NX` for task manager and `Pnpm` + `Poetry` for package manager. Simply clone the repo and run `pnpm install` to install all dependencies.  

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/AGIFlow-SDKs.git
   cd AGIFlow-SDKs
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Follow the Instructions**: Each SDK has its own set of instructions for installation and usage. Refer to the README file within the SDK’s directory.

## Contribution

We welcome contributions from the community! If you would like to contribute, please follow these steps:

1. **Fork the Repository**: Create your own fork of the repository.
2. **Create a Branch**: Create a new branch for your feature or bugfix.
   ```bash
   git checkout -b feature-name
   ```
3. **Make Changes**: Implement your changes and commit them with descriptive messages.
4. **Open a Pull Request**: Submit a pull request to the main repository with a detailed description of your changes.

## License

This repository is a mono-repo that contains various packages, modules, and applications, each of which may be governed by different licenses. Unless otherwise explicitly stated within the respective package, module, or application subdirectory, the code in this repository is licensed under the Business Source License (BSL). For more details, refer to the [License Notice](./LICENSE).

## Support

If you have any questions or need support, please open an issue in this repository or contact our support team at vuong@agiflow.com.

To stay updated, get support, and engage with fellow developers, join our [Discord community](https://discord.gg/KCMyce2J). Click the link below to connect with us and be part of the conversation!

Thank you for using AGIFlow SDKs! We look forward to seeing the amazing things you build.
