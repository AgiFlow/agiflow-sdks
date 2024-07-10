import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type Environment = NonNullable<
  paths['/organizations/{organizationId}/projects/{projectId}/environments']['get']['responses']['200']['content']['application/json'][0]
>;

export const projectQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`project-${params.path.projectId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}', {
        params,
      }),
  });

export const environmentsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`environments-${params.path.projectId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments', {
        params,
      }),
  });
