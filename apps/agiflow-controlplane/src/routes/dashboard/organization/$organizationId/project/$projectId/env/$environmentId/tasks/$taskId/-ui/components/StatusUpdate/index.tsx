import {
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { apiClient } from '@/libs';
import { TASK_STATUSES, TASK_STATUS_NAMES, TASK_VARIANTS } from '../../constants';

const options = [
  {
    label: 'Required Input',
    value: TASK_STATUSES.PROBLEMATIC,
  },
  {
    label: 'In Review',
    value: TASK_STATUSES.REVIEW,
  },
  {
    label: 'Completed',
    value: TASK_STATUSES.FIXED,
  },
];

interface StatusUpdateProps {
  status: number;
}
export const StatusUpdate = ({ status }: StatusUpdateProps) => {
  const queryClient = useQueryClient();
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId/',
  });
  const mutate = useMutation({
    mutationFn: (status: number) => {
      return apiClient.PATCH(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/{taskId}',
        {
          params: {
            path: params,
          },
          body: {
            status,
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`task-${params.taskId}`],
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge variant={TASK_VARIANTS[status]}>{TASK_STATUS_NAMES[status]}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options
          .filter(x => x.value !== status)
          .map(option => (
            <DropdownMenuItem key={option.label} onClick={() => mutate.mutate(option.value)}>
              {option.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
