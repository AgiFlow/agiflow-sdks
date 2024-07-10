import { createFileRoute } from '@tanstack/react-router';
import { SearchSchema, ISearchQuery } from './-ui/validators';
import Dashboard from './-ui/components/Main';

export const Route = createFileRoute(
  '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/logs/',
)({
  component: Dashboard,
  validateSearch: (search?: Record<string, unknown>): Partial<ISearchQuery> => {
    return SearchSchema.parse(search);
  },
});
