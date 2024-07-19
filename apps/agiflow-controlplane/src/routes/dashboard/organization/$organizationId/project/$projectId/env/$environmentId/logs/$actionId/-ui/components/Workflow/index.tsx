import { useMemo, useEffect } from 'react';
import { Workflow as Node, IWorkflowProps } from '@/ui/workflow';
import { NODE_TYPES } from '@/ui/workflow/constants';
import { useReactFlow } from 'reactflow';
import { useAtomValue } from 'jotai';
import { filterAtom } from '../../states';
import { LLMNode } from './LLMNode';
import { SpanNode } from './SpanNode';

export const Workflow = ({ stepId, ...props }: IWorkflowProps & { stepId?: string | null }) => {
  const filter = useAtomValue(filterAtom);
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
          fitView({ nodes: [{ id: stepId }], duration: 500, maxZoom: 1 });
        }, 200);
      });
    }
  }, [stepId, fitView]);

  return <Node {...props} nodeTypes={nodeTypes} filter={filter} />;
};
