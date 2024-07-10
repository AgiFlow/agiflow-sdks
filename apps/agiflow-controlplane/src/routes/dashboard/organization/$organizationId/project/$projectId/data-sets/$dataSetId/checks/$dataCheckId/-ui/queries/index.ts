import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type DataCheck =
  paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}']['get']['responses']['200']['content']['application/json'];

export const dataCheckQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`data-check-${params.path.dataCheckId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}',
        {
          params,
        },
      ),
  });

export type Checks =
  paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}/check-jobs']['get']['responses']['200']['content']['application/json']['list'];

export const checkJobsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}/check-jobs']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`check-jobs-${params.path.dataCheckId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks/{dataCheckId}/check-jobs',
        {
          params,
        },
      ),
  });
