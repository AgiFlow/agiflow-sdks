import React, { ReactNode } from 'react';
import { cn } from '../../utils';

interface BrowserProps {
  children?: ReactNode;
  className?: string;
}

export const Browser = ({ children, className }: BrowserProps) => {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-[4px]', className)}>
      <div className='inline-flex h-5 w-full items-center gap-1 bg-mono-3xlight px-1'>
        <div className='inline-flex h-2 w-2 rounded-full bg-error' />
        <div className='inline-flex h-2 w-2 rounded-full bg-alert' />
        <div className='inline-flex h-2 w-2 rounded-full bg-success' />
      </div>
      {children}
    </div>
  );
};
