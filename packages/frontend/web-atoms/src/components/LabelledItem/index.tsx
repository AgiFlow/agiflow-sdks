import React, { useMemo, ReactNode } from 'react';
import { cn } from '../..';

export interface LabelledItemProps {
  label: string;
  value?: any;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
}
export const LabelledItem = ({ label, value, leftSlot, rightSlot, children, className }: LabelledItemProps) => {
  const body = useMemo(() => {
    if (!value) return null;
    const parse = val => {
      try {
        const obj = JSON.parse(val);
        return parse(obj);
      } catch (err) {
        return val;
      }
    };
    const val = typeof value === 'object' ? value : parse(value);
    return val;
  }, [value]);

  const renderObj = (obj, level = 0) => {
    if (!obj) return null;
    if (typeof obj !== 'object') {
      return (
        <div className={cn(level > 0 ? 'pl-3' : 'p-3')}>
          <pre className={cn('w-full text-wrap break-all rounded-md bg-background-shade text-xs', className)}>
            {obj}
          </pre>
        </div>
      );
    }
    if (Array.isArray(obj)) {
      return (
        <div
          className={cn('flex w-full flex-col gap-2 rounded-md bg-background-shade', level === 0 ? 'p-3' : undefined)}
        >
          {obj.map(value =>
            value ? (
              <div className={cn('inline-flex w-full gap-1', level > 0 ? 'pl-3' : undefined)}>
                {renderObj(value, level + 1)}
              </div>
            ) : null,
          )}
        </div>
      );
    }
    return (
      <div className={cn('flex w-full flex-col gap-2 rounded-md bg-background-shade', level === 0 ? 'p-3' : undefined)}>
        {Object.entries(obj).map(([key, value]: any[]) =>
          value ? (
            <div className={cn('flex w-full flex-col gap-1', level > 0 ? 'pl-3' : undefined)}>
              <label className='text-xs font-bold text-mono-light'># {key}</label>
              {renderObj(value, level + 1)}
            </div>
          ) : null,
        )}
      </div>
    );
  };

  return (
    <div className='w-full'>
      <div className='my-2 inline-flex w-full items-end gap-2'>
        <div className='inline-flex flex-1 items-center gap-2'>
          <label className='text-sm font-bold underline'>{label}</label>
          {leftSlot}
        </div>
        {rightSlot}
      </div>
      {body ? (
        <>
          {typeof body === 'object' ? (
            renderObj(body, 0)
          ) : (
            <pre className={cn('w-full text-wrap break-all rounded-md bg-background-shade p-3 text-xs', className)}>
              {body}
            </pre>
          )}
        </>
      ) : null}
      {children}
    </div>
  );
};
