import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch, Link } from '@tanstack/react-router';
import { Button, Alert, AlertTitle, Separator } from '@agiflowai/frontend-web-ui';
import { Link2Icon } from '@radix-ui/react-icons';
import { getDateTime } from '@/libs/datetime';

import { userSessionsQueryOptions } from '../../queries';
import { ReactNode } from 'react';

export const Sessions = ({ children }: { children?: ReactNode }) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId/',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId/',
  });
  const { data: res, isFetching } = useQuery(userSessionsQueryOptions({ path: params, query: search }));
  if (isFetching) return null;
  if (!res?.data || !res?.data?.list?.length) {
    return (
      <Alert>
        <AlertTitle>Empty Session!</AlertTitle>
      </Alert>
    );
  }
  return (
    <>
      {(res?.data?.list || []).map(session => (
        <div key={session.id} className='p-2'>
          <div className='inline-flex w-full items-center'>
            <p className='flex-1 text-xs font-bold'>{session.id}</p>
            <Link
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/sessions/$sessionId'
              params={{
                sessionId: session.id,
              }}
            >
              <Button variant={'ghost'} className='h-9 w-9 p-2'>
                <Link2Icon />
              </Button>
            </Link>
          </div>
          <div className='inline-flex w-full justify-end pb-2'>
            {(session.meta as any)?.city ? (
              <p className='flex-1 text-3xs'>
                {(session?.meta as any)?.city}, {(session?.meta as any)?.country}
              </p>
            ) : null}
            <p className='text-3xs'>{getDateTime(session.started_at || session.created_at)}</p>
          </div>
          <Separator />
        </div>
      ))}
      {children}
    </>
  );
};
