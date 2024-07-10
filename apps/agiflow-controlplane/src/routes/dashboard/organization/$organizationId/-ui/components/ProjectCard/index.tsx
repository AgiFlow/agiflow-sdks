import { Link } from '@tanstack/react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  Sheet,
  SheetContent,
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  CardContent,
} from '@agiflowai/frontend-web-ui';
import { DotsVerticalIcon, TrashIcon, OpenInNewWindowIcon } from '@radix-ui/react-icons';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { apiClient } from '@/libs/api';
import { z } from 'zod';
import { Project } from '../../queries';

interface IProjectCardProps {
  project: Project;
}
export const ProjectCard = ({ project }: IProjectCardProps) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });
  const [isOpen, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const formSchema = z.object({
    name: z
      .string()
      .min(2, {
        message: 'Name must be at least 2 characters.',
      })
      .refine(
        name => {
          return name === project.name;
        },
        {
          message: 'Name does not match',
        },
      ),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async () => {
    await apiClient.DELETE(`/organizations/{organizationId}/projects/{projectId}`, {
      params: {
        path: {
          ...params,
          projectId: project.id,
        },
      },
    });
    setOpen(false);
    queryClient.invalidateQueries({
      queryKey: [`projects-${params.organizationId}`],
    });
    queryClient.invalidateQueries({
      queryKey: [`organizations`],
    });
  };

  return (
    <>
      <Card key={project.id} className='col-span-1'>
        <CardHeader>
          <CardTitle className='text-lg'>{project.name}</CardTitle>
        </CardHeader>
        <CardContent />
        <CardFooter className='inline-flex w-full items-end justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button className='h-8 w-8 rounded-full p-0' variant='outline'>
                <DotsVerticalIcon className='icon-md' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link
                from='/dashboard/organization/$organizationId'
                to='/dashboard/organization/$organizationId/project/$projectId'
                params={{
                  projectId: project.id,
                }}
              >
                <DropdownMenuItem>
                  <OpenInNewWindowIcon className='icon-md' />
                  <span className='pl-2'>Visit</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <TrashIcon className='icon-md' />
                <span className='pl-2'>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      <Sheet open={isOpen} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          <FormProvider {...form}>
            <form className='grid w-full max-w-[500px] gap-4' onSubmit={form.handleSubmit(onSubmit)}>
              <h6>Please confirm project name again.</h6>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input placeholder='Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='w-full text-md' type='submit' size='lg' variant='destructive'>
                Delete
              </Button>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>
    </>
  );
};
