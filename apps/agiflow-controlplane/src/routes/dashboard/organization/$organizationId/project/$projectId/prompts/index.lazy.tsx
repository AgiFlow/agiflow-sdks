import { useMemo } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ControlledPagination, Badge } from '@agiflowai/frontend-web-ui';
import { promptsQueryOptions } from './-ui/queries';
import { DataTable } from './-ui/components/DataTable';
import { NewPrompt } from './-ui/components/NewPrompt';
import { SearchSchema } from './-ui/validators';
import { SearchInput } from './-ui/components/SearchInput';

export const Route = createLazyFileRoute('/dashboard/organization/$organizationId/project/$projectId/prompts/')({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const navigate = Route.useNavigate();
  const query = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });
  const { data, isLoading } = useQuery(promptsQueryOptions({ path: params, query }));
  const empty = useMemo(() => {
    if (isLoading) return null;
    if (query?.name) return null;
    if (query?.page && query.page > 1) return null;
    if (data?.data?.length) return null;
    return (
      <div className='rounded-md bg-background-shade p-4 text-left'>
        <h4>Prompts Registry Overview</h4>
        <p className='pb-4'>Manage prompt templates and versioning in one place. Usage includes:</p>
        <ul className='list-inside list-decimal'>
          <li>Template management using Mustache format</li>
          <li>Prompt versioning which can be used for analytics.</li>
          <li>Batch evaluation</li>
          <li>
            A/B testing <Badge>Upcoming</Badge>
          </li>
        </ul>
      </div>
    );
  }, [data, isLoading, query]);

  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <DataTable
        leftSlot={<SearchInput />}
        data={data?.data || []}
        rightSlot={<NewPrompt />}
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
