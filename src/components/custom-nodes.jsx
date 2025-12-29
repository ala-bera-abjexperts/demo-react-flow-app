import { Handle, Position } from "@xyflow/react";
import {
  Circle,
  Square,
  ArrowRight,
  Trash2,
  Copy,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

/* ----------------------------- Base Node Component ----------------------------- */
function BaseNode({
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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-56 rounded-lg border bg-zinc-900
        transition-all duration-150
        ${selected ? `${borderColor} shadow-lg` : "border-zinc-800 hover:border-zinc-700"}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-800">
        <div className={`flex items-center justify-center w-7 h-7 rounded-md ${iconBg} border ${iconColor.replace('text-', 'border-')}/20`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium ${iconColor} uppercase tracking-wide`}>
            {nodeType}
          </div>
        </div>
        {data.nodeNumber && (
          <span className="text-[10px] text-zinc-500 font-mono">
            #{data.nodeNumber}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <div className="text-sm font-medium text-zinc-100 mb-1">
          {data.label}
        </div>
        <div className="text-xs text-zinc-500">
          {description}
        </div>
      </div>

      {/* Action Buttons - Show on hover */}
      <div
        className={`
          absolute -top-2 -right-2 flex gap-1
          transition-opacity duration-150
          ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-md bg-zinc-900 border-zinc-700 hover:border-zinc-600"
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
              className="h-6 w-6 rounded-md bg-zinc-900 border-zinc-700 hover:border-zinc-600"
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
              className="h-6 w-6 rounded-md bg-zinc-900 border-zinc-700 hover:border-red-500/50 hover:text-red-400"
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
          className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-900 transition-transform duration-150 hover:!scale-125"
        />
      )}
      {handles.includes("source-right") && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-900 transition-transform duration-150 hover:!scale-125"
        />
      )}
    </div>
  );
}

/* ----------------------------- Input Node ----------------------------- */
export const InputNode = ({ data, selected }) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      nodeType="Input"
      icon={Circle}
      borderColor="border-blue-500"
      iconBg="bg-blue-500/10"
      iconColor="text-blue-400"
      description="Entry point for data"
      handles={["source-right"]}
    />
  );
};

/* ----------------------------- Default/Process Node ----------------------------- */
export const DefaultNode = ({ data, selected }) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      nodeType="Process"
      icon={Square}
      borderColor="border-purple-500"
      iconBg="bg-purple-500/10"
      iconColor="text-purple-400"
      description="Transform and process"
      handles={["target-left", "source-right"]}
    />
  );
};

/* ----------------------------- Output Node ----------------------------- */
export const OutputNode = ({ data, selected }) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      nodeType="Output"
      icon={ArrowRight}
      borderColor="border-green-500"
      iconBg="bg-green-500/10"
      iconColor="text-green-400"
      description="Final output destination"
      handles={["target-left"]}
    />
  );
};
