import { Badge, TimeBar, cn } from '@agiflowai/frontend-web-ui';
import { Handle, Position } from 'reactflow';
import { PLUGIN_CATEGORY_NAMES } from '@/constants/plugin';
import { EvalStep } from './types';
import { ReactNode } from 'react';

export interface ILLMNodeProps {
  data: EvalStep;
  selected?: boolean;
  children?: ReactNode;
}
export const LLMNode = ({ children, data, selected }: ILLMNodeProps) => {
  const meta = data?.meta as any;
  return (
    <>
      <Handle type='target' position={Position.Left} />
      <div
        className={cn(
          'flex h-[200px] w-[300px] flex-col gap-2 rounded-md bg-background p-2',
          selected ? 'border-[3px] border-primary' : 'border-[1px] border-secondary',
        )}
      >
        <div className='flex flex-1 flex-col gap-3'>
          <h6 className='w-full break-all font-bold'>{data.name}</h6>
          {meta?.description ? <p className='line-clamp-2 w-full text-xs'>{meta.description}</p> : null}
          <div className='inline-flex flex-wrap gap-2'>
            {data.type ? <Badge variant='outline'>Type: {data.type}</Badge> : null}
            <Badge variant='outline'>Model: {data.model}</Badge>
            {data.prompt_version ? <Badge variant='outline'>Version: {data.prompt_version}</Badge> : null}
          </div>
        </div>
        {data?.evaluations?.length ? (
          <div className='inline-flex flex-wrap gap-2'>
            {(data.evaluations || []).map(issue => (
              <Badge variant={issue.bad_count ? 'destructive' : 'inverted'} key={issue.category}>
                {PLUGIN_CATEGORY_NAMES[issue.category as number]}: {issue.bad_count || issue.good_count}
              </Badge>
            ))}
          </div>
        ) : null}
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
