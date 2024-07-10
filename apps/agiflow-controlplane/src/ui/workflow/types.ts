import { paths } from '@agiflowai/controlplane-api-client';

export type Step = NonNullable<
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/workflows/task-workflow']['get']['responses']['200']['content']['application/json']['action']['steps'][0]
>;

export type EvalStep = Step & {
  min: string;
  max: string;
};
