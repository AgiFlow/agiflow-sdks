import {
  Button,
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
} from '@agiflowai/frontend-web-ui';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useController, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { IModels, modelVersionsQueryOptions } from '../../../../../../../../models/-ui/queries';

const formSchema = z.object({
  modelId: z.string(),
  modelVersionId: z.string(),
});

interface FormProps {
  models: IModels;
  submitting: boolean;
  onSubmit: (payload: z.infer<typeof formSchema>) => void;
}
export const Form = ({ models, submitting, onSubmit }: FormProps) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/plugins/',
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { field: modelField } = useController({
    name: 'modelId',
    control: form.control,
  });
  const { data: modelVersionsData } = useQuery(
    modelVersionsQueryOptions({ path: { ...params, modelId: modelField.value } }),
  );

  const { field: vendorField } = useController({
    name: 'modelVersionId',
    control: form.control,
  });

  useEffect(() => {
    if (modelVersionsData?.data?.length) {
      vendorField.onChange(modelVersionsData?.data[0].id);
    }
  }, [modelVersionsData]);

  const MODEL_OPTIONS = useMemo(() => {
    return models.map(model => ({ value: model.id, name: model.name }));
  }, [models]);

  const VERSIONS_OPTIONS = useMemo(() => {
    return (modelVersionsData?.data || []).map(model => ({ value: model.id, name: model.version }));
  }, [modelVersionsData]);

  return (
    <FormProvider {...form}>
      <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
        <h6>Add new model</h6>
        <FormField
          control={form.control}
          name='modelId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Select {...field} value={field.value?.toString()} onValueChange={value => field.onChange(value)}>
                  <div className='inline-flex w-full items-center gap-2'>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Model' />
                    </SelectTrigger>
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
        <FormField
          control={form.control}
          name='modelVersionId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Version</FormLabel>
              <FormControl>
                <Select {...field} value={field.value?.toString()} onValueChange={value => field.onChange(value)}>
                  <div className='inline-flex w-full items-center gap-2'>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Model Version' />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {VERSIONS_OPTIONS.map(vendor => (
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
        <Button className='w-full text-md' type='submit' size='lg' disabled={submitting}>
          Submit
        </Button>
      </form>
    </FormProvider>
  );
};
