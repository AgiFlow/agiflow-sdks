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
  Textarea,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Pencil1Icon, DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import { apiClient } from '@/libs/api';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, useController } from 'react-hook-form';
import { z } from 'zod';
import { DataPoints } from '../../queries';

const formSchema = z.object({
  input: z.string().min(1, {
    message: 'Version must be at least 1 characters.',
  }),
  output: z.string().min(2, {
    message: 'Template must be at least 2 characters.',
  }),
  variables: z.any().nullish(),
});

interface EditPointProps {
  point: NonNullable<DataPoints[0]>;
}
export const EditPoint = ({ point }: EditPointProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setOpen] = useState(false);
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: point.input,
      output: point.output,
      variables: point.variables,
    },
  });
  const { field: variablesField } = useController({
    name: 'variables',
    control: form.control,
  });

  const mutate = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema>) => {
      return apiClient.PATCH(
        '/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-points/{dataPointId}',
        {
          params: {
            path: {
              ...params,
              dataPointId: point.id,
            },
          },
          body: payload,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`data-points-${params.dataSetId}`],
      });
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => {
      return apiClient.DELETE(
        '/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-points/{dataPointId}',
        {
          params: {
            path: {
              ...params,
              dataPointId: point.id,
            },
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`data-points-${params.dataSetId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`data-set-${params.dataSetId}`],
      });
      setOpen(false);
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
                name='input'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Input' className='min-h-[200px]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='output'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Output' className='min-h-[200px]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='mt-3 grid gap-3'>
                {Object.keys(variablesField.value || {}).map(key => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`variables.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>{key}</FormLabel>
                        <FormControl>
                          <Input placeholder='...' {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
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
