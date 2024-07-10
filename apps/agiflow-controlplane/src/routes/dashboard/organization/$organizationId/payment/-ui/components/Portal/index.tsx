import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';
import { buttonVariants } from '@agiflowai/frontend-web-ui';
import { apiClient } from '@/libs/api';

export const Portal = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });
  const sessionId = useSearch({
    from: '/dashboard/organization/$organizationId/payment/',
    select: (s: any) => s.session_id,
  });
  const { data } = useQuery({
    queryKey: [`checkout-${sessionId}`],
    queryFn: () => {
      return apiClient.GET('/organizations/{organizationId}/subscriptions/portal', {
        params: {
          path: params,
        },
      });
    },
  });
  return (
    <a className={buttonVariants({ variant: 'outline' })} href={data?.data?.url || ''} target='__blank'>
      Manage Subscription
    </a>
  );
};
