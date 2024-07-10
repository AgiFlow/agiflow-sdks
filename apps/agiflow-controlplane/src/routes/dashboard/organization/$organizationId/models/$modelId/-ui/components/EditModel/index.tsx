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
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { apiClient } from '@/libs/api';
import { useState, useMemo } from 'react';
import { Pencil1Icon, Cross1Icon, DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useController, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { CONFIG_FIELDS, DEFAULT_LABELS } from '../../../../-ui/constants';
import { IModel } from '../../../../-ui/queries';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  vendor: z.coerce.number(),
});

interface EditModelProps {
  model: IModel;
}
export const EditModel = ({ model }: EditModelProps) => {
  const queryClient = useQueryClient();
  const params = useParams({
    from: '/dashboard/organization/$organizationId/models/$modelId/',
  });
  const navigate = useNavigate({
    from: '/dashboard/organization/$organizationId/models/$modelId',
  });
  const [isOpen, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: model.name,
      vendor: model.vendor,
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

  const { MODEL_OPTIONS, labels } = useMemo(() => {
    const FIELDS = CONFIG_FIELDS.map(item =>
      (item.models || []).map(([name, type]) => ({ value: name, name: `${name} - ${type}` })),
    ).reduce((prev, cur) => [...prev, ...cur], []);
    if (!vendorField.value) {
      return {
        MODEL_OPTIONS: FIELDS,
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
      labels: selected?.labels || DEFAULT_LABELS,
    };
  }, [vendorField.value, modelField.value]);

  const mutate = useMutation({
    mutationFn: ({ name, vendor }: z.infer<typeof formSchema>) => {
      return apiClient.PATCH('/organizations/{organizationId}/models/{modelId}', {
        params: {
          path: params,
        },
        body: {
          name,
          vendor,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`model-${params.modelId}`],
      });
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => {
      return apiClient.DELETE('/organizations/{organizationId}/models/{modelId}', {
        params: {
          path: {
            ...params,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`model-versions-${params.modelId}`],
      });
      navigate({
        to: '/dashboard/organization/$organizationId/models',
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
              <h6>Edit model</h6>
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
                            <SelectValue placeholder='Name' />
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
                              <SelectValue placeholder='abc' />
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
