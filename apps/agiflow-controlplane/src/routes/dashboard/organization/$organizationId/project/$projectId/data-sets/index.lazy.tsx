import { createLazyFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ControlledPagination } from '@agiflowai/frontend-web-ui';
import { dataSetsQueryOptions } from './-ui/queries';
import { NewDataset } from './-ui/components/NewDataset';
import { DataTable } from './-ui/components/DataTable';
import { SearchInput } from './-ui/components/SearchInput';
import { SearchSchema } from './-ui/validators';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/project/$projectId/data-sets/')({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const navigate = Route.useNavigate();
  const query = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });
  const { data, isLoading } = useQuery(dataSetsQueryOptions({ path: params, query }));

  const empty = useMemo(() => {
    if (isLoading) return null;
    if (query?.name) return null;
    if (query?.page && query.page > 1) return null;
    if (data?.data?.length) return null;
    return (
      <div className='rounded-md bg-background-shade p-4 text-left'>
        <h4>Golden Datasets</h4>
        <p className='pb-4'>
          Currate golden datasets to be used for model fine-tuning or prompts/workflow evaluations. This includes:
        </p>
        <ul className='list-inside list-decimal'>
          <li>Schema management</li>
          <li>Dataset management</li>
          <li>Batch inference and evaluation</li>
        </ul>
      </div>
    );
  }, [data, isLoading, query]);

  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <DataTable
        data={data?.data || []}
        leftSlot={<SearchInput />}
        rightSlot={<NewDataset />}
        emptySlot={empty}
        loading={isLoading}
        pagination={
          <ControlledPagination
            className='justify-end'
            currentPage={query.page || 1}
            totalPage={1}
            pageShown={3}
            onNavigate={page => {
              navigate({
                to: `/dashboard/organization/$organizationId/project/$projectId/prompts`,
                params,
                search: {
                  ...query,
                  page,
                },
              });
            }}
          />
        }
      />
    </div>
  );
}
