import { ReactNode, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Button,
} from '@agiflowai/frontend-web-ui';
import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useController, FormProvider } from 'react-hook-form';
import { apiClient } from '@/libs';
import { z } from 'zod';
import { toast } from 'sonner';
import { DataSet } from '../../../../-ui/queries';
import { modelsQueryOptions, modelVersionsQueryOptions } from '../../../../../../../models/-ui/queries';
import { promptsQueryOptions, promptVersionsQueryOptions } from '../../../../../prompts/-ui/queries';

const formSchema = z.object({
  model_id: z.string(),
  prompt_id: z.string(),
  model_version_id: z.string(),
  prompt_version_id: z.string(),
  mapper: z.any(),
});

interface RunValidationProps {
  children: (props: { open: boolean; setOpen: (open: boolean) => void }) => ReactNode;
  dataset: DataSet;
}
export const RunValidation = ({ children, dataset }: RunValidationProps) => {
  const queryClient = useQueryClient();
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/data-sets/$dataSetId/',
  });
  const { data: modelsData } = useQuery(modelsQueryOptions({ path: params }));
  const { data: promptsData } = useQuery(promptsQueryOptions({ path: params }));
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { field: modelField } = useController({
    name: 'model_id',
    control: form.control,
  });
  const { field: promptField } = useController({
    name: 'prompt_id',
    control: form.control,
  });
  const { field: promptVersionField } = useController({
    name: 'prompt_version_id',
    control: form.control,
  });
  const { field: mapperField } = useController({
    name: 'mapper',
    control: form.control,
  });
  const { data: modelVersionsData } = useQuery(
    modelVersionsQueryOptions({ path: { ...params, modelId: modelField.value || '' } }),
  );
  const { data: promptVersionsData } = useQuery(
    promptVersionsQueryOptions({ path: { ...params, promptId: promptField.value || '' } }),
  );

  const { missMatchKeys, mapping, datasetOptions } = useMemo(() => {
    const promptVersion = (promptVersionsData?.data || []).find(v => v.id === promptVersionField.value);
    const promptVersionSchemaKeys = Object.keys(promptVersion?.schema || {});
    const datasetSchemaKeys = Object.keys(dataset?.schema || {});
    const missMatchKeys = promptVersionSchemaKeys.filter(key => !datasetSchemaKeys.includes(key));
    const mapping = promptVersionSchemaKeys
      .map(key => ({ [key]: datasetSchemaKeys.find(x => x === key) }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {});
    const datasetOptions = datasetSchemaKeys.map(key => ({
      value: key,
      name: key,
    }));
    return {
      mapping,
      missMatchKeys,
      datasetOptions,
    };
  }, [dataset?.schema, promptVersionsData, promptVersionField.value]);

  useEffect(() => {
    mapperField.onChange(mapping);
  }, [JSON.stringify(mapping)]);

  const [open, setOpen] = useState(false);

  const create = useMutation({
    mutationFn: (payload: z.infer<typeof formSchema>) => {
      return apiClient.POST('/organizations/{organizationId}/projects/{projectId}/data-sets/{dataSetId}/data-checks', {
        params: {
          path: params,
        },
        body: payload,
      });
    },
    onSuccess: data => {
      if (data?.error) {
        toast.error((data as any)?.error?.message);
      } else {
        queryClient.invalidateQueries({
          queryKey: [`data-checks-${params.dataSetId}`],
        });
        queryClient.invalidateQueries({
          queryKey: [`data-set-${params.dataSetId}`],
        });
      }
      setOpen(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    create.mutate(values);
  };

  return (
    <>
      {children({ open, setOpen })}
      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          {dataset?.pointsCount ? (
            <FormProvider {...form}>
              <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
                <div className='flex w-full flex-col gap-3'>
                  <h6>New Validation Run</h6>
                </div>
                <FormField
                  control={form.control}
                  name='model_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value?.toString()}
                          onValueChange={value => field.onChange(value)}
                        >
                          <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Model' />
                          </SelectTrigger>
                          <SelectContent>
                            {(modelsData?.data || []).map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {modelField.value && modelVersionsData?.data ? (
                  <FormField
                    control={form.control}
                    name='model_version_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Version</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            value={field.value?.toString()}
                            onValueChange={value => field.onChange(value)}
                          >
                            <SelectTrigger className='w-[180px]'>
                              <SelectValue placeholder='Model Version' />
                            </SelectTrigger>
                            <SelectContent>
                              {(modelVersionsData?.data || []).map(model => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.version}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                <FormField
                  control={form.control}
                  name='prompt_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value?.toString()}
                          onValueChange={value => field.onChange(value)}
                        >
                          <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Prompt' />
                          </SelectTrigger>
                          <SelectContent>
                            {(promptsData?.data || []).map(prompt => (
                              <SelectItem key={prompt.id} value={prompt.id}>
                                {prompt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {promptField.value && promptVersionsData?.data ? (
                  <FormField
                    control={form.control}
                    name='prompt_version_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt Version</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            value={field.value?.toString()}
                            onValueChange={value => field.onChange(value)}
                          >
                            <SelectTrigger className='w-[180px]'>
                              <SelectValue placeholder='Prompt Version' />
                            </SelectTrigger>
                            <SelectContent>
                              {(promptVersionsData?.data || []).map(prompt => (
                                <SelectItem key={prompt.id} value={prompt.id}>
                                  {prompt.version}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                {missMatchKeys.length ? (
                  <>
                    <p className='text-sm text-mono-light'>
                      Prompt schema does not match dataset schema. Please map prompt keys to the right dataset keys.
                    </p>
                    {Object.keys(mapperField.value || {}).map(key => (
                      <div key={key} className='inline-flex w-full items-center gap-2'>
                        <h6 className='flex-1'>* {key}</h6>
                        <FormField
                          control={form.control}
                          name={`mapper.${key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  {...field}
                                  value={field.value?.toString()}
                                  onValueChange={value => field.onChange(value)}
                                >
                                  <SelectTrigger className='w-[180px]'>
                                    <SelectValue placeholder='Key' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {datasetOptions.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </>
                ) : null}
                <Button>Run validation</Button>
              </form>
            </FormProvider>
          ) : (
            <div>
              <h6>Invalid Action</h6>
              <p className='text-sm'>Please upload your data or add new data point from traces/feedbacks first!</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
