import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  Badge,
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@agiflowai/frontend-web-ui';
import { Link2Icon } from '@radix-ui/react-icons';
import { titleCase } from 'title-case';
import { getLocalCurrencyByCents, getDateTime, formatMillis } from '@/libs';
import { sessionStepsSummaryQueryOptions, sessionQueryOptions } from './-ui/queries';
import { TaskJourney } from './-ui/components/TaskJourney';
import { TASK_STATUS_NAMES, TASK_VARIANTS } from '../../tasks/$taskId/-ui/constants';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/sessions/$sessionId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const { data } = useQuery(
    sessionStepsSummaryQueryOptions({
      path: params,
    }),
  );
  const { data: sessionData } = useQuery(
    sessionQueryOptions({
      path: params,
    }),
  );
  const {
    session,
    sessionMeta: { city, country, ...rest },
  } = useMemo(() => {
    const session = sessionData?.data;
    return {
      session,
      sessionMeta: session?.meta || ({} as any),
    };
  }, [sessionData]);
  return (
    <div className='grid w-full gap-4 md:p-4 lg:p-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId'
              to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users'
            >
              <BreadcrumbLink className='underline' href='/'>
                Users
              </BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Session</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{params.sessionId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h4>Session Detail</h4>
        <p className='text-xs'>
          {getDateTime(session?.started_at || session?.created_at)}{' '}
          {session?.ended_at ? `- ${getDateTime(session?.ended_at)}` : null}
        </p>
      </div>
      <div className='inline-flex w-full flex-wrap gap-3'>
        <Link
          from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/sessions/$sessionId'
          to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId'
          params={{
            userId: sessionData?.data?.user_id || '',
          }}
        >
          <Badge variant='inverted'>User: {session?.user_id}</Badge>
        </Link>
        <Badge variant='outline'>Response Time: {formatMillis(data?.data?.responseTime)}</Badge>
        <Badge variant='outline'>LLM Cost: {getLocalCurrencyByCents(data?.data?.externalCost)}</Badge>
        {country ? (
          <Badge variant='outline'>
            {city}, {country}
          </Badge>
        ) : null}
        {Object.keys(rest)?.length ? (
          <Sheet>
            <SheetTrigger>
              <Badge variant='inverted'>Extra info ({Object.keys(rest)?.length})</Badge>
            </SheetTrigger>
            <SheetContent className='flex flex-col gap-2 text-sm'>
              <h6 className='font-bold'>Extra information:</h6>
              {Object.entries(rest).map(([key, value]) => (
                <p key={`${key}`}>
                  <b>{titleCase(key)}:</b> {value as string}
                </p>
              ))}
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
      <Separator />
      <div className='grid w-full grid-cols-12 gap-4'>
        <div className='col-span-8 h-[60vh] rounded-md border-2 border-border p-3'>
          <TaskJourney />
        </div>
        <div className='col-span-4 flex h-[60vh] flex-col gap-3'>
          <div className='inline-flex w-full items-center rounded-md bg-background-shade p-3'>
            <h6 className='flex-1'>Tasks</h6>
            {sessionData?.data?.tasks?.length ? (
              <p className='text-xs'>{`(${sessionData?.data?.tasks.length})`}</p>
            ) : null}
          </div>
          <div className='flex flex-1 flex-col overflow-y-auto'>
            {(sessionData?.data?.tasks || []).map(task => (
              <div key={task.id} className='p-2'>
                <div className='inline-flex w-full items-center gap-2'>
                  <p className='flex-1 text-md font-bold'>{task.name}</p>
                  <p className='text-3xs'>{getDateTime(task.started_at || task.created_at)}</p>
                  <Link
                    from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/sessions/$sessionId'
                    to='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId'
                    params={{
                      taskId: task.id,
                    }}
                  >
                    <Button variant={'ghost'} className='h-9 w-9 p-2'>
                      <Link2Icon />
                    </Button>
                  </Link>
                </div>
                <div className='inline-flex w-full items-center pb-2'>
                  <p className='flex-1 text-2xs'>{task.id}</p>
                  <Badge variant={TASK_VARIANTS[task.status as number]}>
                    {TASK_STATUS_NAMES[task.status as number]}
                  </Badge>
                </div>
                <Separator />
              </div>
            ))}
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
