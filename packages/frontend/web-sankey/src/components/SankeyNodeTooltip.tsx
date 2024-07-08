import React from 'react';
import { Chip } from '@nivo/tooltip';
import { DefaultLink, DefaultNode, SankeyNodeDatum } from '../types';

export interface SankeyNodeTooltipProps<N extends DefaultNode, L extends DefaultLink> {
  node: SankeyNodeDatum<N, L>;
}

export const SankeyNodeTooltip = <N extends DefaultNode, L extends DefaultLink>({
  node,
}: SankeyNodeTooltipProps<N, L>) => {
  return (
    <div className='inline-flex items-center gap-2 rounded-md bg-background p-3'>
      <Chip color={node.color} />
      <strong className='text-sm'>
        {node.label} ({node.value})
      </strong>
    </div>
  );
};
