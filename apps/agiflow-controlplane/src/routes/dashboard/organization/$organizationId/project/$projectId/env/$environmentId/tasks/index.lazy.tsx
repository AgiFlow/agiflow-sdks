import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { Button, ControlledPagination } from '@agiflowai/frontend-web-ui';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { fetchApi } from '@/libs/api';

import { tasksQueryOptions, taskCountQueryOptions } from './-ui/queries';
import { TaskCard } from './-ui/components/TaskCard';
import { TASK_STATUSES } from '../tasks/$taskId/-ui/constants';
import { config } from '@/libs';

const SearchSchema = z.object({
  limit: z.number().default(10),
  group1: z.number().default(1),
  group2: z.number().default(1),
  group3: z.number().default(1),
});
export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const query = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });
  const navigate = useNavigate({
    from: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks`,
  });
  const { data: requiredInputData } = useQuery(
    tasksQueryOptions(
      {
        path: {
          ...params,
        },
        query: {
          ...SearchSchema.parse(query),
          page: query.group1,
        },
      },
      [TASK_STATUSES.PROBLEMATIC],
    ),
  );
  const { data: reviewData } = useQuery(
    tasksQueryOptions(
      {
        path: {
          ...params,
        },
        query: {
          ...SearchSchema.parse(query),
          page: query.group2,
        },
      },
      [TASK_STATUSES.REVIEW],
    ),
  );
  const { data: fixedData } = useQuery(
    tasksQueryOptions(
      {
        path: {
          ...params,
        },
        query: {
          ...SearchSchema.parse(query),
          page: query.group3,
        },
      },
      [TASK_STATUSES.FIXED, TASK_STATUSES.CHURNED, TASK_STATUSES.COMPLETED],
    ),
  );
  const { data: countData } = useQuery(
    taskCountQueryOptions({
      path: {
        ...params,
      },
      query: {
        group1: [TASK_STATUSES.PROBLEMATIC],
        group2: [TASK_STATUSES.REVIEW],
        group3: [TASK_STATUSES.FIXED, TASK_STATUSES.CHURNED, TASK_STATUSES.COMPLETED],
        limit: 10,
      },
    }),
  );

  const download = () => {
    fetchApi(
      `${config.VITE_CONTROLPLANE_API_ENDPOINT}/organizations/${params.organizationId}/projects/${params.projectId}/environments/${params.environmentId}/steps/download`,
    )
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  return (
    <>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <div className='flex w-full flex-row justify-end gap-2 pb-4'>
          <Button className='gap-2' variant='outline' onClick={download}>
            Export Feedback
            <DownloadIcon />
          </Button>
        </div>
        <div className='grid size-full min-h-[80vh] grid-cols-3 gap-2'>
          <div className='col-span-1 flex flex-col gap-3 p-3'>
            <h6 className='font-bold underline'>Required Input</h6>
            <div className='flex h-[66vh] flex-col gap-2 overflow-y-auto'>
              {(requiredInputData?.data?.list || []).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            <ControlledPagination
              className='justify-end'
              currentPage={query.group1 || 1}
              totalPage={countData?.data?.group1.page || 1}
              pageShown={3}
              onNavigate={page => {
                navigate({
                  to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks`,
                  search: {
                    ...query,
                    group1: page,
                  },
                });
              }}
            />
          </div>
          <div className='col-span-1 flex flex-col gap-3 border-x-2 border-border p-3'>
            <h6 className='font-bold underline'>In Review</h6>
            <div className='flex h-[66vh] flex-col gap-2 overflow-y-auto'>
              {(reviewData?.data?.list || []).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            <ControlledPagination
              className='justify-end'
              currentPage={query.group2 || 1}
              totalPage={countData?.data?.group2.page || 1}
              pageShown={3}
              onNavigate={page => {
                navigate({
                  to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks`,
                  search: {
                    ...query,
                    group2: page,
                  },
                });
              }}
            />
          </div>
          <div className='col-span-1 flex flex-col gap-3 p-3'>
            <h6 className='font-bold underline'>Finalised</h6>
            <div className='flex h-[66vh] flex-col gap-2 overflow-y-auto'>
              {(fixedData?.data?.list || []).map(task => (
                <TaskCard key={task.id} task={task} showBadge={true} />
              ))}
            </div>
            <ControlledPagination
              className='justify-end'
              currentPage={query.group3 || 1}
              totalPage={countData?.data?.group3.page || 1}
              pageShown={3}
              onNavigate={page => {
                navigate({
                  to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks`,
                  search: {
                    ...query,
                    group3: page,
                  },
                });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
