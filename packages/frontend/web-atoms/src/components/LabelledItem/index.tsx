import React, { useMemo, ReactNode } from 'react';
import { cn } from '../..';

export interface LabelledItemProps {
  label: string;
  value: any;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
}
export const LabelledItem = ({ label, value, leftSlot, rightSlot, children, className }: LabelledItemProps) => {
  const body = useMemo(() => {
    const parse = val => {
      try {
        const obj = JSON.parse(val);
        return parse(obj);
      } catch (err) {
        return val;
      }
    };
    const val = typeof value === 'object' ? value : parse(value);
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }
    return val;
  }, [value]);
  return (
    <div className='w-full'>
      <div className='my-2 inline-flex w-full items-end gap-2'>
        <div className='inline-flex flex-1 items-center gap-2'>
          <label className='text-sm font-bold underline'>{label}</label>
          {leftSlot}
        </div>
        {rightSlot}
      </div>
      <pre className={cn('w-full text-wrap break-all rounded-md bg-background-shade p-3 text-xs', className)}>
        {body}
      </pre>
      {children}
    </div>
  );
};
