import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Input, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@agiflowai/frontend-web-ui';
import dayjs from 'dayjs';
import { buildStepsWorkflow } from '@/utils/workflow';
import { Action } from '../../queries';
import { StepComp } from './Step';

interface SpansProps {
  action?: Action;
}
export const Spans = ({ action }: SpansProps) => {
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId',
  });
  const [minSpan, setMinSpan] = useState(0);
  const { workflows, min, max } = useMemo(() => buildStepsWorkflow(action?.steps || []), [action]);
  const renderWorkflow = useCallback(
    (workflow, level = 0) => {
      const endDateTime = new Date(workflow.step.ended_at || '').getTime();
      const startDateTime = new Date(workflow.step.started_at || '').getTime();
      const timespan = endDateTime - startDateTime;
      if (!workflow.children?.length) {
        return <StepComp step={workflow.step} min={min} max={max} level={level} />;
      }
      return (
        <Collapsible defaultOpen={level === 0 || timespan > minSpan} className='w-full' open={!minSpan || undefined}>
          <CollapsibleTrigger className='w-full'>
            <StepComp step={workflow.step} min={min} max={max} level={level} />
          </CollapsibleTrigger>
          <CollapsibleContent className='w-full'>
            <div>{workflow.children.map(workflow => renderWorkflow(workflow, level + 1))}</div>
          </CollapsibleContent>
        </Collapsible>
      );
    },
    [minSpan, max, min],
  );
  return (
    <div className='w-full'>
      {min || max ? (
        <div
          className='mb-3 w-full cursor-pointer rounded-md bg-background-shade p-3 pb-2'
          onClick={() => navigate({})}
        >
          <div className='inline-flex w-full items-center'>
            <h6 className='flex-1'>TRACE</h6>
            <span className='text-2xs font-bold'>{dayjs(max).diff(dayjs(min))}ms</span>
          </div>
          <p className='flex-1 text-xs'>
            {dayjs(min).format('DD/MM/YYYY')} {dayjs(min).format('HH:mm:ss.SSS')} - {dayjs(max).format('HH:mm:ss.SSS')}
          </p>
          <div className='inline-flex'>
            <label className='text-2xs'>Show long-running span by milliseconds</label>
            <Input
              value={minSpan}
              onChange={e => setMinSpan(Number(e.target.value))}
              placeholder='Min milliseconds'
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
      <div key={minSpan} className='max-h-[60vh] w-full overflow-y-auto'>
        {workflows.map(workflow => renderWorkflow(workflow, 0))}
      </div>
    </div>
  );
};
