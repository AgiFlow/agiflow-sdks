import { useMemo, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sheet,
  SheetContent,
} from '@agiflowai/frontend-web-ui';
import { useSetAtom, useAtom } from 'jotai';
import dayjs from 'dayjs';
import { buildStepsWorkflow } from '@/utils/workflow';
import { LayersIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Action } from '../../queries';
import { StepComp } from './Step';
import { Filter } from '../Filter';
import { workflowViewAtom, filterAtom } from '../../states';

interface SpansProps {
  action?: Action;
  topSlot?: ReactNode;
}
export const Spans = ({ action, topSlot }: SpansProps) => {
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const setViewWorkflow = useSetAtom(workflowViewAtom);
  const [filter] = useAtom(filterAtom);
  const { workflows, min, max } = useMemo(() => buildStepsWorkflow(action?.steps || []), [action]);
  const stepNames = useMemo(() => {
    return Array.from(new Set((action?.steps || []).map(step => step.name))) as string[];
  }, [action?.steps]);
  const renderWorkflow = useCallback(
    (workflow, level = 0) => {
      const endDateTime = new Date(workflow.step.ended_at || '').getTime();
      const startDateTime = new Date(workflow.step.started_at || '').getTime();
      const timespan = endDateTime - startDateTime;
      if (!workflow.children?.length) {
        if (filter?.min && filter.min > timespan) return null;
        if (filter.spanNames.includes(workflow.step.name)) return null;
        return <StepComp step={workflow.step} min={min} max={max} level={level} />;
      }
      let defaultOpen = level === 0 || timespan > (filter?.min || 0);
      if (filter.spanNames.includes(workflow.step.name)) {
        defaultOpen = false;
      }
      return (
        <Collapsible defaultOpen={defaultOpen} className='w-full' open={!filter?.min || undefined}>
          <CollapsibleTrigger className='w-full'>
            <StepComp step={workflow.step} min={min} max={max} level={level} />
          </CollapsibleTrigger>
          <CollapsibleContent className='w-full'>
            <div>{workflow.children.map(workflow => renderWorkflow(workflow, level + 1))}</div>
          </CollapsibleContent>
        </Collapsible>
      );
    },
    [filter, max, min],
  );
  return (
    <div className='w-full'>
      {min || max ? (
        <div className='mb-3 w-full cursor-pointer rounded-md bg-background-shade p-3 pb-2'>
          <div className='inline-flex w-full items-center' onClick={() => navigate({})}>
            <h6 className='flex-1'>TRACE</h6>
            <span className='text-2xs font-bold'>{dayjs(max).diff(dayjs(min))}ms</span>
          </div>
          <p className='flex-1 text-xs'>
            {dayjs(min).format('DD/MM/YYYY')} {dayjs(min).format('HH:mm:ss.SSS')} - {dayjs(max).format('HH:mm:ss.SSS')}
          </p>
          <div className='inline-flex w-full justify-end gap-2 pt-2'>
            {topSlot}
            <Button
              variant={'ghost'}
              size='sm'
              className='h-8 gap-1 p-1 text-2xs'
              onClick={() => setViewWorkflow(true)}
            >
              <LayersIcon className='icon-sm' /> Workflow Viz
            </Button>
            <Button size='sm' className='h-8 gap-1 p-1 text-2xs' variant={'ghost'} onClick={() => setFilterOpen(true)}>
              <MixerHorizontalIcon className='icon-sm' /> Filter
            </Button>
          </div>
        </div>
      ) : null}
      <div key={JSON.stringify(filter)} className='max-h-[60vh] w-full overflow-y-auto'>
        {workflows.map(workflow => renderWorkflow(workflow, 0))}
      </div>
      <Sheet open={!!filterOpen} onOpenChange={() => setFilterOpen(false)}>
        <SheetContent>
          {filterOpen ? <Filter spanNames={stepNames} onClose={() => setFilterOpen(false)} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
};
