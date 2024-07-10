import { createFileRoute, Outlet, Link, LinkProps } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createMenuItem } from '@agiflowai/frontend-web-ui';
import { DashboardIcon, HomeIcon, ActivityLogIcon, GearIcon, PersonIcon, Component1Icon } from '@radix-ui/react-icons';
import { envQueryOptions } from './$environmentId/-ui/queries';

const MenuItem = createMenuItem<LinkProps>(Link, {
  activeProps: {
    className: 'bg-background',
  },
});

export const Route = createFileRoute('/dashboard/organization/$organizationId/project/$projectId/env/$environmentId')({
  loader: ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(envQueryOptions({ path: params }));
  },
  component: Layout,
});

function Layout() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(envQueryOptions({ path: params }));
  return (
    <>
      <div className='fixed inset-y-0 left-0 z-10 flex w-[220px] flex-col bg-background-shade p-4'>
        <div className='h-[70px]' />
        <div className='flex w-full flex-1 flex-col'>
          <div className='grid gap-2'>
            <div>
              <label className='text-xs'>Environment</label>
              <h5 className='font-bold underline'>{data?.data?.name || ''}</h5>
            </div>
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId'
              Icon={HomeIcon}
              text={'Home'}
              activeOptions={{
                exact: true,
              }}
            />
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks'
              Icon={DashboardIcon}
              text={'Tasks'}
            />
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs'
              Icon={ActivityLogIcon}
              text={'Logs'}
            />
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users'
              Icon={PersonIcon}
              text={'Users'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <MenuItem
            from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/'
            to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/plugins'
            Icon={Component1Icon}
            text={'Plugins'}
          />
          <MenuItem
            from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/'
            to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/settings'
            Icon={GearIcon}
            text={'Settings'}
          />
        </div>
      </div>
      <div className='z-0 w-full'>
        <Outlet />
      </div>
    </>
  );
}
