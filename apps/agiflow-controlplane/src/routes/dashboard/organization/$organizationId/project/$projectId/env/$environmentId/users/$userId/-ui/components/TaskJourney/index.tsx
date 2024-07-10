import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from '@agiflowai/frontend-web-ui';

import { userJourneyQueryOptions } from '../../queries';
import { Graph } from '../../../../../-ui/components/UserJourney/Graph';

export const TaskJourney = () => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId/project/$projectId/env/$environmentId/users/$userId/',
  });
  const { data: res, isFetching } = useQuery(userJourneyQueryOptions({ path: params }));
  if (isFetching) return null;
  if (!res?.data || !res?.data?.nodes?.length) {
    return (
      <Alert>
        <AlertTitle>Oops!</AlertTitle>
        <AlertDescription>This user hasn't interact with LLM yet.</AlertDescription>
      </Alert>
    );
  }
  return <Graph graph={res.data} />;
};
