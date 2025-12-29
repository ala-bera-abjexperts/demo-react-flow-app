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
    <div className="h-12 flex items-center gap-2 px-4 border-b border-zinc-800 bg-zinc-900">
      {/* Left: File operations */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <File className="w-4 h-4 mr-2" />
              New
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create new workflow</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save workflow (Ctrl+S)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onLoad}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Load
            </Button>
          </TooltipTrigger>
          <TooltipContent>Load workflow</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Center: Editing actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Right: View controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={snapToGrid ? "default" : "ghost"}
              size="icon"
              onClick={onToggleSnap}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Snap to Grid</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
