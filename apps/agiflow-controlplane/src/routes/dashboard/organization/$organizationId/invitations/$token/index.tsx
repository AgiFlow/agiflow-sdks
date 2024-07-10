import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/libs/tanstackQuery';
import { apiClient } from '@/libs/api';
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Alert,
  AlertDescription,
} from '@agiflowai/frontend-web-ui';
import { invitationQueryOptions } from './-ui/queries';

export const Route = createFileRoute('/dashboard/organization/$organizationId/invitations/$token/')({
  loader: ({ params }) => queryClient.ensureQueryData(invitationQueryOptions({ path: params })),
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/invitations/$token',
  });
  const { data, isFetching } = useSuspenseQuery(invitationQueryOptions({ path: params }));
  const acceptInvitation = useMutation({
    mutationFn: () => {
      return apiClient.POST('/invitations/{token}', {
        params: {
          path: params,
        },
      });
    },
    onSuccess: data => {
      if (!data?.error) {
        queryClient.invalidateQueries({
          queryKey: ['organizations'],
        });
        navigate({
          to: '/dashboard/organization/$organizationId',
        });
      }
    },
  });

  if (!isFetching && !data?.data?.id) {
    return (
      <div className='flex size-full min-h-screen flex-col items-center justify-center'>
        <Card className='w-full max-w-[400px]'>
          <CardHeader>
            <CardTitle className='text-center text-h4'>Invalid Invitation</CardTitle>
            <CardContent>
              <CardDescription className='text-center'>Sorry, the invitation is expired or invalid.</CardDescription>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex size-full min-h-screen flex-col items-center justify-center'>
      <Card className='w-full max-w-[400px]'>
        <CardHeader>
          <CardTitle className='text-center text-h4'>{data?.data?.organization?.name}</CardTitle>
          <CardContent>
            <CardDescription className='text-center'>
              Please click the button below to accept invitation!
            </CardDescription>
          </CardContent>
          <CardFooter>
            {acceptInvitation?.data?.error ? (
              <Alert>
                <AlertDescription>{(acceptInvitation?.data as any)?.error?.message}</AlertDescription>
              </Alert>
            ) : null}
            <Button className='w-full' onClick={() => acceptInvitation.mutate()}>
              Join Organization
            </Button>
          </CardFooter>
        </CardHeader>
      </Card>
    </div>
  );
}
