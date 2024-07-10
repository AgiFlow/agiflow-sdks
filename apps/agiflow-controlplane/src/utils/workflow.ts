import { paths } from '@agiflowai/controlplane-api-client';

type Actions =
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/actions']['get']['responses']['200']['content']['application/json']['list'];
export type Action = NonNullable<Actions[0]>;
type Steps = NonNullable<Action['steps']>;
export type Step = NonNullable<Steps[0]>;

export type EvalStep = NonNullable<
  paths['/organizations/{organizationId}/projects/{projectId}/environments/{environmentId}/workflows/task-workflow']['get']['responses']['200']['content']['application/json']['action']['steps'][0]
>;

export interface Workflow {
  step: Step;
  children: Array<Workflow>;
}
export const buildStepsWorkflow = (steps: Steps) => {
  let min: Date | undefined = undefined;
  let max: Date | undefined = undefined;
  let workflows: Workflow[] = steps
    .filter(step => {
      if (!step.parent_span_id) return true;
      const idx = steps.findIndex(s => s.span_id === step.parent_span_id);
      if (idx === -1) return true;
      return false;
    })
    .map(x => ({
      step: x,
      children: [],
    }));
  const buildWorkflow = (workflow: Workflow, steps: Steps) => {
    if (!min || new Date(workflow.step.started_at || '') < min) {
      min = new Date(workflow.step.started_at || '');
    }
    if (!max || new Date(workflow.step.ended_at || '') > max) {
      max = new Date(workflow.step.ended_at || '');
    }
    const children = steps.filter(step => step.parent_span_id === workflow.step.span_id);
    workflow.children = children.map(step => {
      if (!min || new Date(step.started_at || '') < min) {
        min = new Date(step.started_at || '');
      }
      if (!max || new Date(step.ended_at || '') > max) {
        max = new Date(step.ended_at || '');
      }
      return {
        step,
        children: [],
      };
    });
    if (!workflow.children.length) {
      return workflow;
    }
    workflow.children = workflow.children.map(workflow => buildWorkflow(workflow, steps));
    return workflow;
  };
  workflows = workflows.map(workflow => buildWorkflow(workflow, steps));
  return {
    workflows,
    min,
    max,
  };
};
