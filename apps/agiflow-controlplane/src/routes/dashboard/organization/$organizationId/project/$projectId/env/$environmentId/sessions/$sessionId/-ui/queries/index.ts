import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export const sessionStepsSummaryQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/summary/sessions/{sessionId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`session-steps-summary-${params.path.environmentId}-${params.path.sessionId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/summary/sessions/{sessionId}',
        {
          params,
        },
      ),
  });

export const sessionQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/sessions/{sessionId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`session-${params.path.environmentId}-${params.path.sessionId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/sessions/{sessionId}',
        {
          params,
        },
      ),
  });

export const sessionTaskJourneyQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey/sessions/{sessionId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`session-task-journey-${params.path.environmentId}-${params.path.sessionId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey/sessions/{sessionId}',
        {
          params,
        },
      ),
  });
