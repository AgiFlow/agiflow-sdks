import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type Prompt =
  paths['/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}']['get']['responses']['200']['content']['application/json'];

export const promptQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`prompt-${params.path.promptId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}', {
        params,
      }),
  });

export type Prompts =
  paths['/organizations/{organizationId}/projects/{projectId}/prompts']['get']['responses']['200']['content']['application/json'];

export const promptsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/prompts']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`prompts-${params.path.projectId}${params?.query?.name ? `-${params?.query.name}` : ''}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/prompts', {
        params,
      }),
  });

export type PromptVersions =
  paths['/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}/prompt-versions']['get']['responses']['200']['content']['application/json'];

export const promptVersionsQueryOptions = (
  params: paths['/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}/prompt-versions']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`prompt-versions-${params.path.promptId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}/prompt-versions', {
        params,
      }),
  });
