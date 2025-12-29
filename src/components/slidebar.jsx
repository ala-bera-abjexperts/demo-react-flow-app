import {
  GripVertical,
  Circle,
  Square,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const SliderBar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const components = [
    {
      type: "input",
      label: "Input Node",
      description: "Entry point for data",
      icon: Circle,
      color: "blue",
      gradient: "from-blue-500 via-cyan-400 to-blue-600",
      glowColor: "blue-500",
    },
    {
      type: "default",
      label: "Process Node",
      description: "Transform & compute",
      icon: Square,
      color: "purple",
      gradient: "from-purple-500 via-fuchsia-400 to-purple-600",
      glowColor: "purple-500",
    },
    {
      type: "output",
      label: "Output Node",
      description: "Final result output",
      icon: ArrowRight,
      color: "green",
      gradient: "from-green-500 via-emerald-400 to-green-600",
      glowColor: "green-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 mb-4">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          Available Nodes
        </div>
        <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
      </div>

      {components.map((component, index) => {
        const Icon = component.icon;
        return (
          <div
            key={component.type}
            onDragStart={(event) => onDragStart(event, component.type)}
            draggable
            className="group cursor-grab active:cursor-grabbing"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              {/* Outer Glow on Hover */}
              <div
                className={`
                absolute -inset-[1px] rounded-xl blur-lg opacity-0 group-hover:opacity-60
                bg-gradient-to-r ${component.gradient} transition-opacity duration-300
              `}
              ></div>

              {/* Gradient Border */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${component.gradient} animate-gradient rounded-xl`}
              ></div>

              {/* Inner Content */}
              <div className="relative m-[2px] rounded-[10px] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 overflow-hidden">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                      linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
                    `,
                      backgroundSize: "16px 16px",
                    }}
                  ></div>
                </div>

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-${component.color}-400/10 to-transparent animate-shimmer`}
                  ></div>
                </div>

                <div className="relative flex items-center gap-4 px-4 py-4">
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 transition-transform group-active:scale-110">
                    <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>

                  {/* Icon with Glow */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${component.gradient} rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}
                    ></div>
                    <div
                      className={`
                      relative flex items-center justify-center w-11 h-11 rounded-xl 
                      bg-gradient-to-br ${component.gradient} 
                      shadow-lg shadow-${component.glowColor}/30
                      transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-${component.glowColor}/50
                    `}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="text-sm text-zinc-100 font-semibold group-hover:text-white transition-colors">
                        {component.label}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      {component.description}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div
                      className={`
                      w-2.5 h-2.5 rounded-full 
                      bg-gradient-to-br ${component.gradient} 
                      shadow-lg shadow-${component.glowColor}/50
                      animate-pulse
                    `}
                    ></div>
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-0.5 h-2 rounded-full bg-${component.color}-500/30`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Accent Line */}
                <div
                  className={`
                  absolute bottom-0 left-0 right-0 h-[2px] 
                  bg-gradient-to-r from-transparent via-${component.color}-500/50 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `}
                ></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Divider */}
      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800/50"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="px-3 bg-zinc-900 text-xs text-zinc-600">
            Quick Guide
          </div>
        </div>
      </div>

      {/* Helper Card */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 blur-3xl"></div>
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-zinc-300 mb-1.5">
                How to Build
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed">
                Drag nodes onto the canvas and connect them using the colored
                handles. Build complex workflows in seconds.
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="mt-4 pt-4 border-t border-zinc-800/50 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs font-mono font-semibold text-blue-400">
                3
              </div>
              <div className="text-[10px] text-zinc-600">Types</div>
            </div>
            <div className="text-center border-x border-zinc-800/50">
              <div className="text-xs font-mono font-semibold text-purple-400">
                ∞
              </div>
              <div className="text-[10px] text-zinc-600">Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-mono font-semibold text-green-400">
                ⚡
              </div>
              <div className="text-[10px] text-zinc-600">Fast</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
