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
  Badge,
} from '@agiflowai/frontend-web-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useForm, FormProvider, useController } from 'react-hook-form';
import { apiClient } from '@/libs/api';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  version: z.string().min(1, {
    message: 'Version must be at least 1 characters.',
  }),
  template: z.string().min(2, {
    message: 'Template must be at least 2 characters.',
  }),
  system: z
    .string()
    .min(2, {
      message: 'System prompt must be at least 2 characters.',
    })
    .nullish(),
});

export const NewPrompt = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/prompts/',
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/project/$projectId/prompts',
  });
  const [isOpen, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const { field: templateField } = useController({
    name: 'template',
    control: form.control,
  });

  const schema = useMemo(() => {
    if (templateField.value) {
      try {
        const matched = templateField.value.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g);
        if (matched) {
          return matched.map(str => str.replace('{{', '').replace('}}', '').trim());
        }
      } catch (_) {
        return [];
      }
    }
    return [];
  }, [templateField.value]);

  const mutate = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema> & { schema: any }) => {
      return apiClient.POST('/organizations/{organizationId}/projects/{projectId}/prompts', {
        params: {
          path: params,
        },
        body: payload,
      });
    },
    onSuccess: data => {
      if (data.data) {
        navigate({
          to: '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId',
          params: {
            promptId: data?.data?.id,
          },
        });
      }
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate({
      ...values,
      schema: schema.reduce(
        (prev, cur) => ({
          ...prev,
          [cur]: {
            type: 'string',
            description: '',
          },
        }),
        {},
      ),
    });
  };

  return (
    <>
      <Button variant='outline' onClick={() => setOpen(true)}>
        <PlusIcon />
        Add Prompt
      </Button>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
              <h6>Add new prompt</h6>
              {mutate?.data?.error ? (
                <p className='text-error'>{(mutate.data as any)?.error?.message || 'Sorry, something is wrong!'}</p>
              ) : null}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt name</FormLabel>
                    <FormControl>
                      <Input placeholder='Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='version'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt version</FormLabel>
                    <FormControl>
                      <Input placeholder='Version' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='template'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Template</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Prompt {{placeholder}}' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {schema?.length ? (
                <div className='inline-flex w-full flex-wrap gap-2 py-2'>
                  {schema.map(token => (
                    <Badge key={token}>{token}</Badge>
                  ))}
                </div>
              ) : null}
              <FormField
                control={form.control}
                name='system'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormControl>
                      <Textarea placeholder='As ...' {...field} value={field.value || ''} />
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
