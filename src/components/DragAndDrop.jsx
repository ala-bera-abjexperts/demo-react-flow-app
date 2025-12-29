import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../App.css";
import { SliderBar } from "./sliderbar";
import { useCallback, useRef, useState } from "react";
import {
  Workflow,
  Maximize2,
  Download,
  Upload,
  Zap,
  Circle,
  Square,
  ArrowRight,
  Play,
  Grid3x3,
  Sparkles,
  Activity,
} from "lucide-react";
import { InputNode, DefaultNode, OutputNode } from "./custom-nodes";

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

const defaultEdgeOptions = {
  animated: true,
  style: {
    strokeWidth: 2.5,
  },
};

export const DragAndDrop = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodeIdCounter = useRef(2);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              strokeWidth: 2.5,
              stroke: "url(#edge-gradient)",
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

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex bg-zinc-950 text-zinc-100 overflow-hidden">
        {/* SVG Definitions for Gradients */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient
              id="edge-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient
              id="header-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sidebar */}
        <aside className="w-[360px] border-r border-zinc-800/50 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-2xl relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent blur-3xl pointer-events-none"></div>

          <div className="relative h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
                <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Workflow
                    className="w-5 h-5 text-white relative z-10"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-zinc-100">Node Library</div>
                <div className="text-xs text-zinc-500">
                  Drag & drop components
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-zinc-600 animate-pulse" />
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <SliderBar />
            </div>

            {/* Status Footer */}
            <div className="h-24 p-5 border-t border-zinc-800/50 bg-gradient-to-t from-zinc-950/90 to-transparent backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-sm animate-pulse-glow"></div>
                    <div className="relative w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500"></div>
                  </div>
                  <span className="text-zinc-400 font-medium">
                    System Active
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-zinc-500 font-mono">v2.1</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-1.5 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800/50">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-shimmer"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-600">
                <span>Performance</span>
                <span className="font-mono">75%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col relative">
          {/* Ambient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 pointer-events-none"></div>

          {/* Header */}
          <header className="relative h-20 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-2xl">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-[url('#header-gradient')] opacity-50"></div>

            <div className="relative flex items-center gap-5">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-zinc-100">
                  Workflow Builder
                </span>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <span className="text-xs text-blue-400 font-semibold">
                      PRO
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-zinc-800"></div>

              <div className="flex items-center gap-3">
                <div className="group relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-blue-500/50 transition-all">
                    <Grid3x3 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-zinc-300 font-semibold">
                      {nodes.length}
                    </span>
                    <span className="text-xs text-zinc-500">Nodes</span>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-purple-500/50 transition-all">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-zinc-300 font-semibold">
                      {edges.length}
                    </span>
                    <span className="text-xs text-zinc-500">Connections</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <button className="group relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Upload className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Import</span>
              </button>

              <button className="group relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Export</span>
              </button>

              <div className="w-px h-7 bg-zinc-800 mx-1"></div>

              <button
                onClick={handleRun}
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <Play
                  className={`w-4 h-4 relative z-10 transition-transform ${
                    isRunning ? "rotate-90 scale-110" : ""
                  }`}
                />
                <span className="relative z-10 font-semibold">
                  {isRunning ? "Running..." : "Run"}
                </span>
                {isRunning && (
                  <Sparkles className="w-3.5 h-3.5 animate-pulse relative z-10" />
                )}
              </button>

              <button className="p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50 transition-all">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </header>

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
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              className="bg-zinc-950"
              connectionLineStyle={{
                strokeWidth: 2.5,
                stroke: "#a855f7",
              }}
              connectionLineType="smoothstep"
            >
              <Background
                className="opacity-[0.15]"
                gap={24}
                size={2}
                color="#52525b"
                variant="dots"
              />
              <Controls
                className="!bg-zinc-900/95 !border !border-zinc-800/50 !rounded-2xl !shadow-2xl !shadow-black/50 backdrop-blur-xl !overflow-hidden [&_button]:!bg-transparent [&_button]:!border-zinc-800/50 [&_button]:!text-zinc-400 [&_button:hover]:!bg-zinc-800/50 [&_button:hover]:!text-white [&_button]:!transition-all [&_button]:!rounded-lg"
                showInteractive={false}
              />
            </ReactFlow>

            {/* Canvas Overlay Hint */}
            {nodes.length === 1 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-6 opacity-20">
                  <div className="relative inline-block">
                    {/* Animated Glow Rings */}
                    <div className="absolute inset-0 animate-ping">
                      <div className="absolute inset-[-20px] bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full blur-3xl opacity-20"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 blur-3xl opacity-30 animate-pulse-glow"></div>
                    <Workflow
                      className="w-24 h-24 mx-auto text-zinc-700 relative animate-float"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-700 font-semibold">
                      Start Building Your Workflow
                    </p>
                    <p className="text-xs text-zinc-800 max-w-md">
                      Drag nodes from the sidebar and connect them to create
                      powerful data flows
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {[Circle, Square, ArrowRight].map((Icon, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                        >
                          <Icon
                            className="w-4 h-4 text-zinc-600"
                            strokeWidth={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Running Animation Overlay */}
            {isRunning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
                  <div className="relative flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-900/95 border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-sm text-zinc-300 font-semibold">
                      Executing Workflow...
                    </span>
                    <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ReactFlowProvider>
  );
};
