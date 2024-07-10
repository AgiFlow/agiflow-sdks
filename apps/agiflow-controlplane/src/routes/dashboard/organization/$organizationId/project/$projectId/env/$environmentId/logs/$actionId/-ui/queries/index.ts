import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type Action =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions/{actionId}']['get']['responses']['200']['content']['application/json'];
type Steps = NonNullable<Action['steps']>;
export type Step = NonNullable<Steps[0]>;

export const actionQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions/{actionId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`action-${params.path.actionId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions/{actionId}',
        {
          params,
        },
      ),
  });
