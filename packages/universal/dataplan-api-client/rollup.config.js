import { getConfig } from '@agiflowai/rig-rollup-config/configs/reactPackage';

export default getConfig({
  input: {
    index: './src/index.ts',
  },
  preserveModules: false,
  extraFormats: ['cjs'],
});
