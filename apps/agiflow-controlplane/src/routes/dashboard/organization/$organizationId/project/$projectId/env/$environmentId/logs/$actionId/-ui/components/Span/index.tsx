import { Badge } from '@agiflowai/frontend-web-ui';
import { ComponentInstanceIcon, ComponentBooleanIcon, ComponentPlaceholderIcon } from '@radix-ui/react-icons';

interface SpanProps {
  kind?: string | null;
}

export const Span = ({ kind }: SpanProps) => {
  if (kind === 'SpanKind.INTERNAL' || kind === 'workflow') {
    return (
      <Badge className='size-7 rounded-md p-1' variant={'shade'}>
        <ComponentBooleanIcon />
      </Badge>
    );
  }

  if (kind === 'SpanKind.CLIENT') {
    return (
      <Badge className='size-7 rounded-md p-1' variant={'shade'}>
        <ComponentInstanceIcon />
      </Badge>
    );
  }

  return (
    <Badge className='size-7 rounded-md p-1' variant={'shade'}>
      <ComponentPlaceholderIcon />
    </Badge>
  );
};
