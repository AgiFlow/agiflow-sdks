import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Sheet,
  SheetContent,
  Input,
  Button,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Alert,
  AlertDescription,
} from '@agiflowai/frontend-web-ui';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from '@tanstack/react-router';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/libs/api';
import { z } from 'zod';
import { useState } from 'react';
import { PlusIcon } from '@radix-ui/react-icons';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export const NewEnvironment = () => {
  const [isOpen, setOpen] = useState(false);
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId',
  });
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });
  const mutate = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return apiClient.POST(`/organizations/{organizationId}/projects/{projectId}/environments`, {
        params: {
          path: params,
        },
        body: values,
      });
    },
    onSuccess: data => {
      if (!data?.error) {
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: [`environments-${params.projectId}`],
        });
        queryClient.invalidateQueries({
          queryKey: [`organizations`],
        });
      }
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate.mutate(values);
  };

  return (
    <>
      <Card className='col-span-1 cursor-pointer hover:bg-background-shade' onClick={() => setOpen(true)}>
        <CardHeader>
          <CardTitle className='text-lg'>New Environment</CardTitle>
          <CardContent className='flex items-center justify-center pt-3'>
            <PlusIcon className='icon-xlg' />
          </CardContent>
        </CardHeader>
      </Card>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4 pt-3' onSubmit={form.handleSubmit(onSubmit)}>
              {mutate?.data?.error ? (
                <Alert>
                  <AlertDescription>{(mutate?.data as any)?.error?.message}</AlertDescription>
                </Alert>
              ) : null}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment name</FormLabel>
                    <FormControl>
                      <Input placeholder='Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='w-full text-md' type='submit' size='lg'>
                Submit
              </Button>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>
    </>
  );
};
