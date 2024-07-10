import { createLazyRoute } from '@tanstack/react-router';
import Dashboard from './-ui/components/Main';

export const Route = createLazyRoute('/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/')({
  component: Dashboard,
});
