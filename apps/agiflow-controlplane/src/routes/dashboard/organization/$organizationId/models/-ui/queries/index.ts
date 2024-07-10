import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type IModel =
  paths['/organizations/{organizationId}/models/{modelId}']['get']['responses']['200']['content']['application/json'];

export const modelQueryOptions = (
  params: paths['/organizations/{organizationId}/models/{modelId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`model-${params.path.modelId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/models/{modelId}', {
        params,
      }),
  });

export type IModels =
  paths['/organizations/{organizationId}/models']['get']['responses']['200']['content']['application/json'];

export const modelsQueryOptions = (params: paths['/organizations/{organizationId}/models']['get']['parameters']) =>
  queryOptions({
    queryKey: [`models-${params.path.organizationId}${params?.query?.name ? `-${params?.query.name}` : ''}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/models', {
        params,
      }),
  });

export type IModelVersions =
  paths['/organizations/{organizationId}/models/{modelId}/model-versions']['get']['responses']['200']['content']['application/json'];

export const modelVersionsQueryOptions = (
  params: paths['/organizations/{organizationId}/models/{modelId}/model-versions']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`model-versions-${params.path.modelId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/models/{modelId}/model-versions', {
        params,
      }),
  });

export type IModelVersion =
  paths['/organizations/{organizationId}/models/{modelId}/model-versions/{modelVersionId}']['get']['responses']['200']['content']['application/json'];

export const modelVersionQueryOptions = (
  params: paths['/organizations/{organizationId}/models/{modelId}/model-versions/{modelVersionId}']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`model-version-${params.path.modelVersionId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/models/{modelId}/model-versions/{modelVersionId}', {
        params,
      }),
  });
