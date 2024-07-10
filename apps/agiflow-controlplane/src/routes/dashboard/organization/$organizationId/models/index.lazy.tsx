import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ControlledPagination, Badge } from '@agiflowai/frontend-web-ui';
import { useMemo } from 'react';
import { modelsQueryOptions } from './-ui/queries';
import { NewModel } from './-ui/components/NewModel';
import { DataTable } from './-ui/components/DataTable';
import { SearchInput } from './-ui/components/SearchInput';
import { SearchSchema } from './-ui/validators';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/models/')({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const navigate = Route.useNavigate();
  const query = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });
  const { data, isLoading } = useQuery(modelsQueryOptions({ path: params, query }));

  const empty = useMemo(() => {
    if (isLoading) return null;
    if (query?.name) return null;
    if (query?.page && query.page > 1) return null;
    if (data?.data?.length) return null;
    return (
      <div className='rounded-md bg-background-shade p-4 text-left'>
        <h4>Model Registry Overview</h4>
        <p className='pb-4'>
          Model registry provides a centralised hub to manage your organizations&apos;s models. This includes:
        </p>
        <ul className='list-inside list-decimal'>
          <li>Version control</li>
          <li>Cost management</li>
          <li>Online and batch evaluation (* prompt testing and fine-tuning evaluation)</li>
          <li>
            Project and environment access control <Badge>Upcoming</Badge>
          </li>
        </ul>
      </div>
    );
  }, [data, isLoading, query]);

  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <DataTable
        data={data?.data || []}
        leftSlot={<SearchInput />}
        rightSlot={<NewModel />}
        loading={isLoading}
        pagination={
          <ControlledPagination
            className='justify-end'
            currentPage={query.page || 1}
            totalPage={1}
            pageShown={3}
            onNavigate={page => {
              navigate({
                to: `/dashboard/organization/$organizationId/models`,
                params,
                search: {
                  ...query,
                  page,
                },
              });
            }}
          />
        }
        emptySlot={empty}
      />
    </div>
  );
}
