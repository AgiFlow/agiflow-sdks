# @agiflowai/frontend-web-atoms

This package includes [AGIFlow's](https://agiflow.io) atomic React components.

## Features

- **Shadcn/ui ready to use components**
- **Custom Components**

## Installation

Install the package using npm or yarn:

```bash
npm install @agiflowai/frontend-web-atoms
```

## Usage

### Shadcn/ui components
For **shadcn/ui**'s components, please visit [Shadcn's](https://ui.shadcn.com/docs/components/accordion).

### Custom components

#### Browser
Emulate Safari browser's look:   

``` tsx
import { Browser } from '@agiflowai/frontend-web-atoms';

...
<Browser>
  ...
</Browser>
```

#### IdPortal
Render component inside portal by id:   

``` tsx
import { IdPortal } from '@agiflowai/frontend-web-atoms';

...
<IdPortal id={"<DOM_ID>"}>
  ...
</IdProtal>
```

#### TextDiff
Render and show difference between two texts:   

``` tsx
import { TextDiff } from '@agiflowai/frontend-web-atoms';

...
<TextDiff prev={"..."} cur={"..."} />
```

#### TimeBar
Render time progress:   

``` tsx
import { TimeBar } from '@agiflowai/frontend-web-atoms';

...
<TimeBar min={...} max={...} startedAt="..." endedAt="..." />
```

## License

This package is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
