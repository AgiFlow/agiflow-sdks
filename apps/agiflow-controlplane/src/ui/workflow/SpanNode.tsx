import { Badge, TimeBar, cn } from '@agiflowai/frontend-web-ui';
import { Handle, Position } from 'reactflow';
import { EvalStep } from './types';
import { ReactNode } from 'react';

export interface ISpanNodeProps {
  data: EvalStep;
  selected?: boolean;
  children?: ReactNode;
}
export const SpanNode = ({ data, selected, children }: ISpanNodeProps) => {
  const meta = data?.meta as any;
  return (
    <>
      <Handle type='target' position={Position.Left} />
      <div
        className={cn(
          'flex h-[210px] w-[260px] flex-col gap-2 rounded-md bg-background p-2',
          selected ? 'border-[2px] border-primary' : 'border-[1px] border-border',
        )}
      >
        <div className='flex flex-1 flex-col gap-3'>
          <h6 className='w-full break-all font-bold'>{data.name}</h6>
          {meta?.description ? <p className='line-clamp-2 w-full text-xs'>{meta.description}</p> : null}
          {data.kind ? (
            <div className='inline-flex flex-wrap gap-2'>
              <Badge variant='outline'>Kind: {data.kind}</Badge>
            </div>
          ) : null}
        </div>
        <div className='inline-flex w-full items-end'>
          <div className='flex-1'>
            {data.started_at && data?.ended_at ? (
              <TimeBar
                min={new Date(data.min)}
                max={new Date(data.max)}
                startedAt={data.started_at}
                endedAt={data.ended_at}
              />
            ) : null}
          </div>
          {children}
        </div>
      </div>
      <Handle type='source' position={Position.Right} />
    </>
  );
};
