import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type Invitation = NonNullable<
  paths['/invitations/{token}']['get']['responses']['200']['content']['application/json']
>;

export const invitationQueryOptions = (params: paths['/invitations/{token}']['get']['parameters']) =>
  queryOptions({
    queryKey: [`invitation-${params.path.token}`],
    queryFn: () =>
      apiClient.GET('/invitations/{token}', {
        params,
      }),
  });
