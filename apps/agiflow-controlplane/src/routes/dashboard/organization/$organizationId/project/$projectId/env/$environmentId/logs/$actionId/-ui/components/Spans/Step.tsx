import { useMemo } from 'react';
import { cn, TimeBar, Level } from '@agiflowai/frontend-web-ui';
import dayjs from 'dayjs';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Step } from '../../queries';
import { PLUGIN_CATEGORIES } from '../../constants';
import { SearchSchema } from '../../validators';
import { Span } from '../Span';

interface StepCompProps {
  step: Step;
  level: number;
  min: Date | undefined;
  max: Date | undefined;
}

export const StepComp = ({ step, min, max, level }: StepCompProps) => {
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId',
  });
  const stepId = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId/',
    select: search => SearchSchema.parse(search).stepId,
  });
  const issues = useMemo(() => {
    return (step?.evaluations || []).filter(x => x.is_problematic);
  }, [step]);
  return (
    <div
      className={cn(
        'w-full cursor-pointer rounded-md p-2 pb-2 transition-all transition-all hover:bg-background-shade',
        stepId === step.id ? 'border-[1px] border-primary' : undefined,
      )}
      onClick={() => navigate({ search: { stepId: step.id } })}
    >
      <div className='mb-2 inline-flex w-full items-center justify-start gap-2'>
        <Level level={level} />
        <Span kind={step.kind} />
        <p className='flex-1 overflow-hidden text-ellipsis text-start'>
          <span className={cn('w-full text-ellipsis text-sm font-bold')}>{step.name}</span>
          &nbsp;
        </p>
        {step.error_description ? <div className='size-3 rounded-full bg-error' /> : null}
        <span className='text-2xs'>{dayjs(step.ended_at).diff(dayjs(step.started_at))}ms</span>
      </div>
      <TimeBar min={min} max={max} startedAt={step.started_at || ''} endedAt={step.ended_at || ''} />
      {issues.length ? (
        <p className='text-xs'>
          <b>Issues:&nbsp;</b>
          {issues.map(evaluation => (
            <span key={evaluation.id}>{PLUGIN_CATEGORIES[evaluation.category as any]}&nbsp;</span>
          ))}
        </p>
      ) : null}
    </div>
  );
};
