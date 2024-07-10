import { createFileRoute, Outlet, useMatchRoute, Link, LinkProps } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createMenuItem } from '@agiflowai/frontend-web-ui';
import { HomeIcon, GearIcon, PersonIcon, FrameIcon, SketchLogoIcon } from '@radix-ui/react-icons';
import { organizationQueryOptions } from './$organizationId/-ui/queries';
import { useEffect } from 'react';

const MenuItem = createMenuItem<LinkProps>(Link, {
  activeProps: {
    className: 'bg-background',
  },
});

export const Route = createFileRoute('/dashboard/organization/$organizationId')({
  loader: ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(organizationQueryOptions({ path: params }));
  },
  component: Layout,
});

function Layout() {
  const params = Route.useParams();
  const navigate = Route.useNavigate();
  const matchRoute = useMatchRoute();
  const matched = matchRoute({
    to: '/dashboard/organization/$organizationId/invitations/$token',
    fuzzy: true,
  }) as unknown as { token?: string };
  const { data } = useSuspenseQuery(organizationQueryOptions({ path: params }));

  useEffect(() => {
    if (data?.error) {
      navigate({
        to: '/dashboard',
      });
    }
  }, [data?.error]);

  if (matched?.token) {
    return (
      <div className='relative flex w-full flex-row'>
        <Outlet />
      </div>
    );
  }

  return (
    <div className='relative flex w-full flex-row'>
      <div className='fixed inset-y-0 left-0 flex w-[220px] flex-col bg-background-shade p-4'>
        <div className='h-[70px]' />
        <div className='flex w-full flex-1 flex-col'>
          <div className='grid gap-2'>
            <div>
              <label className='text-xs'>Organization</label>
              <h5 className='font-bold underline'>{data?.data?.name || ''}</h5>
            </div>
            <MenuItem
              from='/dashboard/organization/$organizationId'
              to='/dashboard/organization/$organizationId'
              Icon={HomeIcon}
              text={'Home'}
              activeOptions={{
                exact: true,
              }}
            />
            <MenuItem
              from='/dashboard/organization/$organizationId'
              to='/dashboard/organization/$organizationId/models'
              Icon={FrameIcon}
              text={'Models'}
              activeOptions={{
                exact: true,
              }}
            />
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <MenuItem
            from='/dashboard/organization/$organizationId'
            to='/dashboard/organization/$organizationId/members'
            Icon={PersonIcon}
            text={'Members'}
            activeOptions={{
              exact: true,
            }}
          />
          <MenuItem
            from='/dashboard/organization/$organizationId'
            to='/dashboard/organization/$organizationId/payment'
            Icon={SketchLogoIcon}
            text={'Subscription'}
          />
          <MenuItem
            from='/dashboard/organization/$organizationId'
            to='/dashboard/organization/$organizationId/settings'
            Icon={GearIcon}
            text={'Settings'}
          />
        </div>
      </div>
      <div className='relative h-full w-[220px]' />
      <div className='flex-1 p-3 md:p-4 lg:p-6'>
        <Outlet />
      </div>
    </div>
  );
}
