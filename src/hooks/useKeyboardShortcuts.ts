import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const {
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onDelete,
    onDuplicate,
    onSelectAll,
    onSave,
  } = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField = ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (isInputField) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Z / Cmd+Z - Undo
      if (modKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Ctrl+Y / Cmd+Shift+Z - Redo
      if (modKey && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Ctrl+C / Cmd+C - Copy
      if (modKey && e.key === "c") {
        e.preventDefault();
        onCopy?.();
        return;
      }

      // Ctrl+V / Cmd+V - Paste
      if (modKey && e.key === "v") {
        e.preventDefault();
        onPaste?.();
        return;
      }

      // Delete / Backspace - Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDelete?.();
        return;
      }

      // Ctrl+D / Cmd+D - Duplicate
      if (modKey && e.key === "d") {
        e.preventDefault();
        onDuplicate?.();
        return;
      }

      // Ctrl+A / Cmd+A - Select All
      if (modKey && e.key === "a") {
        e.preventDefault();
        onSelectAll?.();
        return;
      }

      // Ctrl+S / Cmd+S - Save
      if (modKey && e.key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, onCopy, onPaste, onDelete, onDuplicate, onSelectAll, onSave]);
}
