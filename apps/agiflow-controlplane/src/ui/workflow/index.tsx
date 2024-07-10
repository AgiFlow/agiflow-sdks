import 'reactflow/dist/style.css';
import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import './styles.css';

import { Step } from './types';
import { LLMNode } from './LLMNode';
import { SpanNode } from './SpanNode';
import { useWorkflow } from './hooks';
import { NODE_TYPES } from './constants';

const rfStyle = {};

export interface IWorkflowProps {
  steps: Step[];
  nodeTypes?: any;
}

export const Workflow = ({ steps, nodeTypes: defaultNodeTypes }: IWorkflowProps) => {
  const { nodes, onNodesChange, edges, onEdgesChange, onConnect } = useWorkflow({ data: steps });
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
