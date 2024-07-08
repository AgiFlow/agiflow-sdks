import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/utils';
import { abbr } from './helpers';

export type AvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & { name?: string };
export const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, AvatarFallbackProps>(
  ({ className, name, children, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
      {...props}
    >
      {name ? abbr(name).toUpperCase() : children}
    </AvatarPrimitive.Fallback>
  ),
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
