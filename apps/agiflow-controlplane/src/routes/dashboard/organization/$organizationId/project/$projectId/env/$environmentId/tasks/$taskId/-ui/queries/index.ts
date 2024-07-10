import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type ITask =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/{taskId}']['get']['responses']['200']['content']['application/json'];
export type IAction = NonNullable<ITask['actions'][0]>;
export type IStep = NonNullable<IAction['steps'][0]>;

export const taskQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/{taskId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`task-${params.path.taskId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/{taskId}',
        {
          params: {
            path: {
              ...params.path,
            },
          },
        },
      ),
  });
