# @agiflowai/universal-analytics-client

Welcome to the **@agiflowai/universal-analytics-client** package! This package is designed to automatically generate a TypeScript client based on your OpenAPI specification, simplifying the process of interacting with your API.

## Features

- **Automatic Generation**: Generate TypeScript clients directly from your OpenAPI spec.
- **Type Safety**: Ensure type safety with TypeScript definitions.
- **Easy Integration**: Seamlessly integrate with your existing projects.
- **Customizable**: Customize the generated client to fit your specific needs.

## Installation

Install the package using npm or yarn:

```bash
npm install @agiflowai/universal-analytics-client
```

or

```bash
yarn add @agiflowai/universal-analytics-client
```

## Usage with openapi-fetch

1. Install **openapi-fetch** dependency  

```bash
yarn add openapi-fetch
```

2. Create client:  

```typescript
import createClient from 'openapi-fetch';
import { paths } from '@agiflowai/universal-analytics-client';

const client = createClient<paths>({
  baseUrl: process.env.BASE_URL,
  fetch,
});
```

3. Use the client:  

``` typescript
const res = await client.GET('...') // type inferred
```

## Contributing

Contributions are welcome! If you have any suggestions or improvements, please create a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
