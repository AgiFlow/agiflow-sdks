import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
  Badge,
} from '@agiflowai/frontend-web-ui';
import { useParams, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getLocalCurrencyByCents, formatMillis } from '@/libs';
import { SearchSchema } from '../../validations/search';
import { UserJourney } from '../UserJourney';
import { CostsLine } from '../CostsLine';
import { userSummaryQueryOptions, taskSummaryQueryOptions, stepSummaryQueryOptions } from '../../queries/index';

const getPercentage = (num?: number, total?: number) => {
  if (!num || !total) return 0;
  return Math.round((num / total) * 100);
};

export const Metrics = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/',
    select: s => SearchSchema.parse(s),
  });
  const { data } = useQuery(
    userSummaryQueryOptions({
      path: params,
      query: search,
    }),
  );
  const { data: taskData } = useQuery(
    taskSummaryQueryOptions({
      path: params,
      query: search,
    }),
  );
  const { data: stepData } = useQuery(
    stepSummaryQueryOptions({
      path: params,
      query: search,
    }),
  );
  return (
    <ResizablePanelGroup direction='vertical' className='min-h-[66vh] w-full rounded-lg'>
      <ResizablePanel defaultSize={30}>
        <ResizablePanelGroup direction='horizontal' className='w-full rounded-lg'>
          <ResizablePanel defaultSize={25}>
            <div>
              <CardHeader>
                <CardTitle>
                  <h5>{data?.data?.total || 0} Users</h5>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex w-full flex-row flex-wrap gap-2'>
                  <Badge variant='outline'>
                    Has issues: {getPercentage(data?.data?.problemsCount, data?.data?.total)}%
                  </Badge>
                </div>
              </CardContent>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <div>
              <CardHeader>
                <CardTitle>
                  <h5>{taskData?.data?.total || 0} tasks</h5>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex w-full flex-row flex-wrap gap-2'>
                  <Badge variant='outline'>
                    Risky: {getPercentage(taskData?.data?.requiredInputCount, taskData?.data?.total)}%
                  </Badge>
                  <Badge variant='outline'>
                    In Review: {getPercentage(taskData?.data?.inReviewCount, taskData?.data?.total)}%
                  </Badge>
                  <Badge variant='outline'>
                    Completed: {getPercentage(taskData?.data?.fixedCount, taskData?.data?.total)}%
                  </Badge>
                  <Badge variant='outline'>
                    Incompleted: {getPercentage(taskData?.data?.incompleteCount, taskData?.data?.total)}%
                  </Badge>
                </div>
              </CardContent>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={45}>
            <div>
              <CardHeader>
                <CardTitle>
                  <h5>Summary</h5>
                </CardTitle>
                <CardDescription />
              </CardHeader>
              <CardContent>
                <div className='flex w-full flex-row flex-wrap gap-2'>
                  <Badge variant='outline'>LLM Duration: {formatMillis(stepData?.data?.responseTime)}</Badge>
                  <Badge variant='outline'>LLM Cost: {getLocalCurrencyByCents(stepData?.data?.externalCost)}</Badge>
                  <Badge variant='outline'>Average Duration: {formatMillis(stepData?.data?.averageDuration)}</Badge>
                  <Badge variant='outline'>Average Cost: {getLocalCurrencyByCents(stepData?.data?.averageCost)}</Badge>
                </div>
              </CardContent>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70}>
        <Tabs defaultValue={'costs'} className='h-full pt-3'>
          <TabsList>
            <TabsTrigger value='costs'>Costs</TabsTrigger>
            <TabsTrigger value='task'>Task Journey</TabsTrigger>
          </TabsList>
          <TabsContent value='costs' className='h-full pb-4'>
            <CostsLine />
          </TabsContent>
          <TabsContent value='task' className='h-full pb-4'>
            <UserJourney />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
