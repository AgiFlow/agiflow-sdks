import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export const tasksQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks']['get']['parameters'],
  statuses: number[],
) =>
  queryOptions({
    queryKey: [
      `tasks-${params.path.environmentId}-${params.query?.limit}-${params.query?.page}-${JSON.stringify(statuses).replace(' ', '-')}`,
    ],
    queryFn: async () => {
      try {
        return await apiClient.GET(
          '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks',
          {
            params: {
              path: params.path,
              query: {
                ...(params.query || {}),
                statuses,
              },
            },
          },
        );
      } catch (_) {
        return;
      }
    },
  });

export const taskCountQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/count']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`tasks-count`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/count', {
        params: {
          path: {
            ...params.path,
          },
          query: {
            ...params.query,
          },
        },
      }),
  });
