import { createFileRoute, Outlet, Link, LinkProps } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createMenuItem } from '@agiflowai/frontend-web-ui';
import { HomeIcon, GearIcon, FileTextIcon, PilcrowIcon } from '@radix-ui/react-icons';
import { projectQueryOptions } from './$projectId/-ui/queries';

const MenuItem = createMenuItem<LinkProps>(Link, {
  activeProps: {
    className: 'bg-background',
  },
});

export const Route = createFileRoute('/dashboard/organization/$organizationId/project/$projectId')({
  loader: ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(projectQueryOptions({ path: params }));
  },
  component: Layout,
});

function Layout() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(projectQueryOptions({ path: params }));
  return (
    <div className='relative flex w-full flex-row'>
      <div className='fixed inset-y-0 left-0 flex w-[220px] flex-col bg-background-shade p-4'>
        <div className='h-[70px]' />
        <div className='flex w-full flex-1 flex-col'>
          <div className='grid gap-2'>
            <div>
              <label className='text-xs'>Project</label>
              <h5 className='font-bold underline'>{data?.data?.name || ''}</h5>
            </div>
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId'
              to='/dashboard/organization/$organizationId/project/$projectId'
              Icon={HomeIcon}
              text={'Home'}
              activeOptions={{
                exact: true,
              }}
            />
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId'
              to='/dashboard/organization/$organizationId/project/$projectId/data-sets'
              Icon={FileTextIcon}
              text={'Datasets'}
              activeOptions={{
                exact: true,
              }}
            />
            <MenuItem
              from='/dashboard/organization/$organizationId/project/$projectId'
              to='/dashboard/organization/$organizationId/project/$projectId/prompts'
              Icon={PilcrowIcon}
              text={'Prompts'}
              activeOptions={{
                exact: true,
              }}
            />
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <MenuItem
            from='/dashboard/organization/$organizationId/project/$projectId'
            to='/dashboard/organization/$organizationId/project/$projectId/settings'
            Icon={GearIcon}
            text={'Settings'}
          />
        </div>
      </div>
      <div className='w-full'>
        <Outlet />
      </div>
    </div>
  );
}
