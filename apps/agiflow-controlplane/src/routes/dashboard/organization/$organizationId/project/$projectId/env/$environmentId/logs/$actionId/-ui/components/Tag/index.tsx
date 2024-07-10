import { Badge } from '@agiflowai/frontend-web-ui';

interface TagProps {
  type: string | null;
}

export const Tag = ({ type }: TagProps) => {
  if (!type) return null;
  return (
    <Badge className='rounded-md capitalize' variant={'outline'}>
      {type || 'span'}
    </Badge>
  );
};
