import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Input, Button, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@agiflowai/frontend-web-ui';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/libs/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { isAuthenticated } from '@/libs/supabase';
import { queryClient } from '@/libs/tanstackQuery';
import { useEffect } from 'react';
import { orgsQueryOptions } from './-ui/queries';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export const Route = createFileRoute('/dashboard/')({
  loader: () => queryClient.ensureQueryData(orgsQueryOptions),
  beforeLoad: async ({ location }) => {
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { data, refetch, isFetching } = useSuspenseQuery(orgsQueryOptions);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await apiClient.POST(`/organizations`, {
      body: values,
    });
    refetch();
  };

  useEffect(() => {
    const org = data?.data?.[0];
    if (!org) return;
    navigate({
      to: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId`,
      params: {
        organizationId: org.id,
        projectId: org.projects[0]?.id,
        environmentId: org.projects?.[0]?.environments?.[0]?.id,
      },
    });
  }, [data, navigate]);

  if (isFetching) {
    return null;
  }

  if (data?.data?.length) {
    return null;
  }

  return (
    <div className='flex size-full min-h-screen flex-col items-center justify-center bg-background'>
      <FormProvider {...form}>
        <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <h2>Welcome to AGIFlow</h2>
          <h6 className='pb-3'>Please add your organisation to get started!</h6>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input placeholder='Name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className='w-full text-md' type='submit' size='lg'>
            Next
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
