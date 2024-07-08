import * as React from 'react';
import { cn, Label } from '@agiflowai/frontend-web-atoms';
import * as LabelPrimitive from '@radix-ui/react-label';
import { useFormField } from '../../hooks/useFormField';

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';
