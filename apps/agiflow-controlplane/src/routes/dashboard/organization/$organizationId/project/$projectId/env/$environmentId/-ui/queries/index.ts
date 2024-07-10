import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type IEnv =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}']['get']['responses']['200']['content']['application/json'];
export const envQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`environment-${params.path.environmentId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}', {
        params,
      }),
  });

export const userSummaryQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users/summary']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `environment-${params.path.environmentId}-users-summary-${params.query?.fromDate}-${params.query?.toDate}`,
    ],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/users/summary', {
        params,
      }),
  });

export const taskSummaryQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/summary']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `environment-${params.path.environmentId}-tasks-summary-${params.query?.fromDate}-${params.query?.toDate}`,
    ],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/tasks/summary', {
        params,
      }),
  });

export const stepSummaryQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/summary']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `environment-${params.path.environmentId}-steps-summary-${params.query?.fromDate}-${params.query?.toDate}`,
    ],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/summary', {
        params,
      }),
  });

export type TaskGraph =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey']['get']['responses']['200']['content']['application/json'];

export const graphTaskJourneyQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`graphs-task-journey-${params.path.environmentId}-${params.query?.fromDate}-${params.query?.toDate}`],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/sankey/task-journey',
        {
          params,
        },
      ),
  });

export type CostsData =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/line/costs']['get']['responses']['200']['content']['application/json'];

export const costsLineQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/line/costs']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `costs-line-${params.path.environmentId}-${params.query?.fromDate}-${params.query?.toDate}-${params.query?.appVersion}`,
    ],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/graphs/line/costs',
        {
          params,
        },
      ),
  });

export type ActionWorkflow =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/workflows/task-workflow']['get']['responses']['200']['content']['application/json']['action'];
export const taskWorkflowQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/workflows/task-workflow']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `environment-${params.path.environmentId}-task-workflow-${params.query.fromDate}-${params.query.toDate}-${params.query.name}-${params.query.pos}-${params.query.next_name}-${params.query.next_pos}-${params.query.status}-${params.query.next_status}`,
    ],
    queryFn: () =>
      apiClient.GET(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/workflows/task-workflow',
        {
          params,
        },
      ),
  });

export const appVersionsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/app-versions']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [
      `environment-${params.path.environmentId}-app-versions-${params.query?.fromDate}-${params.query?.toDate}`,
    ],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/app-versions', {
        params,
      }),
  });
