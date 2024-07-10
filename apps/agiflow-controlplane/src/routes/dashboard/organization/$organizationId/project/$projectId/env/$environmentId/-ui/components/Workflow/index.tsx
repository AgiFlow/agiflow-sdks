import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
  MeasuredContainer,
  cn,
} from '@agiflowai/frontend-web-ui';
import { Workflow as Chart } from '@/ui/workflow';

import { taskWorkflowQueryOptions, ActionWorkflow } from '../../queries';
import { TaskStatus } from '../../../tasks/-ui/components/Status';

const isEqualAction = (a: ActionWorkflow | null | undefined, b: ActionWorkflow | null | undefined) => {
  return `${a?.name}-${a?.pos}-${a?.status}` === `${b?.name}-${b?.pos}-${b?.status}`;
};

interface IWorkflowProps {
  queryData: {
    sourceData: {
      name: string;
      pos?: number;
      status?: number;
    };
    targetData: {
      name: string;
      pos?: number;
      status?: number;
    };
  };
}

export const Workflow = ({ queryData }: IWorkflowProps) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const [action, setAction] = useState<ActionWorkflow | null | undefined>(null);
  const { data: res } = useQuery(
    taskWorkflowQueryOptions({
      path: params,
      query: {
        name: queryData.sourceData.name,
        pos: queryData.sourceData.pos,
        status: queryData.sourceData.status,
        next_name: queryData.targetData.name,
        next_pos: queryData.targetData.pos,
        next_status: queryData.targetData.status,
      },
    }),
  );

  useEffect(() => {
    if (res?.data) {
      setAction(res.data.action);
    }
  }, [res?.data]);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList className='text-lg font-bold'>
          <BreadcrumbItem>
            <BreadcrumbPage className={'inline-flex cursor-pointer gap-2'} onClick={() => setAction(res?.data?.action)}>
              <span
                className={cn(
                  isEqualAction(action, res?.data?.action) ? 'font-bold text-primary underline' : undefined,
                )}
              >
                {res?.data?.action?.name}
              </span>
              <TaskStatus status={res?.data?.action?.status as number} />
            </BreadcrumbPage>
          </BreadcrumbItem>
          {res?.data?.next_action?.name || res?.data?.next_action?.steps?.length ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage
                  className={'inline-flex cursor-pointer gap-2'}
                  onClick={() => setAction(res?.data?.next_action)}
                >
                  <span
                    className={cn(
                      isEqualAction(action, res?.data?.next_action) ? 'font-bold text-primary underline' : undefined,
                    )}
                  >
                    {res?.data?.next_action?.name}
                  </span>
                  <TaskStatus status={res?.data?.next_action?.status as number} />
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      <div className='inline-flex gap-3 py-3'>
        {(action?.actionSummaries || []).map(summary => (
          <div key={`${summary.status}-${summary.action_count}`} className='rounded-md border-2 border-border p-3'>
            <p className='text-sm font-bold'>Repetition: {summary.action_count}</p>
            <p className='text-2xs'>Count: {summary.count}</p>
          </div>
        ))}
      </div>
      <MeasuredContainer className='min-h-[80vh] w-full' key={action?.name}>
        {action ? <Chart steps={action?.steps || []} /> : null}
      </MeasuredContainer>
    </div>
  );
};
