import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type ApiKeysParams =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/api-keys']['get']['parameters'];
export const apiKeysQueryOptions = (params: ApiKeysParams) =>
  queryOptions({
    queryKey: [`api-keys-${params.path.environmentId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/api-keys', {
        params,
      }),
  });

export type ClientKeysParams =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/client-keys']['get']['parameters'];
export const clientKeysQueryOptions = (params: ClientKeysParams) =>
  queryOptions({
    queryKey: [`client-keys-${params.path.environmentId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/client-keys', {
        params,
      }),
  });
