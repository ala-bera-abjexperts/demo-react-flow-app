import { Position, Handle } from "@xyflow/react";
import "../App.css";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

export function CustomNode() {
  return (
    <div className="custom-node nodrag">
      <div>Custom Node</div>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "none",
          border: "none",
          width: "1em",
          height: "1em",
        }}
        connectionMode={"loose"}
      >
        <ArrowDropUpIcon
          style={{
            pointEvents: "all",
            fontSize: "1em",
            left: 0,
            position: "absolute",
          }}
        />
      </Handle>
      <Handle type="source" position={Position.Left} id={"a"} />
      <Handle type="source" position={Position.Bottom} id={"b"} />
    </div>
  );
}
