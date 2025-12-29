import { Node, Edge } from "@xyflow/react";

export interface WorkflowNode extends Node {
  data: {
    label: string;
    nodeNumber: number;
  };
}

export interface WorkflowEdge extends Edge {}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  timestamp: number;
}

export interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry;
  future: HistoryEntry[];
}

export type NodeType = "input" | "default" | "output";

export interface DragItem {
  type: NodeType;
}
