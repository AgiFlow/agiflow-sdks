import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ControlledPagination } from '@agiflowai/frontend-web-ui';
import { checkJobsQueryOptions } from './-ui/queries';
import { Nav } from './-ui/components/Nav';
import { DataTable } from './-ui/components/DataTable';
import { SearchSchema } from './-ui/validators';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/checks/$dataCheckId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const query = Route.useSearch({
    select: s => SearchSchema.parse(s),
  });
  const navigate = Route.useNavigate();
  const { data: checksData } = useQuery(checkJobsQueryOptions({ path: params }));
  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <Nav dataCheckId={params.dataCheckId} />
      <DataTable
        data={checksData?.data?.list || []}
        pagination={
          <ControlledPagination
            className='justify-end'
            currentPage={query.page || 1}
            totalPage={1}
            pageShown={3}
            onNavigate={page => {
              navigate({
                to: `/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/checks/$dataCheckId`,
                search: {
                  ...query,
                  page,
                },
              } as unknown as any);
            }}
          />
        }
      />
    </div>
  );
}
