import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  Position,
  Handle,
  useKeyPress,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import { getStraightPath } from "@xyflow/react";

const customEdgeType = { customEdge: CustomEdge };

const CustomNode = ({ data }) => (
  <div
    style={{
      padding: "10px",
      background: "#fff",
      border: "1px solid #1a192b",
      borderRadius: "3px",
    }}
  >
    <strong>{data.label}</strong>
    {/* Targets */}
    <Handle type="target" position={Position.Top} id="t-top" />
    <Handle type="target" position={Position.Right} id="t-right" />
    <Handle type="target" position={Position.Bottom} id="t-bottom" />
    <Handle type="target" position={Position.Left} id="t-left" />

    {/* Sources */}
    <Handle type="source" position={Position.Top} id="s-top" />
    <Handle type="source" position={Position.Right} id="s-right" />
    <Handle type="source" position={Position.Bottom} id="s-bottom" />
    <Handle type="source" position={Position.Left} id="s-left" />
  </div>
);

export function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
    </>
  );
}

const nodeTypes = { custom: CustomNode };

const FlowInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    JSON.parse(localStorage.getItem("nodes"))?.slice(
      0,
      Number(localStorage.getItem("currentIndex"))
    ) || []
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow(); // Needs ReactFlowProvider
  const cmdAndZPress = useKeyPress("Meta+z", "Strg+z");
  const cmdAndYPress = useKeyPress("Meta+y", "Strg+y");
  console.log("Cmd and z is press :", cmdAndZPress);

  useEffect(() => {
    if (cmdAndZPress) {
      const check = [...nodes.slice(0, nodes.length - 1)];
      console.log(check);
      localStorage.setItem("currentIndex", nodes.length - 1);
      setNodes(check);
    }
    if (cmdAndYPress) {
      const undoNodes = JSON.parse(localStorage.getItem("nodes"));
      const check = [...nodes, undoNodes[nodes.length]];
      console.log(check);
      localStorage.setItem("currentIndex", check.length - 1);
      setNodes(check);
    }
  }, [cmdAndZPress, cmdAndYPress]);

  const onPaneClick = useCallback(
    (event) => {
      const id = `${nodes.length + 1}`;

      // Converts client pixels (mouse) to internal graph coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id,
        type: "custom",
        position,
        data: { label: `Node ${id}` },
      };

      setNodes((nds) => {
        const node = nds.concat(newNode);
        localStorage.setItem("currentIndex", node.length);
        localStorage.setItem("nodes", JSON.stringify(node, null, 2));
        return node;
      });
    },
    [nodes, screenToFlowPosition, setNodes]
  );

  // const onConnect = useCallback(
  //   (connection) => setEdges([...edges, connection]),
  //   []
  // );

  return (
    <div
      style={{ width: "100vw", height: "100vh", pointerEvents: "all" }}
      onKeyDown={(event) => console.log(event)}
    >
      {" "}
      {/* Ensure 100vh here */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // onConnect={onConnect}
        edgeTypes={customEdgeType}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick} // Native React Flow prop for clicking the background
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

// 4. Wrap with Provider
export const WorkFlow = () => (
  <ReactFlowProvider>
    <FlowInner />
  </ReactFlowProvider>
);
