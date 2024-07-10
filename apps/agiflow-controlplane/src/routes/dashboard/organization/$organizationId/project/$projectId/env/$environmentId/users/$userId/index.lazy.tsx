import { createLazyFileRoute, useNavigate, Link } from '@tanstack/react-router';
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
  ControlledPagination,
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@agiflowai/frontend-web-ui';
import z from 'zod';
import { userQueryOptions, userStepsSummaryQueryOptions, userSessionsCountQueryOptions } from './-ui/queries';
import { titleCase } from 'title-case';
import { getLocalCurrencyByCents, getDateTime, formatMillis } from '@/libs';
import { TaskJourney } from './-ui/components/TaskJourney';
import { Sessions } from './-ui/components/Sessions';

const SearchSchema = z.object({
  fromDate: z.string().nullish(),
  toDate: z.string().nullish(),
  page: z.coerce.number().default(1),
});
export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate({
    from: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId`,
  });
  const params = Route.useParams();
  const search = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });
  const { data } = useQuery(
    userStepsSummaryQueryOptions({
      path: params,
      query: search,
    }),
  );
  const { data: userData } = useQuery(
    userQueryOptions({
      path: params,
    }),
  );
  const { data: countData } = useQuery(
    userSessionsCountQueryOptions({
      path: params,
    }),
  );
  const {
    user,
    userMeta: { city, country, ...rest },
  } = useMemo(() => {
    const user = userData?.data;
    return {
      user,
      userMeta: user?.meta || ({} as any),
    };
  }, [userData]);
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
            <BreadcrumbPage>{params.userId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h4>User Detail</h4>
      <div className='inline-flex w-full flex-wrap gap-3'>
        <Badge variant='outline'>Response Time: {formatMillis(data?.data?.responseTime)}</Badge>
        <Badge variant='outline'>LLM Cost: {getLocalCurrencyByCents(data?.data?.externalCost)}</Badge>
        <Badge variant='outline'>Last Visit: {getDateTime(user?.last_visit || user?.created_at)}</Badge>
        {user?.u_id ? <Badge variant='outline'>User Id: {user.u_id}</Badge> : null}
        {user?.a_id ? <Badge variant='outline'>Alias Id: {user.a_id}</Badge> : null}
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
          <div className='inline-flex items-center rounded-md bg-background-shade p-3'>
            <h6 className='flex-1'>Sessions</h6>
            <p className='text-xs'>({countData?.data?.total})</p>
          </div>
          <div className='flex flex-1 flex-col overflow-y-auto'>
            <Sessions />
          </div>
          <div>
            <ControlledPagination
              className='justify-end'
              currentPage={search.page || 1}
              totalPage={countData?.data?.totalPage || 1}
              pageShown={3}
              onNavigate={page => {
                navigate({
                  to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId`,
                  search: {
                    ...search,
                    page,
                  },
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
