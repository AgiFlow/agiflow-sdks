# NX, PNPM, and Poetry Mono-Repo with Package-Based Structure

Agiflow uses the NX for task runner, PNPM, and Poetry for nodejs and python package managers! This repository is designed to help you efficiently manage multiple projects and libraries within a single, unified workspace using NX, PNPM, and Poetry.

## Table of Contents

- [Introduction](#introduction)
- [Why Use NX, PNPM, and Poetry?](#why-use-nx-pnpm-and-poetry)
- [Getting Started](#getting-started)
- [Workspace Structure](#workspace-structure)
- [Key Features](#key-features)
- [Building and Testing](#building-and-testing)

## Introduction

This repository leverages NX, a powerful build system with first-class support for monorepos, alongside PNPM, a fast and disk space-efficient package manager for JavaScript, and Poetry, a dependency management and packaging tool for Python. This combination allows for an efficient, scalable, and maintainable mono-repo setup, enabling the development, building, and testing of multiple projects and libraries in a cohesive environment.

## Why Use NX, PNPM, and Poetry?

### NX

NX provides a robust set of tools and features that make it the ideal choice for managing a mono-repo, including:

- **Scalability**: Efficiently handles large codebases with multiple projects.
- **Code Sharing**: Easily share code between applications and libraries.
- **Dependency Graph**: Visualizes project dependencies for better understanding and management.
- **Advanced Caching**: Speeds up build and test processes with smart caching.

### PNPM

PNPM is a performant and efficient package manager that offers:

- **Speed**: Faster installs due to parallelization and reduced disk I/O.
- **Disk Space Efficiency**: Shares packages across projects, reducing disk space usage.
- **Strict Dependency Management**: Ensures a consistent dependency tree, reducing bugs and conflicts.

### Poetry

Poetry is a tool for dependency management and packaging in Python that provides:

- **Simplified Dependency Management**: Handles Python dependencies effectively.
- **Virtual Environment Management**: Manages virtual environments seamlessly.
- **Reproducible Builds**: Ensures consistent builds and environments.

## Getting Started

Follow these steps to set up your NX, PNPM, and Poetry mono-repo:

### Prerequisites

Ensure you have Node.js, PNPM, and Poetry installed. You can install PNPM and Poetry using the following commands:

```bash
npm install -g pnpm
pip install poetry
```

### Installation

1. **Clone the repo**:

   ```bash
    git clone https://github.com/AgiFlow/agiflow-sdks.git
    cd agiflow-sdks
   ```

2. **Install and build dependencies**:

   ```bash
   pnpm install
   ```

NOTE: poetry's commands are supported via `@nxlv/python`.  


## Workspace Structure

We are porting from our internal mono-repo to this open-source project, this is the strucure you will see in upcoming weeks:

```
my-workspace/
├── apps/
│   └── dashboard/
├── backend/
│   ├── apis/
│   ├── migrations/
├── packages/
│   ├── python/
│   │   └── agiflow-sdk
│   ├── frontend/
│   ├── backend/
│   ├── universal/
│   └── rigs/
├── tools/
├── nx.json
├── package.json
├── pnpm-workspace.yaml
├── pyproject.toml
└── tsconfig.base.json
```

- **apps/**: Contains application projects.
- **backend/**: Contains backend apis and migrations.
- **packages/**: Contains shared library projects.
- **tools/**: Contains custom tools and scripts.
- **nx.json**: NX workspace configuration.
- **package.json**: Dependency management configuration for JavaScript.
- **pnpm-workspace.yaml**: PNPM workspace configuration.
- **pyproject.toml**: Dependency management configuration for Python using Poetry.
- **tsconfig.base.json**: Base TypeScript configuration.

## Key Features

- **Code Sharing**: Share code easily between applications and libraries.
- **Dependency Graph**: Visualize and manage project dependencies.
- **Advanced Caching**: Speed up builds and tests with smart caching.
- **Integrated Development**: Develop multiple projects in a cohesive environment.

## Building and Testing

Use NX commands to build and test your JavaScript projects:

- **Build**:

  ```bash
  nx build my-app
  ```

- **Test**:

  ```bash
  nx test my-lib
  ```

For Python projects, use Poetry commands:

- **Install Dependencies**:

  ```bash
  nx run my-python-lib install
  ```

- **Run Tests**:

  ```bash
  nx run my-python-lib test
  ```
