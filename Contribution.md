# Contribution Guidelines

Welcome to the AGIFlow SDKs! We appreciate your interest in contributing to our project. Below are the guidelines to help you contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Style Guides](#style-guides)
- [Commit Messages](#commit-messages)
- [Code Review](#code-review)
- [License](#license)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

## How to Contribute

### Reporting Issues

If you find a bug, have a feature request, or need help, please open an issue in the appropriate repository. Provide as much detail as possible, including:

- Steps to reproduce the issue
- Expected and actual behavior
- Screenshots or code snippets (if applicable)
- Your environment (OS, Node.js/Python version, etc.)

### Submitting Pull Requests

We follow the [GitHub Flow](https://guides.github.com/introduction/flow/) for our development process. Here’s how you can contribute:

1. **Fork the Repository**: Click the “Fork” button at the top right of the repository page.
2. **Clone Your Fork**: Clone your forked repository to your local machine.
   ```bash
   git clone https://github.com/AgiFlow/agiflow-sdks.git
   cd AGIFlow-SDKs
   ```
3. **Create a Branch**: Create a new branch for your feature or bugfix.
   ```bash
   git checkout -b feature-name
   ```
4. **Make Changes**: Implement your changes and commit them with descriptive messages.
5. **Push to Your Fork**: Push your branch to your forked repository.
   ```bash
   git push origin feature-name
   ```
6. **Open a Pull Request**: Open a pull request from your fork to the main repository. Provide a clear description of your changes and link any related issues.

## Style Guides

### Code Style

Please adhere to the coding standards used throughout the project. Consistent code style helps maintain readability and ease of maintenance. 

- Follow PEP 8 for Python code.
- Follow the Airbnb JavaScript Style Guide for JavaScript code.

### Documentation

- Use clear and concise language.
- Document all public methods and classes.
- Update the README files if there are any changes to the usage or installation steps.

## Commit Messages

Write meaningful commit messages that accurately describe your changes. Use the following template for your commit messages:

```
[type]: [short description]

[Optional longer description]

[Resolves #issue-number]
```

- `type`: Can be `fix`, `feat`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- `short description`: A brief description of the changes.
- `longer description`: A more detailed description of the changes, if necessary.
- `Resolves #issue-number`: Link to the issue being resolved, if applicable.

## Code Review

All pull requests are reviewed by project maintainers. Reviews ensure code quality and consistency across the project. Here’s what we look for during a review:

- Code adheres to the style guides.
- Changes are well-tested.
- Commit messages are clear and descriptive.
- Documentation is updated as needed.

## License

By contributing to AGIFlow SDKs, you agree that your contributions will be licensed under respective package, module, or application subdirectory license. For more details, refer to the [License Notice](./LICENSE).

---

Thank you for contributing to AGIFlow SDKs! Your contributions help improve the project and are greatly appreciated. If you have any questions, feel free to ask in the [issue tracker](https://github.com/AgiFlow/agiflow-sdks/issues) or join our [Discord community](https://discord.gg/KCMyce2J).
