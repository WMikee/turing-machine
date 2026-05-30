import { EdgeLabelRenderer } from "@xyflow/react";

export default function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  style = {},
  markerEnd,
  label,
}) {
  // Creamos un lazo aéreo elegante curvándose hacia arriba
  // Comenzamos en el punto superior del nodo (sourceX, sourceY)
  const loopPath = `M ${sourceX} ${sourceY} C ${sourceX + 40} ${sourceY - 60}, ${sourceX - 40} ${sourceY - 60}, ${sourceX} ${sourceY}`;

  // Resaltado de la arista activa
  const isActive = style.stroke === "var(--accent)";

  // Posición del label del self-loop.
  // Antes lo movimos demasiado lejos; ahora lo regresamos cerca de la curva
  // y solo hacemos un pequeño "nudge" para reducir superposiciones.
  const labelX = sourceX + 8;
  const labelY = sourceY - 58;

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          fill: "none",
        }}
        className="react-flow__edge-path"
        d={loopPath}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY}px)`,
              background: isActive ? "var(--accent-bg)" : "var(--code-bg)",
              padding: "2px 6px",
              borderRadius: "4px",
              border: isActive
                ? "1.5px solid var(--accent)"
                : "1px solid var(--border)",
              fontSize: "10px",
              fontFamily: "var(--mono)",
              fontWeight: "600",
              color: isActive ? "#fff" : "var(--text-h)",
              pointerEvents: "none",
              zIndex: 10,
              boxShadow: "var(--shadow)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
