import { useCallback, useEffect, useMemo } from 'react';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';
import { Node, Edge } from 'reactflow';
import Dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';

import { buildStepsWorkflow, Workflow as IWorkflow } from '@/utils/workflow';
import { NODE_TYPES, NODE_HEIGHT, NODE_SIZES, NODE_WIDTH } from './constants';

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getNodeWidth = node => {
  return node.style?.width || NODE_SIZES[node.type]?.width || NODE_WIDTH;
};

const getNodeHeight = node => {
  return node.style?.height || NODE_SIZES[node.type]?.height || NODE_HEIGHT;
};

const getLayoutedElements = (nodes, edges, options) => {
  g.setGraph({
    rankdir: options.direction,
  });

  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  nodes.forEach(node => {
    g.setNode(node.id, { width: getNodeWidth(node), height: getNodeHeight(node) });
  });

  Dagre.layout(g);

  nodes.forEach(node => {
    const nodeWithPosition = g.node(node.id);
    node.targetPosition = 'left';
    node.sourcePosition = 'right';

    if (nodeWithPosition) {
      const y = nodeWithPosition.y - getNodeHeight(node) / 2;
      const x = nodeWithPosition.x - getNodeWidth(node) / 2;
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x,
        y,
      };
    }

    return node;
  });

  return {
    nodes,
    edges,
  };
};

export const useWorkflow = ({ data }: { data: any }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const onConnect = useCallback(connection => setEdges(eds => addEdge(connection, eds)), [setEdges]);
  const { min, max, workflows } = useMemo(() => buildStepsWorkflow(data), [data]);

  useEffect(() => {
    const nodes: Omit<Node, 'position'>[] = [];
    const edges: Edge[] = [];
    const addNode = (workflow: IWorkflow) => {
      if (!workflow.children.length) return;
      workflow.children.forEach(wf => {
        nodes.push({
          id: wf.step.id,
          type: wf.step.is_llm ? NODE_TYPES.llmNode : NODE_TYPES.spanNode,
          data: {
            label: wf.step.name,
            ...wf.step,
            min,
            max,
          },
          expandParent: true,
        });
        edges.push({
          id: `${workflow.step.id}-${wf.step.id}`,
          source: workflow.step.id,
          target: wf.step.id,
        });
        addNode(wf);
      });
    };
    if (workflows.length) {
      workflows.forEach(wf => {
        nodes.push({
          id: wf.step.id,
          type: wf.step.is_llm ? NODE_TYPES.llmNode : NODE_TYPES.spanNode,
          data: {
            label: wf.step.name,
            ...wf.step,
            min,
            max,
          },
        });
        addNode(wf);
      });
      getLayoutedElements(nodes, edges, {
        direction: 'LR',
      });
      setNodes(nodes as Node[]);
      setEdges(edges);
    }
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [workflows]);

  return {
    nodes,
    onNodesChange,
    edges,
    onEdgesChange,
    onConnect,
    min,
    max,
  };
};
