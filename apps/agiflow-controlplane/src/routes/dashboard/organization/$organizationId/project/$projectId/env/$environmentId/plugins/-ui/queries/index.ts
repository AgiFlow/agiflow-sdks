import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type IPlugin = NonNullable<
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/plugins']['get']['responses']['200']['content']['application/json'][0]
>;

export const pluginsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/plugins']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`plugins-${params.path.environmentId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/plugins', {
        params,
      }),
  });
