import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export const userQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users/{userId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`user-${params.path.environmentId}-${params.path.userId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users/{userId}',
        {
          params,
        },
      ),
  });

export const userStepsSummaryQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/summary/user/{userId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `user-steps-summary-${params.path.environmentId}-${params.path.userId}-${params.query?.fromDate}-${params.query?.toDate}`,
    ],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/summary/user/{userId}',
        {
          params,
        },
      ),
  });

export const userJourneyQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey/user/{userId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `user-task-journey-${params.path.environmentId}-${params.path.userId}-${params.query?.fromDate}-${params.query?.toDate}`,
    ],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey/user/{userId}',
        {
          params,
        },
      ),
  });

export const userSessionsCountQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/sessions/users/{userId}/count']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`user-sessions-count-${params.path.environmentId}-${params.path.userId}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/sessions/users/{userId}/count',
        {
          params,
        },
      ),
  });

export const userSessionsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/sessions/users/{userId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`user-session-${params.path.environmentId}-${params.path.userId}-${params.query?.page}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/sessions/users/{userId}',
        {
          params,
        },
      ),
  });
