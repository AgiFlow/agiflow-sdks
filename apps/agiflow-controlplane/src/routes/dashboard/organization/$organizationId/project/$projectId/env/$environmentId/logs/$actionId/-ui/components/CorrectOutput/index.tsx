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
} from '@agiflowai/frontend-web-ui';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams, useMatchRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { apiClient } from '@/libs/api';
import { Step } from '../../queries';

const formSchema = z.object({
  correction: z.any(),
  score: z.coerce.number(),
});

interface CorrectOuputProps {
  step: Step;
}
export const CorrectOuput = ({ step }: CorrectOuputProps) => {
  const queryClient = useQueryClient();
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
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/steps/{stepId}',
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
  const { json, value } = useMemo(() => {
    try {
      const value = JSON.parse((step.correction as string) || step.output || '');
      return {
        value,
        json: true,
      };
    } catch (_) {
      return {
        value: step.output || '',
        json: false,
      };
    }
  }, [step.correction, step.output]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correction: value,
      score: 0.5,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const correction = json ? JSON.stringify(values.correction) : values.correction;
    mutate({ correction, score: values.score });
  };

  return (
    <>
      <Button size='sm' variant={step.correction ? 'outline' : 'default'} onClick={() => setOpen(true)}>
        Feedback&nbsp;
        <Pencil1Icon className='icon-md' />
      </Button>
      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent className='min-w-[50vw]'>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
              <h6>Output Correction</h6>
              <div className='flex flex-col gap-2'>
                <FormLabel className='text-xs'>
                  Please provide correct output which you can use to evaluate your prompt or fine-tune model
                </FormLabel>
                {json ? (
                  <FormField
                    control={form.control}
                    name={`correction`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            id={step.id}
                            value={JSON.stringify(field.value, null, 2)}
                            className='min-h-[400px]'
                            onChange={e => {
                              field.onChange(JSON.parse(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name={'correction'}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea {...field} className='min-h-[400px]' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <FormField
                control={form.control}
                name={'score'}
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
              <Button className='mt-4 w-full'>Submit</Button>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>
    </>
  );
};
