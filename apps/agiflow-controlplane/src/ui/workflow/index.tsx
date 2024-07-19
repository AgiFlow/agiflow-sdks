import 'reactflow/dist/style.css';
import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import './styles.css';

import { Step } from './types';
import { LLMNode } from './LLMNode';
import { SpanNode } from './SpanNode';
import { useWorkflow, WorkflowFilter } from './hooks';
import { NODE_TYPES } from './constants';

const rfStyle = {};

export interface IWorkflowProps {
  steps: Step[];
  nodeTypes?: any;
  filter?: WorkflowFilter;
}

export const Workflow = ({ steps, filter, nodeTypes: defaultNodeTypes }: IWorkflowProps) => {
  const { nodes, onNodesChange, edges, onEdgesChange, onConnect } = useWorkflow({ data: steps, filter });
  const nodeTypes = useMemo(
    () =>
      defaultNodeTypes || {
        [NODE_TYPES.llmNode]: LLMNode,
        [NODE_TYPES.spanNode]: SpanNode,
      },
    [defaultNodeTypes],
  );

  if (!nodes?.length) return null;

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={rfStyle}
      fitView
      nodesDraggable={false}
    >
      <Background />
      <Controls />
      <MiniMap pannable />
    </ReactFlow>
  );
};
