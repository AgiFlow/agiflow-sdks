import { useMemo, useEffect } from 'react';
import { Workflow as Node, IWorkflowProps } from '@/ui/workflow';
import { NODE_TYPES } from '@/ui/workflow/constants';
import { useReactFlow } from 'reactflow';
import { LLMNode } from './LLMNode';
import { SpanNode } from './SpanNode';

export const Workflow = ({ stepId, ...props }: IWorkflowProps & { stepId?: string | null }) => {
  const { fitView } = useReactFlow();
  const nodeTypes = useMemo(
    () => ({
      [NODE_TYPES.llmNode]: LLMNode,
      [NODE_TYPES.spanNode]: SpanNode,
    }),
    [],
  );

  useEffect(() => {
    if (stepId) {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          fitView({ nodes: [{ id: stepId }], duration: 500 });
        }, 200);
      });
    }
  }, [stepId, fitView]);

  return <Node {...props} nodeTypes={nodeTypes} />;
};
