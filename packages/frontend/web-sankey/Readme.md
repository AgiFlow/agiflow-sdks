# @agiflowai/frontend-web-sankey

This package includes [AGIFlow's](https://agiflow.io) React **Sankey graph** component. This is a ported from [Nivo's Sankey](https://www.npmjs.com/package/@nivo/sankey) to support circular links.  

## Installation

Install the package using npm or yarn:

```bash
npm install @agiflowai/frontend-web-sankey
```

## Usage

``` js
import { ResponsiveSankey } from '@agiflowai/frontend-web-sankey';

...
<ResponsiveSankey
  data={data}
/>
```

The component interface is similar to original [Nivo's implementation](https://nivo.rocks/sankey/).

## License

This package is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
