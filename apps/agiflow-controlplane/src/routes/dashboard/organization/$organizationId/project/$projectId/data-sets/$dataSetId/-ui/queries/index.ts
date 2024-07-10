import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type DataPoints =
  paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-points']['get']['responses']['200']['content']['application/json']['list'];

export const dataPointsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-points']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`data-points-${params.path.dataSetId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-points', {
        params,
      }),
  });

export type DataChecks =
  paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks']['get']['responses']['200']['content']['application/json']['list'];

export const dataChecksQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`data-checks-${params.path.dataSetId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks', {
        params,
      }),
  });
