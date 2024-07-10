import {
  Button,
  Sheet,
  SheetContent,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
} from '@agiflowai/frontend-web-ui';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { apiClient } from '@/libs/api';
import { PlusIcon } from '@radix-ui/react-icons';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export const NewDataset = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/',
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets',
  });
  const [isOpen, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const mutate = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema>) => {
      return apiClient.POST('/organizations/{organizationId}/projects/{projectId}/data-sets', {
        params: {
          path: params,
        },
        body: payload,
      });
    },
    onSuccess: data => {
      navigate({
        to: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId',
        params: {
          dataSetId: data?.data?.id || '',
        },
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate(values);
  };

  return (
    <>
      <Button variant='outline' onClick={() => setOpen(true)}>
        <PlusIcon />
        Add Dataset
      </Button>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
              <h6>Add new dataset</h6>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset name</FormLabel>
                    <FormControl>
                      <Input placeholder='Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='w-full text-md' type='submit' size='lg' disabled={mutate.isPending}>
                Submit
              </Button>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>
    </>
  );
};
