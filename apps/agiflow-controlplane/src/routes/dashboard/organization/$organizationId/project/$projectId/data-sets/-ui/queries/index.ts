import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type DataSet =
  paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}']['get']['responses']['200']['content']['application/json'];

export const dataSetQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`data-set-${params.path.dataSetId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}', {
        params,
      }),
  });

export type DataSets =
  paths['/organizations/{organizationId}/projects/{projectId}/data-sets']['get']['responses']['200']['content']['application/json'];

export const dataSetsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/data-sets']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`data-sets-${params.path.projectId}${params?.query?.name ? `-${params?.query.name}` : ''}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/data-sets', {
        params,
      }),
  });
