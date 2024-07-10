import { createLazyFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Badge, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@agiflowai/frontend-web-ui';
import { dataSetQueryOptions } from '../-ui/queries';
import { getDateTime } from '@/libs/datetime';
import { Nav } from './-ui/components/Nav';
import { DataChecks } from './-ui/components/DataChecks';
import { DataPoints } from './-ui/components/DataPoints';
import { DataSetSchema } from './-ui/components/Schema';
import { Options } from './-ui/components/Options';
import { useMemo } from 'react';

export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const search = Route.useSearch({
    select: (s: any) => s || {},
  });
  const navigate = Route.useNavigate();
  const { data } = useQuery(dataSetQueryOptions({ path: params }));
  const tab = useMemo(() => {
    return search?.tab || 'checks';
  }, [search]);
  return (
    <div className='flex w-full flex-1 flex-col gap-3'>
      <Nav dataSetId={params.dataSetId} />
      <div className='inline-flex w-full flex-wrap items-center gap-3'>
        <h4>{data?.data?.name}</h4>
        <div>
          <Badge variant='outline'>Updated at {getDateTime(data?.data?.updated_at)}</Badge>
        </div>
        {data?.data ? <Options dataset={data?.data} /> : null}
      </div>
      <Tabs
        className='w-full'
        defaultValue={tab}
        onValueChange={tab => {
          navigate({
            search: {
              ...search,
              tab,
            },
            replace: true,
          });
        }}
      >
        <TabsList>
          <TabsTrigger value='checks'>
            Validations{data?.data?.checksCount ? ` (${data?.data?.checksCount})` : ' (0)'}
          </TabsTrigger>
          <TabsTrigger value='points'>
            Data Points{data?.data?.pointsCount ? ` (${data?.data?.pointsCount})` : ' (0)'}
          </TabsTrigger>
          {data?.data?.schema ? <TabsTrigger value='schema'>Schema</TabsTrigger> : null}
        </TabsList>
        <Separator className='my-4' />
        <TabsContent value='checks'>{data?.data ? <DataChecks dataset={data?.data} /> : null}</TabsContent>
        <TabsContent value='points'>
          <DataPoints count={data?.data?.pointsCount || 0} schema={data?.data?.schema} />
        </TabsContent>
        <TabsContent value='schema'>{data?.data ? <DataSetSchema dataset={data?.data} /> : null}</TabsContent>
      </Tabs>
    </div>
  );
}
