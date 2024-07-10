import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ControlledPagination } from '@agiflowai/frontend-web-ui';
import { SearchSchema } from '../../validators';
import { actionsCountQueryOptions, actionsQueryOptions } from '../../queries';
import { DataTable } from '../Table';
import { SearchInput } from '../SearchInput';
import { useMemo } from 'react';

const Main = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/',
  });
  const query = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/',
    select: s => SearchSchema.parse(s),
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs',
  });

  const { data, isLoading } = useQuery(
    actionsQueryOptions({
      path: {
        ...params,
      },
      query: SearchSchema.parse(query),
    }),
  );
  const { data: countData } = useQuery(
    actionsCountQueryOptions({
      path: {
        ...params,
      },
      query: SearchSchema.parse(query),
    }),
  );

  const empty = useMemo(() => {
    if (isLoading) return null;
    if (query?.name) return null;
    if (query?.page && query.page > 1) return null;
    if (countData?.data?.total) return null;
    return (
      <div className='rounded-md bg-background-shade p-4 text-left'>
        <h4>Logs & Traces</h4>
        <p className='pb-4'>Trace represents capture telemetry of the full API call. This includes:</p>
        <ul className='list-inside list-decimal'>
          <li>LLM API request and response</li>
          <li>Vector DB query and response</li>
          <li>LLM and Agent Framework function execution</li>
          <li>Your workflow/task/agent/tool wrapped by AGIFlow's decorator</li>
        </ul>
      </div>
    );
  }, [data, countData, isLoading, query]);

  return (
    <DataTable
      data={data?.data?.list || []}
      leftSlot={<SearchInput />}
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
              to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs`,
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
};

export default Main;
