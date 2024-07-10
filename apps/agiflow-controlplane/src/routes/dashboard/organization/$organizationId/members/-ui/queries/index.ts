import { apiClient } from '@/libs/api';
import { queryOptions } from '@tanstack/react-query';
import { paths } from '@agiflowai/controlplane-api-client';

export type IMembers = NonNullable<
  paths['/organizations/{organizationId}/members']['get']['responses']['200']['content']['application/json']
>;

export type IMember = NonNullable<IMembers[0]>;

export type IInvitations = NonNullable<
  paths['/organizations/{organizationId}/invitations']['get']['responses']['200']['content']['application/json']
>;

export type IInvitation = NonNullable<IInvitations[0]>;

export const membersQueryOptions = (params: paths['/organizations/{organizationId}/members']['get']['parameters']) =>
  queryOptions({
    queryKey: [`members-${params.path.organizationId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/members', {
        params,
      }),
  });

export const invitationsQueryOptions = (
  params: paths['/organizations/{organizationId}/invitations']['get']['parameters'],
) =>
  queryOptions({
    queryKey: [`invitations-${params.path.organizationId}`],
    queryFn: () =>
      apiClient.GET('/organizations/{organizationId}/invitations', {
        params,
      }),
  });
