import {
  File,
  Save,
  FolderOpen,
  Undo2,
  Redo2,
  Grid3x3,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";

export function Toolbar({
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onToggleSnap,
  canUndo,
  canRedo,
  snapToGrid,
}) {
  return (
    <div className="h-12 flex items-center gap-3 px-4 border-b-2 border-[var(--cyber-border-bright)] bg-[var(--cyber-bg-dark)] relative overflow-hidden">
      {/* Animated accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-magenta), transparent)',
          boxShadow: '0 0 8px var(--cyber-cyan-glow)'
        }}
      />

      {/* Left: File operations */}
      <div className="flex items-center gap-1 relative z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-bold uppercase tracking-wider mono bg-transparent border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:bg-[var(--cyber-bg-surface)] text-[var(--cyber-text-medium)] hover:text-[var(--cyber-cyan)] transition-all duration-200 hover:shadow-[0_0_10px_var(--cyber-cyan-glow)]"
              style={{ borderRadius: 0 }}
            >
              <File className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
              NEW
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border-bright)] text-[var(--cyber-text-bright)] mono text-xs" style={{ borderRadius: 0 }}>
            CREATE WORKFLOW
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="h-8 text-xs font-bold uppercase tracking-wider mono bg-transparent border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:bg-[var(--cyber-bg-surface)] text-[var(--cyber-text-medium)] hover:text-[var(--cyber-cyan)] transition-all duration-200 hover:shadow-[0_0_10px_var(--cyber-cyan-glow)]"
              style={{ borderRadius: 0 }}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
              SAVE
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border-bright)] text-[var(--cyber-text-bright)] mono text-xs" style={{ borderRadius: 0 }}>
            SAVE (CTRL+S)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoad}
              className="h-8 text-xs font-bold uppercase tracking-wider mono bg-transparent border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:bg-[var(--cyber-bg-surface)] text-[var(--cyber-text-medium)] hover:text-[var(--cyber-cyan)] transition-all duration-200 hover:shadow-[0_0_10px_var(--cyber-cyan-glow)]"
              style={{ borderRadius: 0 }}
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
              LOAD
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border-bright)] text-[var(--cyber-text-bright)] mono text-xs" style={{ borderRadius: 0 }}>
            LOAD WORKFLOW
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-7 w-px bg-[var(--cyber-border-bright)]" />

      {/* Center: Editing actions */}
      <div className="flex items-center gap-1 relative z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 bg-transparent border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:bg-[var(--cyber-bg-surface)] text-[var(--cyber-text-medium)] hover:text-[var(--cyber-cyan)] transition-all duration-200 hover:shadow-[0_0_10px_var(--cyber-cyan-glow)] disabled:opacity-30 disabled:hover:border-[var(--cyber-border)] disabled:hover:shadow-none"
              style={{ borderRadius: 0 }}
            >
              <Undo2 className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border-bright)] text-[var(--cyber-text-bright)] mono text-xs" style={{ borderRadius: 0 }}>
            UNDO (CTRL+Z)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 bg-transparent border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:bg-[var(--cyber-bg-surface)] text-[var(--cyber-text-medium)] hover:text-[var(--cyber-cyan)] transition-all duration-200 hover:shadow-[0_0_10px_var(--cyber-cyan-glow)] disabled:opacity-30 disabled:hover:border-[var(--cyber-border)] disabled:hover:shadow-none"
              style={{ borderRadius: 0 }}
            >
              <Redo2 className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border-bright)] text-[var(--cyber-text-bright)] mono text-xs" style={{ borderRadius: 0 }}>
            REDO (CTRL+Y)
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-7 w-px bg-[var(--cyber-border-bright)]" />

      {/* Right: View controls */}
      <div className="flex items-center gap-1 relative z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSnap}
              className="h-8 w-8 bg-transparent border-2 transition-all duration-200 hover:shadow-[0_0_10px_var(--cyber-cyan-glow)]"
              style={{
                borderColor: snapToGrid ? 'var(--cyber-cyan)' : 'var(--cyber-border)',
                background: snapToGrid ? 'var(--cyber-bg-surface)' : 'transparent',
                color: snapToGrid ? 'var(--cyber-cyan)' : 'var(--cyber-text-medium)',
                boxShadow: snapToGrid ? '0 0 15px var(--cyber-cyan-glow)' : 'none',
                borderRadius: 0
              }}
            >
              <Grid3x3 className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[var(--cyber-bg-elevated)] border-[var(--cyber-border-bright)] text-[var(--cyber-text-bright)] mono text-xs" style={{ borderRadius: 0 }}>
            GRID SNAP {snapToGrid ? 'ON' : 'OFF'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
