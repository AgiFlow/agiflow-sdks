import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type Project = NonNullable<
  paths['/organizations/{organizationId}/projects']['get']['responses']['200']['content']['application/json'][0]
>;

export const organizationQueryOptions = (params: paths['/organizations/{organizationId}']['get']['parameters']) =>
  queryOptions({
    queryKey: [`organization-${params.path.organizationId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}', {
        params,
      }),
  });

export const projectsQueryOptions = (params: paths['/organizations/{organizationId}/projects']['get']['parameters']) =>
  queryOptions({
    queryKey: [`projects-${params.path.organizationId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects', {
        params,
      }),
  });
