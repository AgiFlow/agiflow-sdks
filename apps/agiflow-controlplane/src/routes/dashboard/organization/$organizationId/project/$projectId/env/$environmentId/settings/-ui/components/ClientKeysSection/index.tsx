import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/libs/api';
import { ClientKeys } from '../ClientKeys';
import { ClientKeysParams } from '../../queries';

interface ClientKeysSectionProps {
  params: ClientKeysParams['path'];
}
export const ClientKeysSection = ({ params }: ClientKeysSectionProps) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [`client-keys-${params.environmentId}`],
    });
  };

  const createClientKey = useMutation({
    mutationFn: () => {
      return apiClient.POST(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/client-keys',
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

  const deleteClientKey = useMutation({
    mutationFn: (clientKeyId: string) => {
      return apiClient.DELETE(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/client-keys/{clientKeyId}',
        {
          params: {
            path: {
              ...params,
              clientKeyId,
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
        <ClientKeys params={params} onCreate={createClientKey.mutate} onDelete={deleteClientKey.mutate} />
      </div>
    </>
  );
};
