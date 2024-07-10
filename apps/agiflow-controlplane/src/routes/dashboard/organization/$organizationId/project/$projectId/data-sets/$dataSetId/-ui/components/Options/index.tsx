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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Pencil1Icon, DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import { apiClient } from '@/libs/api';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { DataSet } from '../../../../-ui/queries';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name must be at least 1 characters.',
  }),
});

interface OptionsProps {
  dataset: DataSet;
}
export const Options = ({ dataset }: OptionsProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId',
  });
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: dataset.name,
    },
  });

  const mutate = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema>) => {
      return apiClient.PATCH('/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}', {
        params: {
          path: {
            ...params,
          },
        },
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`data-set-${params.dataSetId}`],
      });
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => {
      return apiClient.DELETE('/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}', {
        params: {
          path: {
            ...params,
            dataDatasetId: dataset.id,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`data-sets-${params.projectId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`data-set-${params.dataSetId}`],
      });
      navigate({
        to: '/dashboard/organization/$organizationId/project/$projectId/data-sets',
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate(values);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button className='h-8 w-8 p-2' variant='ghost'>
            <DotsVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Model Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)} className='inline-flex w-full gap-2 p-2'>
            <Pencil1Icon className='icon-md' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => remove.mutate()} className='inline-flex w-full gap-2 p-2'>
            <TrashIcon className='icon-md' />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent className='overflow-y-auto'>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
              <h6>Edit version</h6>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input</FormLabel>
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
