import React from 'react';
import { Chip } from '@nivo/tooltip';
import { DefaultLink, DefaultNode, SankeyLinkDatum } from '../types';

export interface SankeyLinkTooltipProps<N extends DefaultNode, L extends DefaultLink> {
  link: SankeyLinkDatum<N, L>;
}

export const SankeyLinkTooltip = <N extends DefaultNode, L extends DefaultLink>({
  link,
}: SankeyLinkTooltipProps<N, L>) => (
  <div className='inline-flex items-center gap-2 rounded-md bg-background p-3 text-sm'>
    <Chip color={link.source.color} />
    <strong>{link.source.label}</strong>
    {' > '}
    <strong>{link.target.label}</strong>
    <Chip color={link.target.color} />
    <strong>
      ({link.formattedValue}
      {link.circular ? ' - circular' : ''})
    </strong>
  </div>
);
