import React, { ComponentType } from 'react';

type HTMLDivProps = { children?: any; className?: string };
type MenuItemProps<T extends HTMLDivProps> = T & {
  Icon: ComponentType<any>;
  text: string;
};

export const createMenuItem = <T extends HTMLDivProps>(Comp, opts?: Partial<T>) => {
  const MenuItem = ({ Icon, text, ...props }: MenuItemProps<T>) => {
    return (
      <Comp
        className='inline-flex items-center gap-2 rounded-md p-3 text-text transition-all hover:bg-background'
        {...(opts || {})}
        {...(props as unknown as T)}
      >
        <>
          <Icon className='icon-md' />
          <span className='text-sm font-bold'>{text}</span>
        </>
      </Comp>
    );
  };
  MenuItem.displayName = 'MenuItem';
  return MenuItem;
};
