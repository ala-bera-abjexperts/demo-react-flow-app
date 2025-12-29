import { useCallback, useRef, useState } from "react";
import { WorkflowNode, WorkflowEdge, HistoryEntry, HistoryState } from "../types/workflow";

interface UseHistoryOptions {
  maxHistorySize?: number;
  onStateChange?: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
}

export function useHistory(
  initialNodes: WorkflowNode[],
  initialEdges: WorkflowEdge[],
  options: UseHistoryOptions = {}
) {
  const { maxHistorySize = 50, onStateChange } = options;

  const [history, setHistory] = useState<HistoryState>(() => ({
    past: [],
    present: {
      nodes: initialNodes,
      edges: initialEdges,
      timestamp: Date.now(),
    },
    future: [],
  }));

  // Track if we're in the middle of undo/redo to prevent auto-commits
  const isUndoRedoRef = useRef(false);

  // Track pending changes that haven't been committed yet
  const pendingChangesRef = useRef<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null>(null);

  /**
   * Commit current state to history
   * Called explicitly on meaningful actions (drag end, add node, delete, etc.)
   */
  const commit = useCallback((nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    // Don't commit during undo/redo
    if (isUndoRedoRef.current) return;

    setHistory((prev) => {
      // Don't commit if nothing changed
      const nodesChanged = JSON.stringify(prev.present.nodes) !== JSON.stringify(nodes);
      const edgesChanged = JSON.stringify(prev.present.edges) !== JSON.stringify(edges);

      if (!nodesChanged && !edgesChanged) {
        return prev;
      }

      const newEntry: HistoryEntry = {
        nodes,
        edges,
        timestamp: Date.now(),
      };

      // Limit history size
      const newPast = [...prev.past, prev.present].slice(-maxHistorySize);

      return {
        past: newPast,
        present: newEntry,
        future: [], // Clear future when new action is taken
      };
    });

    // Clear pending changes
    pendingChangesRef.current = null;
  }, [maxHistorySize]);

  /**
   * Update current state without committing to history
   * Used for intermediate states during drag
   */
  const updatePresent = useCallback((nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    if (isUndoRedoRef.current) return;

    setHistory((prev) => ({
      ...prev,
      present: {
        nodes,
        edges,
        timestamp: Date.now(),
      },
    }));

    // Store pending changes for potential commit
    pendingChangesRef.current = { nodes, edges };
  }, []);

  /**
   * Undo to previous state
   */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      isUndoRedoRef.current = true;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      const newState = {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };

      // Notify of state change
      if (onStateChange) {
        onStateChange(previous.nodes, previous.edges);
      }

      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);

      return newState;
    });
  }, [onStateChange]);

  /**
   * Redo to next state
   */
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      isUndoRedoRef.current = true;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      const newState = {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };

      // Notify of state change
      if (onStateChange) {
        onStateChange(next.nodes, next.edges);
      }

      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);

      return newState;
    });
  }, [onStateChange]);

  /**
   * Reset history
   */
  const reset = useCallback((nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    setHistory({
      past: [],
      present: {
        nodes,
        edges,
        timestamp: Date.now(),
      },
      future: [],
    });
    pendingChangesRef.current = null;
  }, []);

  return {
    nodes: history.present.nodes,
    edges: history.present.edges,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    commit,
    updatePresent,
    undo,
    redo,
    reset,
    isUndoRedo: () => isUndoRedoRef.current,
  };
}
