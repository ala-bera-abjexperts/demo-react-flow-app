import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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
  </div>
);

const nodeTypes = { custom: CustomNode };

const FlowInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const { screenToFlowPosition } = useReactFlow(); // Needs ReactFlowProvider

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

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, screenToFlowPosition, setNodes]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {" "}
      {/* Ensure 100vh here */}
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
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
