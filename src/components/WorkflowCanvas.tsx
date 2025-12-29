import { useCallback, useRef, useMemo, useState, useEffect, DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
  useReactFlow,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../App.css";
import { SliderBar } from "./sliderbar";
import { InputNode, DefaultNode, OutputNode } from "./custom-nodes";
import { Toolbar } from "./Toolbar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useHistory } from "../hooks/useHistory";
import { usePersistence } from "../hooks/usePersistence";
import { WorkflowNode, WorkflowEdge, NodeType } from "../types/workflow";
import {
  Workflow,
  Play,
  Boxes,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const nodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
};

const initialNodes: WorkflowNode[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start Node", nodeNumber: 1 },
    position: { x: 250, y: 5 },
  },
];

const WorkflowCanvasInner = () => {
  const reactFlowInstance = useReactFlow();
  const nodeIdCounter = useRef(2);
  const [isRunning, setIsRunning] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Track if we're currently dragging to prevent history commits
  const isDraggingRef = useRef(false);

  // Initialize persistence
  const { loadState } = usePersistence([], [], true);

  // Load persisted state or use initial state
  const [initialState] = useState(() => {
    const persisted = loadState();
    if (persisted && persisted.nodes.length > 0) {
      // Update node counter to avoid ID conflicts
      const maxId = Math.max(...persisted.nodes.map((n) => parseInt(n.id) || 0));
      nodeIdCounter.current = maxId + 1;
      return persisted;
    }
    return { nodes: initialNodes, edges: [] as WorkflowEdge[] };
  });

  // Initialize history with proper state management
  const history = useHistory(initialState.nodes, initialState.edges, {
    maxHistorySize: 50,
    onStateChange: (nodes, edges) => {
      // This is called during undo/redo
      // We don't need to do anything here as the state is managed by history
    },
  });

  // Enable persistence for current state
  usePersistence(history.nodes, history.edges, true);

  /**
   * Handle node changes (position, selection, etc.)
   * CRITICAL: Use applyNodeChanges, never mutate state directly
   */
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Don't process changes during undo/redo
      if (history.isUndoRedo()) return;

      const newNodes = applyNodeChanges(changes, history.nodes) as WorkflowNode[];

      // Check if this is a drag event
      const isDragChange = changes.some(
        (change) => change.type === "position" && change.dragging
      );

      if (isDragChange) {
        isDraggingRef.current = true;
        // During drag, just update present without committing to history
        history.updatePresent(newNodes, history.edges);
      } else {
        // Check if drag ended
        const wasDragging = isDraggingRef.current;
        isDraggingRef.current = false;

        if (wasDragging) {
          // Commit to history when drag ends
          history.commit(newNodes, history.edges);
        } else {
          // For other changes (selection, etc.), just update without committing
          history.updatePresent(newNodes, history.edges);
        }
      }
    },
    [history]
  );

  /**
   * Handle edge changes
   */
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (history.isUndoRedo()) return;

      const newEdges = applyEdgeChanges(changes, history.edges) as WorkflowEdge[];

      // Commit edge deletions immediately
      const hasRemoval = changes.some((change) => change.type === "remove");
      if (hasRemoval) {
        history.commit(history.nodes, newEdges);
      } else {
        history.updatePresent(history.nodes, newEdges);
      }
    },
    [history]
  );

  /**
   * Handle new connections
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      if (history.isUndoRedo()) return;

      const newEdges = addEdge(
        {
          ...connection,
          animated: true,
          style: {
            strokeWidth: 2,
            stroke: "#6366f1",
          },
        },
        history.edges
      ) as WorkflowEdge[];

      // Commit new edge to history
      history.commit(history.nodes, newEdges);
    },
    [history]
  );

  /**
   * Handle drag over canvas (for drag and drop from sidebar)
   */
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /**
   * Handle drop on canvas
   * CRITICAL: Use screenToFlowPosition for correct positioning
   */
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type) return;

      // CRITICAL: Convert screen coordinates to flow coordinates
      // This ensures correct positioning regardless of zoom/pan
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `${nodeIdCounter.current}`,
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          nodeNumber: nodeIdCounter.current,
        },
      };

      nodeIdCounter.current += 1;

      const newNodes = [...history.nodes, newNode];

      // Commit new node to history immediately
      history.commit(newNodes, history.edges);
    },
    [history, reactFlowInstance]
  );

  /**
   * Delete selected nodes and their connected edges
   */
  const deleteSelected = useCallback(() => {
    const selectedNodes = history.nodes.filter((node) => node.selected);
    const selectedEdges = history.edges.filter((edge) => edge.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

    // Remove selected nodes
    const newNodes = history.nodes.filter((node) => !node.selected);

    // Remove selected edges AND edges connected to deleted nodes
    const newEdges = history.edges.filter(
      (edge) =>
        !edge.selected &&
        !selectedNodeIds.has(edge.source) &&
        !selectedNodeIds.has(edge.target)
    );

    // Commit deletion to history
    history.commit(newNodes, newEdges);
  }, [history]);

  /**
   * Duplicate selected nodes
   */
  const duplicateSelected = useCallback(() => {
    const selectedNodes = history.nodes.filter((node) => node.selected);
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

    const allNodes = [
      ...history.nodes.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ];

    // Commit duplication to history
    history.commit(allNodes, history.edges);
  }, [history]);

  /**
   * Select all nodes
   */
  const selectAll = useCallback(() => {
    const newNodes = history.nodes.map((node) => ({ ...node, selected: true }));
    history.updatePresent(newNodes, history.edges);
  }, [history]);

  /**
   * Save workflow to JSON file
   */
  const saveWorkflow = useCallback(() => {
    const workflow = { nodes: history.nodes, edges: history.edges };
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [history]);

  /**
   * Load workflow from JSON file
   */
  const loadWorkflow = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workflow = JSON.parse(event.target?.result as string);
          if (workflow.nodes && workflow.edges) {
            // Reset history with loaded workflow
            history.reset(workflow.nodes, workflow.edges);

            // Update node counter
            const maxId = Math.max(...workflow.nodes.map((n: Node) => parseInt(n.id) || 0));
            nodeIdCounter.current = maxId + 1;
          }
        } catch (error) {
          console.error("Error loading workflow:", error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [history]);

  /**
   * Toggle snap to grid
   */
  const toggleSnapToGrid = useCallback(() => {
    setSnapToGrid((prev) => !prev);
  }, []);

  /**
   * Toggle running state
   */
  const handleRun = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: history.undo,
    onRedo: history.redo,
    onDelete: deleteSelected,
    onDuplicate: duplicateSelected,
    onSelectAll: selectAll,
    onSave: saveWorkflow,
  });

  // Memoize default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { strokeWidth: 2, stroke: "#6366f1" },
    }),
    []
  );

  // Memoize connection line style
  const connectionLineStyle = useMemo(
    () => ({
      strokeWidth: 2,
      stroke: "#6366f1",
    }),
    []
  );

  // Memoize minimap node color function
  const minimapNodeColor = useCallback((node: Node) => {
    if (node.type === "input") return "#3b82f6";
    if (node.type === "output") return "#22c55e";
    return "#a855f7";
  }, []);

  return (
    <div className="h-screen w-screen flex bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800">
            <Boxes className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-sm font-medium text-zinc-100">Components</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3 px-1">
            Nodes
          </div>
          <SliderBar />
        </div>

        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">
          Drag nodes onto canvas
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <Toolbar
          onUndo={history.undo}
          onRedo={history.redo}
          onSave={saveWorkflow}
          onLoad={loadWorkflow}
          onToggleSnap={toggleSnapToGrid}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          snapToGrid={snapToGrid}
        />

        {/* Status Bar */}
        <div className="h-8 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400 font-medium">Workflow Builder</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-zinc-700" />
            <span>{history.nodes.length} nodes</span>
            <span>{history.edges.length} connections</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRun}
              size="sm"
              className="h-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Play className={`w-3 h-3 mr-1 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Stop" : "Run"}
            </Button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="relative flex-1" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={history.nodes}
            edges={history.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            className="bg-zinc-950"
            connectionLineStyle={connectionLineStyle}
            connectionLineType="smoothstep"
            snapToGrid={snapToGrid}
            snapGrid={[20, 20]}
            selectionOnDrag
            selectionMode="partial"
            panOnDrag={[1, 2]}
            multiSelectionKeyCode="Shift"
            deleteKeyCode={null} // Handle delete manually for better control
          >
            <Background gap={20} size={1} color="#27272a" variant="dots" />
            <Controls
              className="!bg-zinc-900 !border !border-zinc-800 !rounded-lg !shadow-lg [&_button]:!bg-transparent [&_button]:!border-0 [&_button]:!text-zinc-400 [&_button:hover]:!bg-zinc-800 [&_button:hover]:!text-zinc-100 [&_button]:!transition-colors"
              showInteractive
              showZoom
              showFitView
            />
            <MiniMap
              nodeColor={minimapNodeColor}
              nodeStrokeWidth={3}
              nodeBorderRadius={8}
              className="!bg-zinc-900 !border !border-zinc-800 !rounded-lg"
            />
          </ReactFlow>

          {/* Empty State */}
          {history.nodes.length === 0 && (
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

          {/* Running State */}
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
  );
};

export const WorkflowCanvas = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
};
