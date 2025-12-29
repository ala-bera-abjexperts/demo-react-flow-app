import { useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Terminal,
  Cpu,
  Radio,
  Move,
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
  accentColor,
  glowColor,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group cursor-grab active:cursor-grabbing draggable-node",
        "transition-all duration-200",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-3 p-3 border-2 bg-gradient-to-r from-[var(--cyber-bg-dark)] to-[var(--cyber-bg-surface)]",
          "transition-all duration-200 overflow-hidden"
        )}
        style={{
          borderColor: isHovered ? accentColor : 'var(--cyber-border)',
          boxShadow: isHovered ? `0 0 20px ${glowColor}, -4px 0 20px ${glowColor}` : 'none'
        }}
      >
        {/* Animated background line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-200"
          style={{
            background: accentColor,
            boxShadow: `0 0 10px ${glowColor}`,
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Icon */}
        <div
          className="relative flex items-center justify-center w-10 h-10 border-2 transition-all duration-200"
          style={{
            borderColor: accentColor,
            background: isHovered ? `radial-gradient(circle, ${glowColor}, transparent)` : 'transparent',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <Icon
            className="w-4 h-4 transition-all duration-200"
            style={{
              color: accentColor,
              filter: isHovered ? `drop-shadow(0 0 4px ${glowColor})` : 'none'
            }}
            strokeWidth={2.5}
          />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-bold uppercase tracking-wider mono transition-colors duration-200"
            style={{ color: isHovered ? accentColor : 'var(--cyber-text-bright)' }}
          >
            {label}
          </div>
          <div className="text-[10px] text-[var(--cyber-text-dim)] mono mt-0.5 tracking-wide">
            {description}
          </div>
        </div>

        {/* Drag indicator */}
        <Move
          className={cn(
            "w-4 h-4 transition-all duration-200",
            "opacity-0 group-hover:opacity-100"
          )}
          style={{
            color: accentColor,
            filter: `drop-shadow(0 0 4px ${glowColor})`
          }}
        />

        {/* Corner accents */}
        <div
          className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 transition-opacity duration-200"
          style={{
            borderColor: accentColor,
            opacity: isHovered ? 1 : 0
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 transition-opacity duration-200"
          style={{
            borderColor: accentColor,
            opacity: isHovered ? 1 : 0
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------- SliderBar ------------------------------- */
export const SliderBar = () => {
  return (
    <div className="space-y-3">
      <DraggableNode
        nodeType="input"
        label="INPUT"
        description={'>> INIT DATA STREAM'}
        icon={Terminal}
        accentColor="var(--cyber-cyan)"
        glowColor="var(--cyber-cyan-glow)"
      />

      <DraggableNode
        nodeType="default"
        label="PROCESSOR"
        description={'>> EXEC TRANSFORM'}
        icon={Cpu}
        accentColor="var(--cyber-magenta)"
        glowColor="var(--cyber-magenta-glow)"
      />

      <DraggableNode
        nodeType="output"
        label="OUTPUT"
        description={'>> SEND BROADCAST'}
        icon={Radio}
        accentColor="var(--cyber-yellow)"
        glowColor="var(--cyber-yellow-glow)"
      />
    </div>
  );
};
