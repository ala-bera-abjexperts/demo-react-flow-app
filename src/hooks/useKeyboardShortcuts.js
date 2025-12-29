import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectAll,
  onSave,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input field
      const isInputField = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (isInputField) return;

      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }

      // Ctrl+Y / Cmd+Shift+Z - Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo?.();
      }

      // Ctrl+C / Cmd+C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        onCopy?.();
      }

      // Ctrl+V / Cmd+V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        onPaste?.();
      }

      // Delete / Backspace - Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete?.();
      }

      // Ctrl+D / Cmd+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        onDuplicate?.();
      }

      // Ctrl+A / Cmd+A - Select All
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onSelectAll?.();
      }

      // Ctrl+S / Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, onCopy, onPaste, onDelete, onDuplicate, onSelectAll, onSave]);
}
