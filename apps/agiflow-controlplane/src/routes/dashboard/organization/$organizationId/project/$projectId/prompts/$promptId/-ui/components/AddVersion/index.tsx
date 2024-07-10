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
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { apiClient } from '@/libs/api';
import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, useController } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  version: z.string().min(1, {
    message: 'Version must be at least 1 characters.',
  }),
  temperature: z.coerce.number().default(0),
  template: z.string().min(2, {
    message: 'Template must be at least 2 characters.',
  }),
  system: z
    .string()
    .min(2, {
      message: 'System prompt must be at least 2 characters.',
    })
    .nullish(),
  schema: z.any().nullish(),
});

export const AddPromptVersion = () => {
  const queryClient = useQueryClient();
  const [isOpen, setOpen] = useState(false);
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/prompts/$promptId/',
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
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

  const { field: schemaField } = useController({
    name: 'schema',
    control: form.control,
  });

  useEffect(() => {
    const clone = { ...(schemaField.value || {}) };
    const existingSchema = Object.keys(schemaField.value || {});
    let edited = false;
    schema.forEach(key => {
      if (!existingSchema.includes(key)) {
        clone[key] = { type: 'string', description: '' };
        edited = true;
      }
    });
    if (edited) {
      schemaField.onChange(clone);
    }
  }, [schemaField, schema]);

  const mutate = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema>) => {
      return apiClient.POST('/organizations/{organizationId}/projects/{projectId}/prompts/{promptId}/prompt-versions', {
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate(values);
  };

  return (
    <>
      <Button className='h-8 w-8 p-2' variant='outline' onClick={() => setOpen(true)}>
        <PlusIcon />
      </Button>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent className='overflow-y-auto'>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
              <h6>Add version</h6>
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
              <FormField
                control={form.control}
                name='temperature'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt temperature</FormLabel>
                    <FormControl>
                      <Input placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className='mt-3 grid gap-3'>
                <h6>Prompt template schema</h6>
                {Object.keys(schemaField.value || {}).map(field => (
                  <div key={field}>
                    <div className='inline-flex w-full'>
                      <FormLabel className='flex-1 underline'>{field}</FormLabel>
                      <Button
                        className='size-7 p-1'
                        variant='destructive'
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          const clone = { ...schemaField.value };
                          delete clone[field];
                          schemaField.onChange(clone);
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`schema.${field}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Type</FormLabel>
                          <FormControl>
                            <Input placeholder='...' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`schema.${field}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>Description</FormLabel>
                          <FormControl>
                            <Input placeholder='...' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
