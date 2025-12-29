import { useEffect, useCallback } from "react";
import { WorkflowNode, WorkflowEdge } from "../types/workflow";

const STORAGE_KEY = "react-flow-workflow";

interface PersistedState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: number;
}

const CURRENT_VERSION = 1;

export function usePersistence(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  enabled: boolean = true
) {
  /**
   * Load state from localStorage
   */
  const loadState = useCallback((): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null => {
    if (!enabled) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: PersistedState = JSON.parse(stored);

      // Version check for migration support
      if (parsed.version !== CURRENT_VERSION) {
        console.warn("Stored workflow version mismatch, ignoring stored data");
        return null;
      }

      return {
        nodes: parsed.nodes,
        edges: parsed.edges,
      };
    } catch (error) {
      console.error("Failed to load workflow from localStorage:", error);
      return null;
    }
  }, [enabled]);

  /**
   * Save state to localStorage
   */
  const saveState = useCallback(
    (nodesToSave: WorkflowNode[], edgesToSave: WorkflowEdge[]) => {
      if (!enabled) return;

      try {
        const toStore: PersistedState = {
          nodes: nodesToSave,
          edges: edgesToSave,
          version: CURRENT_VERSION,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch (error) {
        console.error("Failed to save workflow to localStorage:", error);
      }
    },
    [enabled]
  );

  /**
   * Clear persisted state
   */
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear workflow from localStorage:", error);
    }
  }, []);

  /**
   * Auto-save on changes (debounced)
   */
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      saveState(nodes, edges);
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, enabled, saveState]);

  return {
    loadState,
    saveState,
    clearState,
  };
}
