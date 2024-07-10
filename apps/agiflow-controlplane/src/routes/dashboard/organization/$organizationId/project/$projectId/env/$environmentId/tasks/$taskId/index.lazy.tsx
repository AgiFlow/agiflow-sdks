import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Separator,
  AlertTitle,
  Switch,
  Button,
  Sheet,
  SheetContent,
  MeasuredContainer,
} from '@agiflowai/frontend-web-ui';
import { ReactFlowProvider } from 'reactflow';
import { PLUGIN_CATEGORY_NAMES } from '@/constants/plugin';
import z from 'zod';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import { taskQueryOptions } from './-ui/queries';
import { StepComp } from '../../logs/$actionId/-ui/components/Step';
import { Action } from './-ui/components/Action';
import { Header } from './-ui/components/Header';
import { Nav } from './-ui/components/Nav';
import { Workflow } from './-ui/components/Workflow';
import { actionViewAtom } from './-ui/states/actionView';

const SearchSchema = z.object({
  stepId: z.string().nullish(),
});
export const Route = createLazyFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId/',
)({
  component: Dashboard,
});

function Dashboard() {
  const params = Route.useParams();
  const [actionView, setActionView] = useAtom(actionViewAtom);
  const { data } = useQuery(taskQueryOptions({ path: params }));
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId',
  });
  const stepId = Route.useSearch({
    select: s => SearchSchema.parse(s).stepId,
  });
  const [filter, setFilter] = useState<{ feedback?: boolean; error?: boolean; category?: number | null }>({
    error: false,
    feedback: false,
    category: null,
  });

  const { step, categories, action } = useMemo(() => {
    const steps = (data?.data?.actions || []).map(action => action.steps).flat();
    const categories = Array.from(
      new Set(steps.map(step => step.evaluations.map(evaluation => evaluation.category)).flat()),
    );
    const step = steps.find(step => step.id === stepId);
    return {
      step,
      action: data?.data?.actions.find(action => action.id === step?.action_id),
      categories,
    };
  }, [data, stepId]);

  useEffect(() => {
    if (!stepId && data?.data?.actions) {
      const steps = (data?.data?.actions || [])
        .map(action => action.steps)
        .flat()
        .filter(step => !!step.is_llm);
      navigate({
        search: {
          stepId: steps?.[0]?.id,
        },
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, data]);

  if (!data?.data) return null;

  return (
    <div className='grid w-full gap-4 md:p-4 lg:p-6'>
      <Nav taskId={params.taskId} />
      <Header task={data.data} />
      <Separator />
      <div className='grid w-full grid-cols-12 gap-4'>
        <div className='col-span-8 min-h-[200px] rounded-md border-2 border-border'>
          {step ? (
            <StepComp
              step={step as any}
              topSlot={
                <Button className='h-9 w-9 rounded-full p-2' variant={'ghost'} onClick={() => setActionView(action)}>
                  <EyeOpenIcon />
                </Button>
              }
            />
          ) : (
            <div className='p-3'>
              <AlertTitle>Oops, this section is empty!</AlertTitle>
            </div>
          )}
        </div>
        <div className='col-span-4'>
          <div className='inline-flex w-full items-center gap-2 pb-3'>
            <Switch
              checked={!!filter?.feedback}
              onCheckedChange={() =>
                filter?.feedback ? setFilter({ feedback: false }) : setFilter({ feedback: true })
              }
            />
            <label className='text-xs'>Show feedbacks</label>
          </div>
          <div className='inline-flex w-full items-center gap-2 pb-3'>
            <div className='inline-flex flex-1 items-center gap-2'>
              <Switch
                checked={!!filter?.error}
                onCheckedChange={() =>
                  filter?.error
                    ? setFilter({ error: false, category: null })
                    : setFilter({ error: true, category: null })
                }
              />
              <label className='text-xs'>Show issues only</label>
            </div>
            {filter?.error ? (
              <Select
                onValueChange={value => {
                  if (value === 'null') {
                    setFilter({ error: true, category: null });
                  } else {
                    setFilter({ error: true, category: Number(value) });
                  }
                }}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value='null'>All</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={`${category}`}>
                        {PLUGIN_CATEGORY_NAMES[category as number]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : null}
          </div>
          {data.data.actions.map(action => (
            <Action key={action.id} action={action} stepId={stepId} filter={filter} />
          ))}
        </div>
      </div>
      <Sheet open={!!actionView} onOpenChange={() => setActionView(undefined)}>
        <SheetContent className='w-full sm:max-w-full lg:max-w-[90%]'>
          <MeasuredContainer className='min-h-screen w-full'>
            {actionView?.steps ? (
              <ReactFlowProvider>
                <Workflow stepId={stepId} steps={actionView.steps as any[]} />
              </ReactFlowProvider>
            ) : null}
          </MeasuredContainer>
        </SheetContent>
      </Sheet>
    </div>
  );
}
