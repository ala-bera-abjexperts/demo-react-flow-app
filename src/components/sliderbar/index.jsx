import { useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Circle,
  Square,
  ArrowRight,
  GripVertical,
} from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ----------------------------- Draggable Node ----------------------------- */
function DraggableNode({
  nodeType,
  label,
  description,
  icon: Icon,
  color,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const colorStyles = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
  };

  const onDragStart = (event) => {
    setIsDragging(true);
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab active:cursor-grabbing draggable-node",
        "transition-all duration-150",
        isDragging && "opacity-60"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          "border border-zinc-800 bg-zinc-900",
          "hover:bg-zinc-800/50 hover:border-zinc-700",
          "transition-all duration-150"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-md border",
            colorStyles[color]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-200">{label}</div>
          <div className="text-xs text-zinc-500">{description}</div>
        </div>
        <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

/* -------------------------------- SliderBar ------------------------------- */
export const SliderBar = () => {
  return (
    <div className="space-y-2">
      <DraggableNode
        nodeType="input"
        label="Input"
        description="Entry point"
        icon={Circle}
        color="blue"
      />

      <DraggableNode
        nodeType="default"
        label="Process"
        description="Transform data"
        icon={Square}
        color="purple"
      />

      <DraggableNode
        nodeType="output"
        label="Output"
        description="Final result"
        icon={ArrowRight}
        color="green"
      />
    </div>
  );
};
