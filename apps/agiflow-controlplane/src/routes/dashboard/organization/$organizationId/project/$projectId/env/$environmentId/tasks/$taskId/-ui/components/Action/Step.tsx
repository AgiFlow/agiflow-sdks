import { useMemo } from 'react';
import { cn, Badge } from '@agiflowai/frontend-web-ui';
import dayjs from 'dayjs';
import { useNavigate } from '@tanstack/react-router';
import { CheckIcon } from '@radix-ui/react-icons';
import { PLUGIN_CATEGORY_NAMES } from '@/constants/plugin';
import { IStep } from '../../queries';
import { Span } from '../../../../../logs/$actionId/-ui/components/Span';

interface StepCompProps {
  step: IStep;
  stepId?: string | null;
}

export const StepComp = ({ step, stepId }: StepCompProps) => {
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId',
  });
  const issues = useMemo(() => {
    return (step?.evaluations || []).filter(x => x.is_problematic);
  }, [step]);
  return (
    <div
      className={cn(
        'w-full cursor-pointer rounded-md p-2 pb-2 transition-all hover:bg-background-shade',
        stepId === step.id ? 'border-[1px] border-primary' : undefined,
      )}
      id={`action-step-${step.id}`}
      onClick={() => navigate({ search: { stepId: step.id } })}
    >
      <div className='inline-flex w-full items-center justify-start gap-2'>
        <Span kind={step.kind} />
        <p className='flex-1 overflow-hidden text-ellipsis text-start'>
          <span className={cn('w-full text-ellipsis text-sm font-bold')}>{step.name}</span>
          &nbsp;
        </p>
        <span className='text-2xs'>{dayjs(step.ended_at).diff(dayjs(step.started_at))}ms</span>
      </div>
      <div className='inline-flex w-full items-center'>
        <p className='mb-2 flex-1 text-3xs'>{step.id}</p>
        {step?.correction || step?.score || (step?.score as unknown) === 0 ? (
          <div>
            <CheckIcon className='text-primary' />
          </div>
        ) : null}
      </div>
      {issues.length ? (
        <div className='inline-flex w-full flex-wrap items-center gap-2 text-xs'>
          <b>Issues:&nbsp;</b>
          {issues.map(evaluation => (
            <Badge variant='destructive' key={evaluation.id}>
              {PLUGIN_CATEGORY_NAMES[evaluation.category as any]}&nbsp;
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
};
