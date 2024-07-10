import { useQuery } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';

import { graphTaskJourneyQueryOptions } from '../../queries';
import { Graph } from './Graph';

export const UserJourney = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/',
  });
  const search = useSearch({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/',
  });
  const { data: res } = useQuery(graphTaskJourneyQueryOptions({ path: params, query: search }));
  if (!res?.data) return null;
  return <Graph graph={res.data} />;
};
