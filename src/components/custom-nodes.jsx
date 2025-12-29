import { Handle, Position } from "@xyflow/react";
import {
  Circle,
  Square,
  ArrowRight,
  Trash2,
  Copy,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export const InputNode = ({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative min-w-[260px] rounded-2xl
        transition-all duration-500 ease-out
        ${selected ? "scale-[1.08] z-50" : "hover:scale-[1.02]"}
        ${isHovered ? "animate-float" : ""}
      `}
    >
      {/* Outer Glow */}
      <div
        className={`
        absolute -inset-[2px] rounded-2xl blur-xl opacity-0
        bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600
        transition-opacity duration-500
        ${
          selected
            ? "opacity-70 animate-pulse-glow"
            : isHovered
            ? "opacity-40"
            : ""
        }
      `}
      ></div>

      {/* Gradient Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 animate-gradient opacity-100 shadow-2xl shadow-blue-500/30"></div>

      {/* Inner Content */}
      <div className="relative m-[2px] rounded-[15px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden backdrop-blur-xl">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
            `,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Shimmer Effect */}
        <div
          className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          ${isHovered ? "opacity-100" : ""}
        `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer"></div>
        </div>

        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-cyan-400/5 to-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl shadow-blue-500/50">
                <Circle className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-blue-400/90 uppercase tracking-widest font-semibold">
                  Input Node
                </div>
                {selected && (
                  <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                )}
              </div>
            </div>
            {data.nodeNumber && (
              <div className="relative group/badge">
                <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-sm opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/40 text-xs text-blue-300 font-mono font-semibold shadow-inner">
                  #{data.nodeNumber}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative px-5 py-4">
          <div className="mb-3">
            <div className="text-sm text-zinc-100 font-semibold mb-1.5">
              {data.label}
            </div>
            <div className="text-xs text-zinc-500">Process incoming data</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-sm animate-pulse-glow"></div>
                <div className="relative w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500"></div>
              </div>
              <span>Active</span>
            </div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full bg-blue-500/30 ${
                    i === 0 ? "animate-pulse" : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`
          absolute top-4 right-4 flex items-center gap-1.5
          transition-all duration-300
          ${
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-3 pointer-events-none"
          }
        `}
        >
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 hover:border-blue-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-blue-400 transition-colors" />
          </button>
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 hover:border-blue-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-blue-400 transition-colors" />
          </button>
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-red-950/80 border border-zinc-700/70 hover:border-red-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-5 !h-5 !bg-gradient-to-br !from-blue-400 !to-cyan-500 !border-[3px] !border-zinc-900 !shadow-xl !shadow-blue-500/60 transition-all hover:!scale-125 hover:!shadow-blue-500/80"
      />
    </div>
  );
};

export const DefaultNode = ({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative min-w-[260px] rounded-2xl
        transition-all duration-500 ease-out
        ${selected ? "scale-[1.08] z-50" : "hover:scale-[1.02]"}
        ${isHovered ? "animate-float" : ""}
      `}
    >
      {/* Outer Glow */}
      <div
        className={`
        absolute -inset-[2px] rounded-2xl blur-xl opacity-0
        bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-600
        transition-opacity duration-500
        ${
          selected
            ? "opacity-70 animate-pulse-glow"
            : isHovered
            ? "opacity-40"
            : ""
        }
      `}
      ></div>

      {/* Gradient Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 via-fuchsia-400 to-purple-500 animate-gradient opacity-100 shadow-2xl shadow-purple-500/30"></div>

      {/* Inner Content */}
      <div className="relative m-[2px] rounded-[15px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden backdrop-blur-xl">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)
            `,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Shimmer Effect */}
        <div
          className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          ${isHovered ? "opacity-100" : ""}
        `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer"></div>
        </div>

        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-fuchsia-400/5 to-purple-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-xl shadow-purple-500/50">
                <Square className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-purple-400/90 uppercase tracking-widest font-semibold">
                  Process Node
                </div>
                {selected && (
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                )}
              </div>
            </div>
            {data.nodeNumber && (
              <div className="relative group/badge">
                <div className="absolute inset-0 bg-purple-500/30 rounded-lg blur-sm opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 border border-purple-500/40 text-xs text-purple-300 font-mono font-semibold shadow-inner">
                  #{data.nodeNumber}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative px-5 py-4">
          <div className="mb-3">
            <div className="text-sm text-zinc-100 font-semibold mb-1.5">
              {data.label}
            </div>
            <div className="text-xs text-zinc-500">Transform and process</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-sm animate-pulse-glow"></div>
                <div className="relative w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500"></div>
              </div>
              <span>Processing</span>
            </div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full bg-purple-500/30 ${
                    i === 1 ? "animate-pulse" : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`
          absolute top-4 right-4 flex items-center gap-1.5
          transition-all duration-300
          ${
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-3 pointer-events-none"
          }
        `}
        >
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 hover:border-purple-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-purple-400 transition-colors" />
          </button>
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 hover:border-purple-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-purple-400 transition-colors" />
          </button>
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-red-950/80 border border-zinc-700/70 hover:border-red-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-5 !h-5 !bg-gradient-to-br !from-purple-400 !to-fuchsia-500 !border-[3px] !border-zinc-900 !shadow-xl !shadow-purple-500/60 transition-all hover:!scale-125 hover:!shadow-purple-500/80"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-5 !h-5 !bg-gradient-to-br !from-purple-400 !to-fuchsia-500 !border-[3px] !border-zinc-900 !shadow-xl !shadow-purple-500/60 transition-all hover:!scale-125 hover:!shadow-purple-500/80"
      />
    </div>
  );
};

export const OutputNode = ({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative min-w-[260px] rounded-2xl
        transition-all duration-500 ease-out
        ${selected ? "scale-[1.08] z-50" : "hover:scale-[1.02]"}
        ${isHovered ? "animate-float" : ""}
      `}
    >
      {/* Outer Glow */}
      <div
        className={`
        absolute -inset-[2px] rounded-2xl blur-xl opacity-0
        bg-gradient-to-r from-green-500 via-emerald-400 to-green-600
        transition-opacity duration-500
        ${
          selected
            ? "opacity-70 animate-pulse-glow"
            : isHovered
            ? "opacity-40"
            : ""
        }
      `}
      ></div>

      {/* Gradient Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 animate-gradient opacity-100 shadow-2xl shadow-green-500/30"></div>

      {/* Inner Content */}
      <div className="relative m-[2px] rounded-[15px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden backdrop-blur-xl">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.5) 1px, transparent 1px)
            `,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Shimmer Effect */}
        <div
          className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          ${isHovered ? "opacity-100" : ""}
        `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer"></div>
        </div>

        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-green-500/20 bg-gradient-to-r from-green-500/10 via-emerald-400/5 to-green-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-xl shadow-green-500/50">
                <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-green-400/90 uppercase tracking-widest font-semibold">
                  Output Node
                </div>
                {selected && (
                  <Sparkles className="w-3 h-3 text-green-400 animate-pulse" />
                )}
              </div>
            </div>
            {data.nodeNumber && (
              <div className="relative group/badge">
                <div className="absolute inset-0 bg-green-500/30 rounded-lg blur-sm opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/40 text-xs text-green-300 font-mono font-semibold shadow-inner">
                  #{data.nodeNumber}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative px-5 py-4">
          <div className="mb-3">
            <div className="text-sm text-zinc-100 font-semibold mb-1.5">
              {data.label}
            </div>
            <div className="text-xs text-zinc-500">
              Final output destination
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-sm animate-pulse-glow"></div>
                <div className="relative w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500"></div>
              </div>
              <span>Ready</span>
            </div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full bg-green-500/30 ${
                    i === 2 ? "animate-pulse" : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`
          absolute top-4 right-4 flex items-center gap-1.5
          transition-all duration-300
          ${
            isHovered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-3 pointer-events-none"
          }
        `}
        >
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 hover:border-green-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-green-400 transition-colors" />
          </button>
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 hover:border-green-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-green-400 transition-colors" />
          </button>
          <button className="p-2 rounded-lg bg-zinc-800/90 hover:bg-red-950/80 border border-zinc-700/70 hover:border-red-500/50 transition-all shadow-lg backdrop-blur-sm group/btn">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-5 !h-5 !bg-gradient-to-br !from-green-400 !to-emerald-500 !border-[3px] !border-zinc-900 !shadow-xl !shadow-green-500/60 transition-all hover:!scale-125 hover:!shadow-green-500/80"
      />
    </div>
  );
};
