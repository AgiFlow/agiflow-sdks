import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';
import { buttonVariants } from '@agiflowai/frontend-web-ui';
import { apiClient } from '@/libs/api';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/payment/success/')({
  component: Dashboard,
});

function Dashboard() {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });
  const sessionId = useSearch({
    from: '/dashboard/organization/$organizationId/payment/success/',
    select: (s: any) => s.session_id,
  });
  const { data } = useQuery({
    queryKey: [`checkout-${sessionId}`],
    queryFn: () => {
      return apiClient.GET('/organizations/{organizationId}/subscriptions/checkout/{sessionId}', {
        params: {
          path: {
            ...params,
            sessionId,
          },
        },
      });
    },
  });
  return (
    <div className='mt-4 flex w-full flex-col items-center'>
      <div className='flex w-full max-w-[500px] flex-col items-center rounded-md border-2 border-border p-3'>
        <h5 className='mb-4 font-bold'>Payment Success</h5>
        <p className='pb-4'>Thank you for your subscription!</p>
        <a className={buttonVariants({ variant: 'default' })} href={data?.data?.invoiceUrl || ''} target='__blank'>
          View Invoice
        </a>
      </div>
    </div>
  );
}
