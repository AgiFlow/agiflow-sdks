import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type User =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users']['get']['responses']['200']['content']['application/json']['list'][0];

export const usersQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`users-${params.path.environmentId}-${params.query?.limit}-${params.query?.page}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users', {
        params,
      }),
  });

export const usersCountQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users/count']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`users-count-${params.path.environmentId}-${params.query?.limit}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users/count', {
        params,
      }),
  });
