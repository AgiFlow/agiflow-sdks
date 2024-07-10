import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Input, Button, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@agiflowai/frontend-web-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/libs/api';
import { z } from 'zod';
import { projectQueryOptions } from '../../../../-ui/queries';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export const Form = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId',
  });
  const { data } = useSuspenseQuery(projectQueryOptions({ path: params }));
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.data?.name,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await apiClient.PATCH(`/organizations/{organizationId}/projects/{projectId}`, {
      params: {
        path: params,
      },
      body: values,
    });
    queryClient.invalidateQueries({
      queryKey: [`project-${params.projectId}`],
    });
    queryClient.invalidateQueries({
      queryKey: ['organizations'],
    });
  };

  return (
    <FormProvider {...form}>
      <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input placeholder='Name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='w-full text-md' type='submit' size='lg'>
          Save
        </Button>
      </form>
    </FormProvider>
  );
};
