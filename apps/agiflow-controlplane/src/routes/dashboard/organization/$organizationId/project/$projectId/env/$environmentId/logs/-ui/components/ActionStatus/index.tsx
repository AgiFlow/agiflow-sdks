import { Badge } from '@agiflowai/frontend-web-ui';

const STATUSES = {
  1: 'Good',
  2: 'Bad',
  4: 'Evaluating',
};

const VARIANTS = {
  1: 'default',
  2: 'destructive',
  4: 'secondary',
};

export const ActionStatus = ({ status }: { status: number }) => (
  <Badge key={status} variant={VARIANTS[status]} className='capitalize'>
    {STATUSES[status || 1]}
  </Badge>
);
