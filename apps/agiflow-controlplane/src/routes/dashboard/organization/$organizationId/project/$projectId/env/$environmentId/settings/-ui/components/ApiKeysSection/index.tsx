import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/libs/api';
import { KeyView } from '../KeyView';
import { ApiKeys } from '../ApiKeys';
import { ApiKeysParams } from '../../queries';

interface ApiKeysSectionProps {
  params: ApiKeysParams['path'];
}
export const ApiKeysSection = ({ params }: ApiKeysSectionProps) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [`api-keys-${params.environmentId}`],
    });
  };

  const createApiKey = useMutation({
    mutationFn: () => {
      return apiClient.POST(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/api-keys',
        {
          params: {
            path: {
              ...params,
            },
          },
        },
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });

  const deleteApiKey = useMutation({
    mutationFn: (apiKeyId: string) => {
      return apiClient.DELETE(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/api-keys/{apiKeyId}',
        {
          params: {
            path: {
              ...params,
              apiKeyId,
            },
          },
        },
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });

  const updateApiKey = useMutation({
    mutationFn: (apiKeyId: string) => {
      return apiClient.PATCH(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/api-keys/{apiKeyId}',
        {
          params: {
            path: {
              ...params,
              apiKeyId,
            },
          },
        },
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });

  return (
    <>
      <div className='grid w-full gap-3'>
        <ApiKeys
          params={params}
          onCreate={createApiKey.mutate}
          onUpdate={updateApiKey.mutate}
          onDelete={deleteApiKey.mutate}
        />
      </div>
      <KeyView
        title='Api key created!'
        open={!!createApiKey.data?.data?.apiKey}
        apiKey={createApiKey.data?.data?.apiKey}
        apiSecret={createApiKey.data?.data?.apiSecret}
        onClose={() => createApiKey.reset()}
      />
      <KeyView
        title='Api key updated!'
        open={!!updateApiKey.data?.data?.apiKey}
        apiKey={updateApiKey.data?.data?.apiKey}
        apiSecret={updateApiKey.data?.data?.apiSecret}
        onClose={() => updateApiKey.reset()}
      />
    </>
  );
};
