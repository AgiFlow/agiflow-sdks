import * as React from 'react';
import { useMemo } from 'react';
import { cn } from '@/utils';

interface TimeBarProps {
  min: Date | undefined;
  max: Date | undefined;
  startedAt: string;
  endedAt: string;
}
export const TimeBar = ({ min, max, startedAt, endedAt }: TimeBarProps) => {
  const { start, end, tooLong, litleLong } = useMemo(() => {
    if (!min || !max) return {};
    const startAt = min.getTime();
    const endAt = max.getTime();
    const stepStartAt = new Date(startedAt || '').getTime();
    const stepEndAt = new Date(endedAt || '').getTime();
    const total = endAt - startAt;
    const start = ((stepStartAt - startAt) / total) * 100;
    const end = ((stepEndAt - stepStartAt) / total) * 100;
    const litleLong = stepEndAt - stepStartAt > 5000;
    const tooLong = stepEndAt - stepStartAt > 15000;
    return {
      start,
      end,
      tooLong,
      litleLong,
    };
  }, [min, max, startedAt, endedAt]);
  if (!start || !end) return null;
  return (
    <div className='relative h-2 w-full rounded-md bg-background-shade'>
      <div
        style={{
          left: `${start}%`,
          width: `${end > 100 ? 100 : end}%`,
        }}
        className={cn(
          'absolute h-2 rounded-md',
          tooLong ? 'bg-destructive' : litleLong ? 'bg-secondary' : 'bg-primary',
        )}
      />
    </div>
  );
};
