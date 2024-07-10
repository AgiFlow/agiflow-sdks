# ControlPlane Dashboard 

Built with React, Vitejs, React-Query for easy deployment; this provide [AGIFlow's ControlPlane dashboard](https://app.agiflow.io) which includes observability metrics, models & prompts registries, and dataset management.  

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## Introduction

ControlPlane Dashboard is a web application built using React, [Vite](https://vitejs.dev/guide/), and React-Query. This project serves as a robust control panel to manage various aspects of LLM-ops for your organization. 

The choice to use React Single-Page Application (SPA) with Vitejs and [@tanstack/react-query](https://tanstack.com/query/latest/docs/framework/react/overview) and [@tanstack/react-router](https://tanstack.com/router/latest/docs/framework/react/installation) ensures a fast, reliable, and scalable solution that is agnostic to backend technology choices.

## Features

- **Fast Development**: Leverages Vite for a blazing-fast development environment.
- **Data Fetching**: Uses React-Query for efficient and easy server state management.
- **State Management**: Uses Jotai for small global state management footprint.
- **Routing**: Uses @tanstack/react-router with file-based and typesafe routing.
- **Components**: Built with React & Tailwind to ensuring a modular and maintainable codebase.
- **Hot Module Replacement**: Instant updates in the browser as you edit your code.
- **Optimized Production Build**: Generates optimized code for production deployment.

## Prerequisites

Ensure you have the following installed on your development machine:

- Node.js (v18 or higher)
- [pnpm](https://pnpm.io/installation) (v8 or higher)

## Getting Started

1. **Clone the Repository**

```bash
git clone https://github.com/AgiFlow/agiflow-sdks
cd agiflow-sdks
```

2. **Install Dependencies**

Using pnpm:
```bash
pnpm install
```

3. **Install Dependencies**

Configure app settings

```bash
cp .env.example .env.local
```

Then configure liked below to run without Supabase auth:  

``` sh
VITE_DEV_MODE=true
VITE_DATAPLANE_API_ENDPOINT=http://localhost:3000/api/dataplane
VITE_CONTROLPLANE_API_ENDPOINT=http://localhost:3000/api/controlplane
VITE_CONTROLPLANE_DASHBOARD_URL=https://localhost:3001
VITE_SUPABASE_ENDPOINT=anon
VITE_SUPABASE_ANON_KEY=anon
```

4. **Run the backend**

Run docker-compose dev, which includes backend accessible on port 3000.
NOTE: you will need to configure core depending on your frontend port:   

```docker
  agiflow-app:
    ...
    environment:
      - CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```
Then run:

```bash
cd dockers/dev
docker-compose up
```

5. **Run ControlPlane Dashboard's Development Server**

Using yarn:
```bash
nx run agiflow-controlplane:dev
```

The application will be accessible at `http://localhost:3001`.

## Project Structure

```bash
controlplane/
├── public/                           # Static assets
├── src/
│   ├── ui/                           # Reusable app specific components
│   ├── assets/                       # App assets
│   ├── constants/                    # Shared constants
│   ├── libs/                         # Reusable libraries with configs
│   ├── utils/                        # Reusable business logic codes
│   ├── routes/                       # File-based routing with @tanstack/react-router
│   │   ├── index.tsx                 # Route entry
│   │   ├── dashboard/                # Route segment
│   │   │   ├── index[.lazy].tsx/     # Route segment entry
│   │   │   └── -ui/                  # Collocate ui components, states, logic 
│   ├── App.scss                      # Global css
│   ├── main.tsx                      # Main application component
│   ├── routeTree.gen.ts              # Generated route config
├── .gitignore                        # Git ignore rules
├── package.json                      # Project metadata and scripts
├── vite.config.js                    # Vite configuration
└── README.md                         # Project documentation
```

The project use route collocation to organise shared components, states, data fetching, etc... in side route segment `-ui` folder. This make finding relevant codes easier.

## Scripts

- **`dev`**: Starts the development server.
- **`build`**: Builds the project for production.
- **`fixcode`**: Lints and formats the codebase using ESLint.
- **`typecheck`**: Typechecking with typescript.

## Configuration

### Vite Configuration

The Vite configuration file (`vite.config.js`) includes settings for plugins, build options, and more. Customize it as per your requirements.

## Usage

### Creating Components, hooks, atomic state

Add your components inside route segments `-ui` directory. Each component should be in its own folder with relevant styles.

### Adding Pages

Pages are located in the `src/routes/` directory following [@tanstack/react-router file-based router](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing) documentation.

## API Integration

### Setting Up queries

The **api client** is automatically generated based on OpenAPI spec and is configured under `src/libs/api`. We simply need to create a `queryOptions` to use this api client with caching.  

### Using React-Query

Use the `useQuery` and `useMutation` hooks from React-Query to fetch and mutate data. Example usage:

```tsx
import { useParams } from '@tanstack/react-router;
import { useQuery } from '@tanstack/react-query';
import { promptsQueryOption } from './-ui/queries;

const MyComponent = () => {
  const params = useParams(...);
  const { data, isLoading } = useQuery(promptsQueryOption({ path: params }));

  if (isLoading) return <p>Loading...</p>;
  if (data?.error) return <p>Error: {error.message}</p>;

  return <div>{JSON.stringify(data)}</div>;
};
```

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](../../CONTRIBUTING.md) guide for details on the code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the Business Source License. See the [LICENSE](../../LICENSE) file for details.

---

Feel free to reach out if you have any questions or need further assistance. Happy coding!

---
