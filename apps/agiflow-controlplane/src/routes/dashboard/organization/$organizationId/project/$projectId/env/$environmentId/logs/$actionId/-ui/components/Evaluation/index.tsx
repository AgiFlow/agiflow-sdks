import {
  Button,
  Sheet,
  SheetContent,
  Textarea,
  Input,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  cn,
} from '@agiflowai/frontend-web-ui';
import { useParams, useMatchRoute } from '@tanstack/react-router';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/libs/api';
import { z } from 'zod';
import { PLUGIN_CATEGORIES } from '../../constants';
import { Step } from '../../queries';

interface EvaluationProps {
  step: Step;
}

export const Evaluation = ({ step }: EvaluationProps) => {
  const queryClient = useQueryClient();
  const formSchema = useMemo(() => {
    return step.evaluations
      .map(evaluation =>
        z.object({
          [evaluation.id]: z.object({
            corrected_score: z.coerce.number(),
            corrected_reason: z.any(),
          }),
        }),
      )
      .reduce((prev, cur) => prev.merge(cur), z.object({}));
  }, [step]);
  const [open, setOpen] = useState(false);
  const routeMatch = useMatchRoute();
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId',
  });
  const taskParams = routeMatch({
    to: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/tasks/$taskId',
    fuzzy: true,
  }) as unknown as { taskId?: string };
  const actionParams = routeMatch({
    to: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/$actionId',
    fuzzy: true,
  }) as unknown as { actionId?: string };
  const { mutate } = useMutation({
    mutationFn: (payload: any) => {
      return apiClient.PATCH(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/{stepId}/evaluations',
        {
          params: {
            path: {
              ...params,
              stepId: step.id,
            },
          },
          body: payload,
        },
      );
    },
    onSuccess: () => {
      if (taskParams?.taskId) {
        queryClient.invalidateQueries({
          queryKey: [`task-${taskParams?.taskId}`],
        });
      }
      if (actionParams?.actionId) {
        queryClient.invalidateQueries({
          queryKey: [`action-${actionParams?.actionId}`],
        });
      }
      setOpen(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: step.evaluations
      .map(evaluation => ({
        [evaluation.id]: {
          corrected_score: evaluation.score,
          corrected_reason: evaluation.reason,
        },
      }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {}) as any,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate(
      Object.entries(values).map(([key, value]) => ({
        evaluationId: key,
        ...value,
      })),
    );
  };

  return (
    <>
      {step?.evaluations?.length ? (
        <div className='w-full'>
          <div className='inline-flex w-full items-end'>
            <label className='flex-1 text-sm font-bold underline'>Evaluations</label>
            <Button className='h-8 w-8 p-2' variant='outline' onClick={() => setOpen(true)}>
              <Pencil1Icon />
            </Button>
          </div>
          <div className='mt-1 w-full rounded-md bg-background-shade p-3'>
            {(step?.evaluations || [])
              .filter(x => x.category !== 1)
              .map(evaluation => (
                <div key={evaluation.id} className='flex flex-col gap-2 text-xs'>
                  <p className='text-xs'>
                    <b className={cn(evaluation?.is_problematic ? 'text-destructive' : undefined, 'italic underline')}>
                      {PLUGIN_CATEGORIES[evaluation.category as any]}
                    </b>
                  </p>
                  <p>
                    <b>Score:</b> {evaluation.score}
                  </p>
                  <p>
                    <b>Reason:</b> {evaluation.reason}
                  </p>
                  {evaluation?.corrected_score ? (
                    <p className='text-xs'>
                      <b className='text-primary'>Corrected Score:&nbsp;</b>
                      <span>{evaluation.corrected_score}</span>
                    </p>
                  ) : null}
                  {evaluation?.corrected_reason ? (
                    <p className='text-xs'>
                      <b className='text-primary'>Corrected Reason:&nbsp;</b>
                      <span>{evaluation.corrected_reason}</span>
                    </p>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      ) : null}
      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent className='flex min-w-[50vw] flex-col gap-4'>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
              <h6>Re-evaluate</h6>
              {(step?.evaluations || [])
                .filter(x => x.category !== 1)
                .map(evaluation => (
                  <div key={evaluation.id} className='flex flex-col gap-2 text-xs'>
                    <FormField
                      control={form.control}
                      name={`${evaluation.id}.corrected_score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Score</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${evaluation.id}.corrected_reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Reason</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              <Button className='mt-4 w-full'>Submit</Button>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>
    </>
  );
};
