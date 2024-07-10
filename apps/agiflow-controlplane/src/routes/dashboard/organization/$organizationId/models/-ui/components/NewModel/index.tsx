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
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@agiflowai/frontend-web-ui';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { apiClient } from '@/libs/api';
import { useState, useMemo } from 'react';
import { PlusIcon, Cross1Icon } from '@radix-ui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useController, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { CONFIG_FIELDS, DEFAULT_LABELS } from '../../constants';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  vendor: z.coerce.number(),
  api_key: z.string().min(2, {
    message: 'Api key must be presented.',
  }),
  api_endpoint: z
    .string()
    .min(2, {
      message: 'Endpoint is required.',
    })
    .nullish(),
  api_version: z.string().nullish(),
  vertex_project: z.string().nullish(),
  vertex_location: z.string().nullish(),
  vertex_credentials: z.string().nullish(),
});

export const NewModel = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/models/',
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/models',
  });
  const [isOpen, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });
  const { field: modelField } = useController({
    name: 'name',
    control: form.control,
  });
  const { field: vendorField } = useController({
    name: 'vendor',
    control: form.control,
  });

  const VENDOR_OPTIONS = useMemo(() => {
    const FIELDS = CONFIG_FIELDS.map(item => ({ value: item.vendor, name: item.name }));
    if (!modelField.value) {
      return FIELDS;
    }
    const filteredProviders = CONFIG_FIELDS.filter(
      item => !item.models || item.models.findIndex(x => x[0] === modelField.value) > -1,
    );
    return filteredProviders.map(item => ({ value: item.vendor, name: item.name }));
  }, [modelField.value, vendorField.value]);

  const { MODEL_OPTIONS, fields, labels } = useMemo(() => {
    const FIELDS = CONFIG_FIELDS.map(item =>
      (item.models || []).map(([name, type]) => ({ value: name, name: `${name} - ${type}` })),
    ).reduce((prev, cur) => [...prev, ...cur], []);
    if (!vendorField.value) {
      return {
        MODEL_OPTIONS: FIELDS,
        fields: [],
        labels: DEFAULT_LABELS,
      };
    }
    const filteredModels = CONFIG_FIELDS.filter(item => item.vendor === Number(vendorField.value));
    const options = filteredModels
      .map(item => (item.models || []).map(([name, type]) => ({ value: name, name: `${name} - ${type}` })))
      .reduce((prev, cur) => [...prev, ...cur], []);
    const selected = CONFIG_FIELDS.find(item => item.vendor === Number(vendorField.value));
    return {
      MODEL_OPTIONS: options,
      fields: selected?.fields || [],
      labels: selected?.labels || DEFAULT_LABELS,
    };
  }, [vendorField.value, modelField.value]);

  const mutate = useMutation({
    mutationFn: ({ api_key, api_endpoint, api_version, name, vendor, ...extra }: z.infer<typeof formSchema>) => {
      return apiClient.POST('/organizations/{organizationId}/models', {
        params: {
          path: params,
        },
        body: {
          api_key,
          api_version,
          api_endpoint,
          name,
          vendor,
          extra,
        },
      });
    },
    onSuccess: data => {
      if (data?.data) {
        navigate({
          to: '/dashboard/organization/$organizationId/models/$modelId',
          params: {
            modelId: data?.data?.id,
          },
        });
      }
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate(values);
  };

  return (
    <>
      <Button variant='outline' onClick={() => setOpen(true)}>
        <PlusIcon />
        Add Model
      </Button>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent className='overflow-y-auto'>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
              <h6>Add new model</h6>
              <FormField
                control={form.control}
                name='vendor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.vendor}</FormLabel>
                    <FormControl>
                      <Select {...field} value={field.value?.toString()} onValueChange={value => field.onChange(value)}>
                        <div className='inline-flex w-full items-center gap-2'>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Provider name' />
                          </SelectTrigger>
                          {vendorField.value ? (
                            <Button
                              variant='ghost'
                              className='h-9 w-9 p-2'
                              onClick={() => vendorField.onChange(undefined)}
                            >
                              <Cross1Icon />
                            </Button>
                          ) : null}
                        </div>
                        <SelectContent>
                          {VENDOR_OPTIONS.map(vendor => (
                            <SelectItem key={vendor.value} value={vendor.value.toString()}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {MODEL_OPTIONS.length ? (
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{labels.name}</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value?.toString()}
                          onValueChange={value => field.onChange(value)}
                        >
                          <div className='inline-flex w-full items-center gap-2'>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder={'abc'} />
                            </SelectTrigger>
                            {modelField.value ? (
                              <Button
                                variant='ghost'
                                className='h-9 w-9 p-2'
                                onClick={() => modelField.onChange(undefined)}
                              >
                                <Cross1Icon />
                              </Button>
                            ) : null}
                          </div>
                          <SelectContent>
                            {MODEL_OPTIONS.map(vendor => (
                              <SelectItem key={vendor.value} value={vendor.value.toString()}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{labels.name}</FormLabel>
                      <FormControl>
                        <Input placeholder='abc' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {fields.map(field => {
                if (field === 'api_base') {
                  return (
                    <FormField
                      control={form.control}
                      name='api_endpoint'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels.api_base}</FormLabel>
                          <FormControl>
                            <Textarea placeholder='https://...' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                if (field === 'api_key') {
                  return (
                    <FormField
                      control={form.control}
                      name='api_key'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels.api_key}</FormLabel>
                          <FormControl>
                            <Input placeholder='key...' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                if (field === 'api_version') {
                  return (
                    <FormField
                      control={form.control}
                      name='api_version'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels.api_version}</FormLabel>
                          <FormControl>
                            <Input placeholder='version...' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                if (field === 'vertex_project') {
                  return (
                    <FormField
                      control={form.control}
                      name='vertex_project'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels.vertex_project}</FormLabel>
                          <FormControl>
                            <Input placeholder='project name' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                if (field === 'vertex_location') {
                  return (
                    <FormField
                      control={form.control}
                      name='vertex_location'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels.vertex_location}</FormLabel>
                          <FormControl>
                            <Input placeholder='project location' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                if (field === 'vertex_credentials') {
                  return (
                    <FormField
                      control={form.control}
                      name='vertex_credentials'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels.vertex_credentials}</FormLabel>
                          <FormControl>
                            <Textarea placeholder='project credentials' {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                return null;
              })}
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
