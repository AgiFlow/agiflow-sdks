import { Badge } from '@agiflowai/frontend-web-ui';
import { TASK_STATUS_NAMES, TASK_VARIANTS } from '../../../$taskId/-ui/constants';

interface TaskStatusProps {
  status: number;
}
export const TaskStatus = ({ status }: TaskStatusProps) => {
  return <Badge variant={TASK_VARIANTS[status]}>{TASK_STATUS_NAMES[status]}</Badge>;
};
