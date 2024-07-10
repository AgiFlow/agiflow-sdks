import { useEffect } from 'react';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Toaster } from '@agiflowai/frontend-web-ui';
import { tracking } from '../libs/vendor';
import { QueryClient } from '@tanstack/react-query';

const RootComponent = () => {
  useEffect(() => {
    tracking();
  }, []);

  return (
    <>
      <Outlet />
      <Toaster />
      {import.meta.env.MODE !== 'dev' ? null : <TanStackRouterDevtools position='bottom-right' />}
    </>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});
