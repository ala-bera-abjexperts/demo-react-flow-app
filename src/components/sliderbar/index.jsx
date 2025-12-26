import { useRef, useState, useCallback } from "react";
import { useDraggable } from "@neodrag/react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useReactFlow } from "@xyflow/react";
import {
  Boxes,
  Workflow,
  ArrowDownToLine,
  Settings2,
  ArrowUpFromLine,
} from "lucide-react";

let id = 0;
const getId = () => `dndnode_${id++}`;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ----------------------------- Draggable Node ----------------------------- */
function DraggableNode({
  className,
  children,
  nodeType,
  onDrop,
  icon: Icon,
  gradient,
  bgColor,
}) {
  const draggableRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useDraggable(draggableRef, {
    position,
    onDrag: ({ offsetX, offsetY }) => {
      setIsDragging(true);
      setPosition({ x: offsetX, y: offsetY });
    },
    onDragEnd: ({ event }) => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onDrop(nodeType, { x: event.clientX, y: event.clientY });
    },
  });

  return (
    <div
      ref={draggableRef}
      className={cn(
        "group select-none cursor-grab active:cursor-grabbing",
        "transition-transform duration-150",
        isDragging && "opacity-60 scale-[0.98]",
        className
      )}
      style={{
        zIndex: isDragging ? 9999 : "auto",
        pointerEvents: isDragging ? "none" : "auto",
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-white/10 hover:border-white/20",
          "shadow-sm hover:shadow-lg hover:shadow-black/20",
          "transition-colors duration-200",
          bgColor
        )}
      >
        {/* subtle highlight */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <div className="relative flex items-center gap-4 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-black/20 ring-1 ring-white/10">
            <Icon className={cn("h-6 w-6", gradient)} strokeWidth={2.25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {children}
            </div>
            <div className="mt-0.5 text-xs text-white/60">Drag onto canvas</div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent transition group-hover:ring-white/10" />
      </div>
    </div>
  );
}

/* -------------------------------- SliderBar ------------------------------- */
export const SliderBar = () => {
  const { setNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeDrop = useCallback(
    (nodeType, screenPosition) => {
      const flow = document.querySelector(".react-flow");
      const flowRect = flow?.getBoundingClientRect();

      const isInFlow =
        flowRect &&
        screenPosition.x >= flowRect.left &&
        screenPosition.x <= flowRect.right &&
        screenPosition.y >= flowRect.top &&
        screenPosition.y <= flowRect.bottom;

      if (isInFlow) {
        const position = screenToFlowPosition(screenPosition);

        setNodes((nds) =>
          nds.concat({
            id: getId(),
            type: nodeType,
            position,
            data: { label: `${nodeType} node` },
          })
        );
      }
    },
    [setNodes, screenToFlowPosition]
  );

  return (
    <aside className="w-[320px] shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 px-4 flex items-center gap-2 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <Boxes className="h-5 w-5 text-blue-400" />
        <span className="text-sm font-semibold text-white">Components</span>
      </div>

      {/* Nodes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <DraggableNode
          nodeType="input"
          onDrop={handleNodeDrop}
          icon={ArrowDownToLine}
          gradient="text-blue-400"
          bgColor="bg-slate-900/60"
        >
          Input
        </DraggableNode>

        <DraggableNode
          nodeType="default"
          onDrop={handleNodeDrop}
          icon={Settings2}
          gradient="text-purple-400"
          bgColor="bg-slate-900/60"
        >
          Process
        </DraggableNode>

        <DraggableNode
          nodeType="output"
          onDrop={handleNodeDrop}
          icon={ArrowUpFromLine}
          gradient="text-emerald-400"
          bgColor="bg-slate-900/60"
        >
          Output
        </DraggableNode>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/70 backdrop-blur p-4 text-xs text-slate-300 flex items-center gap-2">
        <Workflow className="h-4 w-4 text-slate-400" />
        <span>Drag nodes into the canvas</span>
      </div>
    </aside>
  );
};
