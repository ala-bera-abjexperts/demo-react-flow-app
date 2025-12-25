import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  Controls,
  EdgeLabelRenderer,
  Background,
  BaseEdge,
  getStraightPath,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { TextUpdateNode } from "./Input";
import { CustomNode } from "./Custom";

import dagre from "@dagrejs/dagre";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const isHorizontal = direction == "LR";
  dagreGraph.setGraph({ randkir: direction });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWidthPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWidthPosition.x - nodeWidth / 2,
        y: nodeWidthPosition.y - nodeHeight / 2,
      },
    };
    return newNode;
  });
  return { nodes: newNodes, edges };
};

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  console.log(labelX, labelY, id);
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <button
          style={{
            position: "absolute",
            transform: `translate(50%,-50%) translate(${sourceX}px,${sourceY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopen"
          onClick={() => deleteElements({ edges: [{ id }] })}
        >
          Delete
        </button>
      </EdgeLabelRenderer>
    </>
  );
};

const initialNodes = [
  {
    id: "1",
    type: "textUpdate",
    position: { x: 700, y: 400 },
    data: { label: "Node 1" },
  },
  {
    id: "2",
    position: { x: 600, y: 500 },
    data: { label: "Node 2" },
  },
  {
    id: "3",
    position: { x: 800, y: 500 },
    data: { label: "Node 3" },
  },
];

const initialEdges = [
  {
    id: "e1-e2",
    source: "1",
    sourceHandle: "a",
    target: "2",
    animated: true,
    type: "custom-edge",
    // label: "Node 1 is connected with node 2",
  },
  {
    id: "e1-e3",
    source: "1",
    sourceHandle: "b",
    target: "3",
    animated: true,
  },
];

export const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useState(initialEdges);

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutEdges]);
    },
    [nodes, edges]
  );

  // const onNodesChange = useCallback(
  //   (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   []
  // );
  // const onEdgesChange = useCallback(
  //   (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  //   []
  // );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={{ "custom-edge": CustomEdge }}
      nodeTypes={{ textUpdate: CustomNode }}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      style={{ background: "#D0C0F7" }}
      attributePosition="top-right"
    >
      <Panel position="top-right">
        <button className="xy-theme__button" onClick={() => onLayout("TB")}>
          Vertical layout
        </button>
        <button className="xy-theme__button" onClick={() => onLayout("LR")}>
          Horizontal layout
        </button>
      </Panel>
      <Controls orientation="vertical" position="center-left" />
      <Background />
    </ReactFlow>
  );
};
