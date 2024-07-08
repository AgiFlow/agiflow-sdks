'use client';

import React from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { Button, ButtonProps, cn } from '@agiflowai/frontend-web-atoms';
import { ClipboardCopyIcon, ClipboardIcon } from '@radix-ui/react-icons';

export interface ClipboardButtonProps extends Omit<ButtonProps, 'onClick'> {
  text: string;
  textClassName?: string;
}
export const ClipBoardButton = ({ text, textClassName, children, ...props }: ClipboardButtonProps) => {
  const [copied, copy] = useCopyToClipboard();
  return (
    <Button onClick={() => copy(text || '')} {...props}>
      {children}
      <div className='max-w-[80%] flex-1 pr-2'>
        <p className={cn('w-full text-wrap break-words text-sm', textClassName)}>{text}</p>
      </div>
      {copied ? <ClipboardCopyIcon className='icon-md' /> : <ClipboardIcon className='icon-md' />}
    </Button>
  );
};
