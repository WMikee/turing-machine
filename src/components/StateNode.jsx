import { Handle, Position } from "@xyflow/react";

export default function StateNode({ data }) {
  const { label, active, isAccept, isReject } = data;

  // Elegir color según el tipo de estado y si está activo
  let borderStyle = "2px solid var(--border)";
  let backgroundStyle = "var(--code-bg)";
  let colorStyle = "var(--text-h)";
  let shadowStyle = "none";

  if (active) {
    backgroundStyle = "var(--accent)";
    colorStyle = "#fff";
    borderStyle = "3px solid #fff";
  } else if (isAccept) {
    backgroundStyle = "rgba(16, 185, 129, 0.1)";
    colorStyle = "#10b981";
    borderStyle = "2px solid #10b981";
  } else if (isReject) {
    backgroundStyle = "rgba(239, 68, 68, 0.1)";
    colorStyle = "#ef4444";
    borderStyle = "2px solid #ef4444";
  }

  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "8px",
        fontSize: "11px",
        fontWeight: "bold",
        lineHeight: "1.2",
        background: backgroundStyle,
        color: colorStyle,
        border: borderStyle,
        boxShadow: shadowStyle,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Handles para conectar flechas en todas las direcciones */}
      {/* Entradas (Targets) */}
      <Handle
        type="target"
        position={Position.Left}
        id="l_in"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="r_in"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="t_in"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="b_in"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />

      {/* Salidas (Sources) */}
      <Handle
        type="source"
        position={Position.Left}
        id="l_out"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r_out"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="t_out"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b_out"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      />

      <span style={{ userSelect: "none" }}>{label}</span>
    </div>
  );
}
