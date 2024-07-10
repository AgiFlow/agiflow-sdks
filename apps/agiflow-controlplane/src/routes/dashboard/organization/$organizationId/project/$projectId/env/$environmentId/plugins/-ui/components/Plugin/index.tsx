import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Switch,
  Sheet,
  SheetContent,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@agiflowai/frontend-web-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { ReactNode, useState } from 'react';
import { apiClient } from '@/libs/api';
import { PLUGIN_CATEGORIES } from '@/constants/plugin';
import { IPlugin } from '../../queries';
import { IModels } from '../../../../../../../../models/-ui/queries';
import { Form } from './Form';

export interface IPluginProps {
  title: string;
  description: string;
  category: number;
  loading: boolean;
  plugin?: IPlugin;
  children?: ReactNode;
  models: IModels;
}
export const Plugin = ({ title, description, plugin, category, models, children }: IPluginProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/plugins/',
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [`plugins-${params.environmentId}`],
    });
  };

  const createPlugin = useMutation({
    mutationFn: (body: { category: number }) => {
      return apiClient.POST(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/plugins',
        {
          params: {
            path: params,
          },
          body,
        },
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });

  const updatePlugin = useMutation({
    mutationFn: () => {
      return apiClient.PATCH(
        '/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/plugins/{pluginId}',
        {
          params: {
            path: {
              ...params,
              pluginId: plugin?.id || '',
            },
          },
        },
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });

  const onSubmit = (payload: any) => {
    if (plugin) {
      updatePlugin.mutate();
    } else {
      createPlugin.mutate({ ...payload, category });
    }
    setOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h5>{title}</h5>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {description}
            {children}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Switch
            checked={!!plugin?.is_enabled}
            onCheckedChange={() => {
              if (plugin) {
                updatePlugin.mutate();
              } else {
                if (category === PLUGIN_CATEGORIES.PII) {
                  createPlugin.mutate({ category });
                } else {
                  setOpen(true);
                }
              }
            }}
          />
        </CardFooter>
      </Card>
      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent>
          {models?.length ? (
            <Form models={models} submitting={createPlugin.isPending || updatePlugin.isPending} onSubmit={onSubmit} />
          ) : (
            <div>
              <Alert>
                <AlertTitle>One more step!</AlertTitle>
                <AlertDescription>To use plugin, you&apos;ll need to add a model first.</AlertDescription>
                <Link
                  from='/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/plugins'
                  to='/dashboard/organization/$organizationId/models'
                >
                  <Button className='mt-4 w-full'>Add model</Button>
                </Link>
              </Alert>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
