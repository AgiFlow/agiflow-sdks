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
import { Prompt } from '../../../../-ui/queries';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Version must be at least 1 characters.',
  }),
});

interface EditPromptProps {
  prompt: Prompt;
}
export const EditPrompt = ({ prompt }: EditPromptProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId',
  });
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId/',
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: prompt.name,
    },
  });

  const mutate = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema>) => {
      return apiClient.PATCH('/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}', {
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
        queryKey: [`prompt-${params.promptId}`],
      });
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => {
      return apiClient.DELETE('/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}', {
        params: {
          path: {
            ...params,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`prompt-${params.promptId}`],
      });
      setOpen(false);
      navigate({
        to: '/dashboard/organization/$organizationId/project/$projectId/prompts',
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Version' {...field} />
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
