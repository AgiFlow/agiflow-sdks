import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ControlledPagination } from '@agiflowai/frontend-web-ui';
import z from 'zod';
import { usersQueryOptions, usersCountQueryOptions } from './-ui/queries';
import { DataTable } from './-ui/components/Table';
import { useMemo } from 'react';

const SearchSchema = z.object({
  limit: z.number().default(10),
  page: z.number().default(1),
});
export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const query = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });

  const navigate = useNavigate({
    from: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs`,
  });

  const { data, isLoading } = useQuery(
    usersQueryOptions({
      path: {
        ...params,
      },
      query: SearchSchema.parse(query),
    }),
  );

  const { data: countData } = useQuery(
    usersCountQueryOptions({
      path: {
        ...params,
      },
      query: SearchSchema.parse(query),
    }),
  );

  const empty = useMemo(() => {
    if (isLoading) return null;
    if (query?.page && query.page > 1) return null;
    if (countData?.data?.total) return null;
    return (
      <div className='rounded-md bg-background-shade p-4 text-left'>
        <h4>Users</h4>
        <p className='pb-4'>
          Users include anonimous and identified users. This provide comprehensive analytics on how your user interact
          with LLM, including:
        </p>
        <ul className='list-inside list-decimal'>
          <li>User Journey (Lifetime LLM interaction)</li>
          <li>Session Replay (Zoom into each session and explore how your user interact with the application)</li>
          <li>Analytics data (LLM costs, IP location, etc...)</li>
        </ul>
      </div>
    );
  }, [data, countData, isLoading, query]);

  return (
    <DataTable
      data={data?.data?.list || []}
      emptySlot={empty}
      loading={isLoading}
      pagination={
        <ControlledPagination
          className='justify-end'
          currentPage={query.page || 1}
          totalPage={countData?.data?.totalPage || 1}
          pageShown={3}
          onNavigate={page => {
            navigate({
              to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users`,
              search: {
                ...query,
                page,
              },
            });
          }}
        />
      }
    />
  );
}
