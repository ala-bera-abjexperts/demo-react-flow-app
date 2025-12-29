import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../App.css";
import { SliderBar } from "./sliderbar";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  Workflow,
  Maximize2,
  Download,
  Upload,
  Play,
  Boxes,
} from "lucide-react";
import { InputNode, DefaultNode, OutputNode } from "./custom-nodes";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { Toolbar } from "./Toolbar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const nodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
};

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Start Node", nodeNumber: 1 },
    position: { x: 250, y: 5 },
  },
];

const DragAndDropInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodeIdCounter = useRef(2);
  const [isRunning, setIsRunning] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState([{ nodes: initialNodes, edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  // Save to history when nodes or edges change
  const saveToHistory = useCallback(
    (newNodes, newEdges) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Track changes and save to history
  useEffect(() => {
    // Don't save if we're in the middle of undo/redo
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // Don't save initial state
    if (nodes.length === 0 && edges.length === 0) return;

    const timeoutId = setTimeout(() => {
      const currentState = history[historyIndex];
      const hasChanged =
        JSON.stringify(currentState?.nodes) !== JSON.stringify(nodes) ||
        JSON.stringify(currentState?.edges) !== JSON.stringify(edges);

      if (hasChanged) {
        saveToHistory(nodes, edges);
      }
    }, 300); // Debounce to avoid saving too frequently

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, history, historyIndex, saveToHistory]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Delete selected nodes/edges
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // Duplicate selected nodes
  const duplicateSelected = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const newNodes = selectedNodes.map((node) => ({
      ...node,
      id: `${nodeIdCounter.current++}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }));

    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ]);
  }, [nodes, setNodes]);

  // Select all nodes
  const selectAll = useCallback(() => {
    setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
  }, [setNodes]);

  // Save workflow
  const saveWorkflow = useCallback(() => {
    const workflow = { nodes, edges };
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Load workflow
  const loadWorkflow = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workflow = JSON.parse(event.target.result);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          console.error("Error loading workflow:", error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: deleteSelected,
    onDuplicate: duplicateSelected,
    onSelectAll: selectAll,
    onSave: saveWorkflow,
  });

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              strokeWidth: 2,
              stroke: "#6366f1",
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode = {
        id: `${nodeIdCounter.current}`,
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          nodeNumber: nodeIdCounter.current,
        },
      };

      nodeIdCounter.current += 1;
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleRun = () => {
    setIsRunning(!isRunning);
  };

  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex bg-zinc-950 text-zinc-100 overflow-hidden">
        {/* Sidebar - Clean minimal design */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          {/* Sidebar Header */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800">
              <Boxes className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-sm font-medium text-zinc-100">
              Components
            </span>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3 px-1">
              Nodes
            </div>
            <SliderBar />
          </div>

          {/* Footer - Minimal hint */}
          <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">
            Drag nodes onto canvas
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col relative">
          {/* Toolbar */}
          <Toolbar
            onUndo={undo}
            onRedo={redo}
            onSave={saveWorkflow}
            onLoad={loadWorkflow}
            onToggleSnap={toggleSnapToGrid}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            snapToGrid={snapToGrid}
          />

          {/* Status Bar */}
          <div className="h-8 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Workflow className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400 font-medium">
                  Workflow Builder
                </span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-zinc-700" />
              <span>{nodes.length} nodes</span>
              <span>{edges.length} connections</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRun}
                size="sm"
                className="h-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Play
                  className={`w-3 h-3 mr-1 ${isRunning ? "animate-spin" : ""}`}
                />
                {isRunning ? "Stop" : "Run"}
              </Button>
            </div>
          </div>

          {/* React Flow Canvas */}
          <div
            className="relative flex-1"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                animated: true,
                style: { strokeWidth: 2, stroke: "#6366f1" },
              }}
              fitView
              className="bg-zinc-950"
              connectionLineStyle={{
                strokeWidth: 2,
                stroke: "#6366f1",
              }}
              connectionLineType="smoothstep"
              snapToGrid={snapToGrid}
              snapGrid={[20, 20]}
              selectionOnDrag
              selectionMode="partial"
              panOnDrag={[1, 2]}
              multiSelectionKeyCode="Shift"
            >
              <Background gap={20} size={1} color="#27272a" variant="dots" />
              <Controls
                className="!bg-zinc-900 !border !border-zinc-800 !rounded-lg !shadow-lg [&_button]:!bg-transparent [&_button]:!border-0 [&_button]:!text-zinc-400 [&_button:hover]:!bg-zinc-800 [&_button:hover]:!text-zinc-100 [&_button]:!transition-colors"
                showInteractive
                showZoom
                showFitView
              />
              <MiniMap
                nodeColor={(node) => {
                  if (node.type === "input") return "#3b82f6";
                  if (node.type === "output") return "#22c55e";
                  return "#a855f7";
                }}
                nodeStrokeWidth={3}
                nodeBorderRadius={8}
                className="!bg-zinc-900 !border !border-zinc-800 !rounded-lg"
              />
            </ReactFlow>

            {/* Empty State - Clean minimal */}
            {nodes.length === 1 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-xs">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 mx-auto mb-4">
                    <Workflow className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400 mb-2">
                    Start building your workflow
                  </p>
                  <p className="text-xs text-zinc-600">
                    Drag nodes from the sidebar and connect them
                  </p>
                </div>
              </div>
            )}

            {/* Running State - Clean minimal */}
            {isRunning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-subtle" />
                  <span className="text-xs font-medium text-zinc-300">
                    Running workflow...
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ReactFlowProvider>
  );
};

export const DragAndDrop = DragAndDropInner;
