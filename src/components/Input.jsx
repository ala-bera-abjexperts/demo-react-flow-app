import { useCallback } from "react";
import "../App.css";
import { Handle } from "@xyflow/react";
import { Position } from "@xyflow/react";

export function TextUpdateNode() {
  const onChange = useCallback((event) => {
    console.log(event.target.value);
  }, []);

  return (
    <div className="text-updater-node">
      <div className="text-updater-inner-node">
        <label htmlFor="text">Text</label>
        <input type="text" id="text" className="nodrag" onChange={onChange} />
      </div>
      <Handle type="source" position={Position.Left} id={1} />
      <Handle type="source" position={Position.Top} id={2} />
      <Handle type="source" position={Position.Right} id={3} />
    </div>
  );
}
