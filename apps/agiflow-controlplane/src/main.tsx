import './App.scss';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-js/react';
import posthog from '@/libs/posthog';
import { queryClient } from './libs/tanstackQuery';
import '@agiflowai/frontend-web-theme/tailwind.scss';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('app')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider client={posthog}>
          <RouterProvider router={router} />
        </PostHogProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
