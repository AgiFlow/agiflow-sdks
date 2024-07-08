import { getConfig } from '@agiflowai/rig-rollup-config/configs/reactPackage';

const getConfigs = () => {
  return [
    ...getConfig({
      input: {
        index: './src/index.ts',
      },
      preserveModules: true,
      extraFormats: ['cjs'],
    }),
  ];
};

export default getConfigs();
