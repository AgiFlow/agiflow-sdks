import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button, FormControl, FormField, FormItem, FormMessage, Input } from '@agiflowai/frontend-web-ui';
import z from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { SearchSchema } from '../../validators';

const formSchema = z.object({
  name: z.string().min(0, {
    message: 'Name must be at least 2 characters.',
  }),
});

export const SearchInput = () => {
  const name = useSearch({
    from: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/`,
    select: s => SearchSchema.parse(s)?.name || '',
  });

  const navigate = useNavigate({
    from: `/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs`,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    navigate({
      search: values,
    });
  };

  return (
    <FormProvider {...form}>
      <form className='inline-flex w-full max-w-[300px] items-center gap-2' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='flex-1'>
              <FormControl>
                <Input placeholder='Search by name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant='ghost' className='h-10 w-10 p-2'>
          <MagnifyingGlassIcon />
        </Button>
      </form>
    </FormProvider>
  );
};
