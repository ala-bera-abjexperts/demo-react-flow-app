import {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
  DragEvent,
} from "react";
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
import { Workflow, Play, Boxes } from "lucide-react";
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
      const maxId = Math.max(
        ...persisted.nodes.map((n) => parseInt(n.id) || 0)
      );
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

      const newNodes = applyNodeChanges(
        changes,
        history.nodes
      ) as WorkflowNode[];

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

      const newEdges = applyEdgeChanges(
        changes,
        history.edges
      ) as WorkflowEdge[];

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

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
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
            const maxId = Math.max(
              ...workflow.nodes.map((n: Node) => parseInt(n.id) || 0)
            );
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

  // Memoize default edge options with cyberpunk styling
  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: {
        strokeWidth: 2,
        stroke: "var(--cyber-cyan)",
      },
    }),
    []
  );

  // Memoize connection line style with cyberpunk glow
  const connectionLineStyle = useMemo(
    () => ({
      strokeWidth: 2,
      stroke: "var(--cyber-cyan)",
    }),
    []
  );

  // Memoize minimap node color function with cyberpunk colors
  const minimapNodeColor = useCallback((node: Node) => {
    if (node.type === "input") return "#00f0ff"; // cyber-cyan
    if (node.type === "output") return "#ffbe0b"; // cyber-yellow
    return "#ff006e"; // cyber-magenta
  }, []);

  return (
    <div className="h-screen w-screen flex bg-[var(--cyber-bg-void)] text-[var(--cyber-text-bright)] overflow-hidden relative">
      {/* Cyberpunk grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--cyber-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--cyber-grid) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Sidebar */}
      <aside className="w-72 border-r-2 border-[var(--cyber-border-bright)] bg-[var(--cyber-bg-dark)] flex flex-col relative z-10 shadow-[0_0_30px_var(--cyber-cyan-glow)]">
        {/* Sidebar header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b-2 border-[var(--cyber-border-bright)] bg-[var(--cyber-bg-surface)] relative overflow-hidden">
          {/* Animated accent line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{
              background:
                "linear-gradient(180deg, var(--cyber-cyan), var(--cyber-magenta))",
              boxShadow: "0 0 10px var(--cyber-cyan-glow)",
            }}
          />

          <div
            className="flex items-center justify-center w-10 h-10 border-2"
            style={{
              borderColor: "var(--cyber-cyan)",
              background:
                "radial-gradient(circle, var(--cyber-cyan-glow), transparent)",
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
          >
            <Boxes
              className="w-5 h-5 text-[var(--cyber-cyan)]"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-[var(--cyber-cyan)] uppercase tracking-widest mono">
              COMPONENTS
            </div>
            <div className="text-[10px] text-[var(--cyber-text-dim)] mono tracking-wide">
              {">> SYSTEM MODULES"}
            </div>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-[10px] text-[var(--cyber-text-dim)] uppercase tracking-widest mb-4 px-1 mono flex items-center gap-2">
            <div className="flex-1 h-px bg-[var(--cyber-border)]" />
            <span>NODE TYPES</span>
            <div className="flex-1 h-px bg-[var(--cyber-border)]" />
          </div>
          <SliderBar />
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t-2 border-[var(--cyber-border-bright)] text-[10px] text-[var(--cyber-text-medium)] mono bg-[var(--cyber-bg-surface)]">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 bg-[var(--cyber-cyan)] animate-neon-pulse"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
            <span className="uppercase tracking-wider">DRAG TO DEPLOY</span>
          </div>
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
        <div className="h-10 flex items-center justify-between px-4 border-b-2 border-[var(--cyber-border-bright)] bg-[var(--cyber-bg-surface)] relative overflow-hidden">
          {/* Animated background pulse */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--cyber-cyan), transparent)",
              animation: "holo-shimmer 3s linear infinite",
            }}
          />

          <div className="flex items-center gap-4 text-xs mono relative z-10">
            <div className="flex items-center gap-2">
              <Workflow
                className="w-4 h-4 text-[var(--cyber-cyan)]"
                strokeWidth={2.5}
              />
              <span className="text-[var(--cyber-cyan)] font-bold uppercase tracking-widest">
                WORKFLOW ENGINE
              </span>
            </div>
            <Separator
              orientation="vertical"
              className="h-5 bg-[var(--cyber-border-bright)] w-px"
            />
            <div className="flex items-center gap-3 text-[var(--cyber-text-medium)]">
              <span className="uppercase tracking-wide">
                <span className="text-[var(--cyber-cyan)]">
                  {history.nodes.length}
                </span>{" "}
                NODES
              </span>
              <span className="uppercase tracking-wide">
                <span className="text-[var(--cyber-magenta)]">
                  {history.edges.length}
                </span>{" "}
                LINKS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <Button
              onClick={handleRun}
              size="sm"
              className="h-7 text-xs font-bold uppercase tracking-wider mono bg-[var(--cyber-bg-elevated)] border-2 hover:bg-[var(--cyber-bg-surface)] text-[var(--cyber-cyan)] transition-all duration-200"
              style={{
                borderColor: isRunning
                  ? "var(--cyber-magenta)"
                  : "var(--cyber-cyan)",
                boxShadow: isRunning
                  ? "0 0 20px var(--cyber-magenta-glow)"
                  : "0 0 10px var(--cyber-cyan-glow)",
                borderRadius: 0,
              }}
            >
              <Play
                className={`w-3.5 h-3.5 mr-1.5 ${
                  isRunning ? "animate-glitch" : ""
                }`}
                strokeWidth={2.5}
              />
              {isRunning ? "TERMINATE" : "EXECUTE"}
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
            nodes={history.nodes}
            edges={history.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            className="bg-[var(--cyber-bg-void)]"
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
            <Background
              gap={20}
              size={1.5}
              color="var(--cyber-grid)"
              variant="dots"
              style={{
                background: "var(--cyber-bg-void)",
              }}
            />
            <Controls showInteractive showZoom showFitView />
            <MiniMap
              nodeColor={minimapNodeColor}
              nodeStrokeWidth={0}
              nodeBorderRadius={0}
            />
          </ReactFlow>

          {/* Empty State */}
          {history.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-md relative">
                {/* Glowing frame */}
                <div className="absolute -inset-8 border-2 border-[var(--cyber-border-bright)] opacity-30">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--cyber-cyan)]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--cyber-cyan)]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--cyber-cyan)]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--cyber-cyan)]" />
                </div>

                <div
                  className="flex items-center justify-center w-20 h-20 border-2 mx-auto mb-6 relative"
                  style={{
                    borderColor: "var(--cyber-cyan)",
                    background:
                      "radial-gradient(circle, var(--cyber-cyan-glow), transparent)",
                    clipPath:
                      "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    boxShadow: "0 0 30px var(--cyber-cyan-glow)",
                  }}
                >
                  <Workflow
                    className="w-10 h-10 text-[var(--cyber-cyan)] animate-neon-pulse"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-base font-bold text-[var(--cyber-cyan)] mb-3 uppercase tracking-widest mono">
                  SYSTEM READY
                </p>
                <p className="text-sm text-[var(--cyber-text-medium)] mono tracking-wide">
                  {">> DEPLOY NODES FROM SIDEBAR"}
                </p>
                <p className="text-xs text-[var(--cyber-text-dim)] mono mt-2 tracking-wide">
                  {">> ESTABLISH CONNECTIONS"}
                </p>
              </div>
            </div>
          )}

          {/* Running State */}
          {isRunning && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-cyber-fade-in">
              <div
                className="relative flex items-center gap-3 px-5 py-3 border-2 bg-[var(--cyber-bg-dark)]"
                style={{
                  borderColor: "var(--cyber-magenta)",
                  boxShadow:
                    "0 0 30px var(--cyber-magenta-glow), 0 0 60px var(--cyber-magenta-glow)",
                }}
              >
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[var(--cyber-magenta)]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[var(--cyber-magenta)]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[var(--cyber-magenta)]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[var(--cyber-magenta)]" />

                <div
                  className="w-3 h-3 bg-[var(--cyber-magenta)] animate-glitch"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    boxShadow: "0 0 10px var(--cyber-magenta-glow)",
                  }}
                />
                <span className="text-xs font-bold text-[var(--cyber-magenta)] uppercase tracking-widest mono">
                  EXECUTING WORKFLOW
                </span>
                {/* Data stream bars */}
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-[var(--cyber-magenta)] opacity-60"
                      style={{
                        animation: `data-stream 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
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
