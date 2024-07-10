import { Button, ClipBoardButton, Skeleton } from '@agiflowai/frontend-web-ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { invitationsQueryOptions } from '../../queries';
import { apiClient } from '@/libs/api';
import { config } from '@/libs/config';

const InvitationSkeleton = () => (
  <div className='flex w-full flex-col gap-2 py-2'>
    <Skeleton className='h-2 w-[90%] rounded-sm' />
    <Skeleton className='h-2 w-4/5 rounded-sm' />
    <Skeleton className='h-2 w-[85%] rounded-sm' />
  </div>
);

export const Invitations = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });
  const { data, refetch, isLoading } = useQuery(invitationsQueryOptions({ path: params }));
  const createInvitation = useMutation({
    mutationFn: () => {
      return apiClient.POST('/organizations/{organizationId}/invitations', {
        params: {
          path: params,
        },
      });
    },
    onSuccess: () => {
      refetch();
    },
  });
  return (
    <div className='flex w-full flex-col gap-3 rounded-md bg-background-shade p-3'>
      {(data?.data || []).map(invitation => (
        <div className='flex w-full gap-2 border-b-2 border-b-border py-2' key={invitation.id}>
          <ClipBoardButton
            text={`${config.VITE_CONTROLPLANE_DASHBOARD_URL}/dashboard/organization/${params.organizationId}/invitations/${invitation.token}`}
            className='min-h-[98px] w-full p-0 text-left'
            textClassName='text-2xs line-clamp-5'
            variant='link'
          />
        </div>
      ))}
      {isLoading ? <InvitationSkeleton /> : null}
      <Button className='w-full' variant='outline' onClick={() => createInvitation.mutate()}>
        Create invitation
      </Button>
    </div>
  );
};
