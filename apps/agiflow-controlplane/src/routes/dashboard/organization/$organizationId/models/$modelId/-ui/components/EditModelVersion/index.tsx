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
import { apiClient } from '@/libs/api';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useController, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { CONFIG_FIELDS, DEFAULT_LABELS } from '../../../../-ui/constants';
import { IModelVersions, IModel } from '../../../../-ui/queries';

const formSchema = z.object({
  vendor: z.coerce.number(),
  api_key: z
    .string()
    .min(2, {
      message: 'Api key must be presented.',
    })
    .nullish(),
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

interface EditModelVersionProps {
  model: IModel;
  modelVersion: NonNullable<IModelVersions[0]>;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}
export const EditModelVersion = ({ model, isOpen, setOpen, modelVersion }: EditModelVersionProps) => {
  const queryClient = useQueryClient();
  const params = useParams({
    from: '/dashboard/organization/$organizationId/models/$modelId/',
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: model.vendor,
      api_key: modelVersion.api_key,
      api_endpoint: modelVersion.api_endpoint,
      api_version: modelVersion.version,
      ...(modelVersion.extra || {}),
    },
  });
  const { field: vendorField } = useController({
    name: 'vendor',
    control: form.control,
  });

  const { fields, labels } = useMemo(() => {
    if (!vendorField.value) {
      return {
        fields: [],
        labels: DEFAULT_LABELS,
      };
    }
    const selected = CONFIG_FIELDS.find(item => item.vendor === Number(vendorField.value));
    return {
      fields: selected?.fields || [],
      labels: selected?.labels || DEFAULT_LABELS,
    };
  }, [vendorField.value]);

  const mutate = useMutation({
    mutationFn: ({ vendor: _, api_key, api_endpoint, api_version, ...extra }: z.infer<typeof formSchema>) => {
      return apiClient.PATCH('/organizations/{organizationId}/models/{modelId}/model-versions/{modelVersionId}', {
        params: {
          path: {
            ...params,
            modelVersionId: modelVersion.id,
          },
        },
        body: {
          api_key,
          api_endpoint,
          version: api_version,
          extra,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`model-${params.modelId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`model-versions-${params.modelId}`],
      });
      setOpen(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate(values);
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
      <SheetContent className='overflow-y-auto'>
        <FormProvider {...form}>
          <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
            <h6>Edit version</h6>
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
                          <Input placeholder='key...' {...field} value={field.value || ''} />
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
  );
};
