import { Link } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { Button, Collapsible, CollapsibleTrigger, CollapsibleContent } from '@agiflowai/frontend-web-ui';
import { Link2Icon } from '@radix-ui/react-icons';
import { IAction } from '../../queries';
import { StepComp } from './Step';

interface WorkflowProps {
  action?: IAction;
  stepId?: string | null;
  filter: { feedback?: boolean; error?: boolean; category?: null | number };
}
export const Action = ({ action, filter, stepId }: WorkflowProps) => {
  const [isOpen, setOpen] = useState(false);
  useEffect(() => {
    setOpen((action?.steps || []).findIndex(step => step.id === stepId) > -1);
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        const element = document.getElementById(`action-step-${stepId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
      }, 100);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  const steps = useMemo(() => {
    const list = (action?.steps || []).filter(step => !!step.is_llm);
    if (!filter.error && !filter.feedback) return list;
    if (filter.feedback) {
      return list.filter(step => step?.correction || step?.score);
    }
    if (!filter.error) return list;
    if (filter?.category) {
      return list.filter(
        step => step.evaluations.findIndex(x => x.is_problematic && x.category === filter.category) > -1,
      );
    }
    return list.filter(step => step.evaluations.findIndex(x => x.is_problematic) > -1);
  }, [action?.steps, filter]);
  return (
    <Collapsible open={isOpen} onOpenChange={() => setOpen(!isOpen)}>
      <CollapsibleTrigger className='w-full text-left'>
        <div className='mb-3 w-full cursor-pointer rounded-md bg-background-shade p-3 pb-2 transition-all'>
          <div className='inline-flex w-full items-center'>
            <div className='flex-1'>
              <h6 className='flex-1'>TRACE</h6>
              <p className='text-xs'>{action?.id}</p>
            </div>
            <Link
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId'
              params={{
                actionId: action?.id || '',
              }}
            >
              <Button variant={'ghost'}>
                <Link2Icon />
              </Button>
            </Link>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className='w-full'>
        <div className='max-h-[50vh] w-full overflow-y-auto'>
          {steps.map(step => (
            <StepComp step={step} stepId={stepId} key={step.id} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
