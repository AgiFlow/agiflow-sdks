export const NODE_TYPES = {
  llmNode: 'llmNode',
  spanNode: 'spanNode',
  groupNode: 'default',
} as const;

export const NODE_SIZES = {
  [NODE_TYPES.llmNode]: {
    width: 300,
    height: 200,
  },
} as const;

export const NODE_HEIGHT = 210;
export const NODE_WIDTH = 260;
