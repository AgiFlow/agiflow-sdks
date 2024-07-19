import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  Badge,
  Sheet,
  SheetContent,
  MeasuredContainer,
} from '@agiflowai/frontend-web-ui';
import { ReactFlowProvider } from 'reactflow';
import { getLocalCurrencyByCents } from '@/libs';
import { actionQueryOptions } from './-ui/queries';
import { Spans } from './-ui/components/Spans';
import { StepComp } from './-ui/components/Step';
import { ActionComp } from './-ui/components/Action';
import { Workflow } from './-ui/components/Workflow';
import { SearchSchema } from './-ui/validators';
import { workflowViewAtom } from './-ui/states';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const stepId = Route.useSearch({
    select: s => SearchSchema.parse(s).stepId,
  });
  const { data } = useQuery(actionQueryOptions({ path: params }));
  const [viewWorkflow, setViewWorkflow] = useAtom(workflowViewAtom);
  const step = useMemo(() => {
    return (data?.data?.steps || []).find(step => step.id === stepId);
  }, [stepId, data]);

  if (!data?.data) return null;

  const version = data?.data?.app_version;

  return (
    <div className='grid w-full gap-4 md:p-4 lg:p-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs'
            >
              <BreadcrumbLink className='underline' href='/'>
                Logs
              </BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{params.actionId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h4>Log Detail</h4>
      <div className='inline-flex w-full flex-wrap gap-3'>
        <Link
          from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId'
          to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId'
          params={{
            userId: data?.data?.task?.session?.user?.id,
          }}
        >
          <Badge variant='inverted'>User: {data?.data?.task?.session?.user?.id}</Badge>
        </Link>
        <Link
          from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId'
          to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/sessions/$sessionId'
          params={{
            sessionId: data?.data?.task?.session?.id,
          }}
        >
          <Badge variant='inverted'>Session: {data?.data?.task?.session?.id}</Badge>
        </Link>
        <Link
          from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId'
          to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
          params={{
            taskId: data?.data?.task?.id,
          }}
        >
          <Badge variant='inverted'>Task: {data?.data?.task?.id}</Badge>
        </Link>
        {data?.data?.running_cost ? (
          <Badge variant='outline'>LLM Cost: {getLocalCurrencyByCents(Number(data?.data?.running_cost))}</Badge>
        ) : null}
        {data?.data?.average_running_cost ? (
          <Badge variant='outline'>
            Average Cost: {getLocalCurrencyByCents(Number(data?.data?.average_running_cost))}
          </Badge>
        ) : null}
        {data?.data?.evaluation_cost ? (
          <Badge variant='outline'>
            Evaluation Cost: {getLocalCurrencyByCents(Number(data?.data?.evaluation_cost))}
          </Badge>
        ) : null}
        {version ? <Badge variant='outline'>App version: {version}</Badge> : null}
      </div>
      <Separator />
      <div className='grid w-full grid-cols-12 gap-4'>
        <div className='col-span-8 min-h-[200px] rounded-md border-2 border-border'>
          {step ? <StepComp step={step} /> : <ActionComp action={data?.data} />}
        </div>
        <div className='col-span-4'>
          <Spans action={data?.data} />
        </div>
      </div>
      <Sheet open={!!viewWorkflow} onOpenChange={() => setViewWorkflow(false)}>
        <SheetContent className='w-full sm:max-w-full lg:max-w-[90%]'>
          <MeasuredContainer className='min-h-screen w-full'>
            {data?.data?.steps ? (
              <ReactFlowProvider>
                <Workflow stepId={stepId} steps={data?.data?.steps as any[]} />
              </ReactFlowProvider>
            ) : null}
          </MeasuredContainer>
        </SheetContent>
      </Sheet>
    </div>
  );
}
