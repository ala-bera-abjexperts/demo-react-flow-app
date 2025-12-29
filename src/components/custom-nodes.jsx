import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import {
  Circle,
  Square,
  ArrowRight,
  Trash2,
  Copy,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function BaseNode({
  id,
  data,
  selected,
  nodeType,
  icon: Icon,
  borderColor,
  iconBg,
  iconColor,
  description,
  handles,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { getNodes, setNodes, getEdges, setEdges, getNode, addNodes } =
    useReactFlow();

  // --- DELETE NODE ---
  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
  }, [id, setNodes, setEdges]);

  // --- DUPLICATE NODE ---
  const handleDuplicate = useCallback(() => {
    const nodeToDuplicate = getNode(id);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: `${id}-copy-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 40,
        y: nodeToDuplicate.position.y + 40,
      },
      data: {
        ...nodeToDuplicate.data,
        label: nodeToDuplicate.data.label + " Copy",
      },
    };

    addNodes([newNode]);
  }, [id, getNode, addNodes]);

  // --- SETTINGS ---
  const handleSettings = useCallback(() => {
    alert(`Open settings for node: ${data.label}`);
  }, [data.label]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-60 rounded-xl border bg-[var(--cyber-bg-surface)]
        transition-all duration-[var(--duration-fast)]
        ${selected ? "shadow-cyber-node" : "hover:shadow-cyber-glow"}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--cyber-border)]">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconBg} border ${iconColor.replace(
            "text-",
            "border-"
          )}/25 transition-all duration-[var(--duration-fast)]`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-xs font-semibold ${iconColor} uppercase tracking-wider`}
          >
            {nodeType}
          </div>
        </div>
        {data.nodeNumber && (
          <span className="text-[10px] text-[var(--cyber-text-dim)] font-mono select-none">
            #{data.nodeNumber}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-[var(--cyber-text-bright)] truncate">
          {data.label}
        </div>
        <div className="text-xs text-[var(--cyber-text-medium)] mt-1 line-clamp-2">
          {description}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`
          absolute -top-2 -right-2 flex gap-1
          transition-all duration-[var(--duration-fast)]
          ${
            isHovered
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }
        `}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSettings}
              className="h-6 w-6 rounded-md bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:text-[var(--cyber-cyan)]"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDuplicate}
              className="h-6 w-6 rounded-md bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:text-[var(--cyber-cyan)]"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              className="h-6 w-6 rounded-md bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border)] hover:border-[var(--cyber-magenta)] hover:text-[var(--cyber-magenta)]"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>

      {/* Handles */}
      {handles.includes("target-left") && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-[var(--cyber-cyan)] !border-2 !border-[var(--cyber-bg-dark)] transition-transform duration-[var(--duration-fast)] hover:!scale-125"
        />
      )}
      {handles.includes("source-right") && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-[var(--cyber-cyan)] !border-2 !border-[var(--cyber-bg-dark)] transition-transform duration-[var(--duration-fast)] hover:!scale-125"
        />
      )}
    </div>
  );
}

/* Node Types */
export const InputNode = ({ data, selected }) => (
  <BaseNode
    data={data}
    selected={selected}
    nodeType="Input"
    icon={Circle}
    borderColor="border-[var(--cyber-cyan)]"
    iconBg="bg-[var(--cyber-cyan)/10]"
    iconColor="text-[var(--cyber-cyan)]"
    description="Entry point for data"
    handles={["source-right"]}
  />
);

export const DefaultNode = ({ data, selected }) => (
  <BaseNode
    data={data}
    selected={selected}
    nodeType="Process"
    icon={Square}
    borderColor="border-[var(--cyber-magenta)]"
    iconBg="bg-[var(--cyber-magenta)/10]"
    iconColor="text-[var(--cyber-magenta)]"
    description="Transform and process"
    handles={["target-left", "source-right"]}
  />
);

export const OutputNode = ({ data, selected }) => (
  <BaseNode
    data={data}
    selected={selected}
    nodeType="Output"
    icon={ArrowRight}
    borderColor="border-[var(--cyber-yellow)]"
    iconBg="bg-[var(--cyber-yellow)/10]"
    iconColor="text-[var(--cyber-yellow)]"
    description="Final output destination"
    handles={["target-left"]}
  />
);
