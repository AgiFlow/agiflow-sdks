import { join } from 'path';
import copy from 'rollup-plugin-copy';
import { getConfig } from '@agiflowai/rig-rollup-config/configs/reactPackage';

const plugins = [
  copy({
    targets: [
      { src: 'src/css/tailwind.scss', dest: 'dist', rename: 'tailwind.scss' },
      { src: 'src/css/tailwind.scss', dest: 'dist', rename: 'tailwind.css' },
    ],
  }),
];

export default getConfig({
  input: {
    index: 'src/index.ts',
    tailwind: 'src/tailwind.ts',
  },
  preserveModules: true,
  tsconfig: join(__dirname, 'tsconfig.json'),
  plugins,
  extraFormats: ['cjs'],
});
