import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type Action =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions']['get']['responses']['200']['content']['application/json']['list'][0];

export const actionsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `actions-${params.path.environmentId}-${params.query?.limit}-${params.query?.page}-${params.query?.name}`,
    ],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions', {
        params,
      }),
  });

export const actionsCountQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions/count']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`actions-count-${params.path.environmentId}-${params.query?.limit}-${params.query?.name}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions/count', {
        params,
      }),
  });
