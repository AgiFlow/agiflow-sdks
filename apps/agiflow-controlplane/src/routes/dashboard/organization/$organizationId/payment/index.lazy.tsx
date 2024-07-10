import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { organizationQueryOptions } from '../-ui/queries';
import { Subscribe } from './-ui/components/Subscribe';
import { Portal } from './-ui/components/Portal';
import { getDateTime } from '@/libs/datetime';
import { permissionList, isHobby } from '@/constants/pricing';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/payment/')({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const { data } = useQuery(organizationQueryOptions({ path: params }));
  return (
    <div className='w-full p-3'>
      {isHobby(data?.data?.sub) ? (
        <Subscribe name={data?.data?.name || ''} />
      ) : (
        <div className='flex w-full max-w-[500px] flex-col gap-4'>
          <h5>{permissionList[data?.data?.sub?.price_key as any]?.name}</h5>
          {data?.data?.quota_exceeded ? (
            <p>
              Quota exceeded! You are using {data?.data?.sub?.log_usage} traces while your maximum traces with current
              subscription is {data?.data?.sub?.permissions?.traces}
            </p>
          ) : null}
          <p className='text-sm'>
            {data?.data?.sub?.is_trial ? 'Trial' : 'Subscribed'}: {getDateTime(data?.data?.sub?.started_at)} -{' '}
            {getDateTime(data?.data?.sub?.ended_at)}
          </p>
          <Portal />
        </div>
      )}
    </div>
  );
}
