export const NODES_MONOCINTA = [
  { id: "Buscar_A", data: { label: "Buscar A" }, position: { x: 100, y: 150 } },
  { id: "Buscar_B", data: { label: "Buscar B" }, position: { x: 500, y: 150 } },
  { id: "Buscar_C", data: { label: "Buscar C" }, position: { x: 900, y: 150 } },
  { id: "Regresar", data: { label: "Regresar" }, position: { x: 500, y: 350 } },
  {
    id: "Verificar_Fin",
    data: { label: "Verificar Fin" },
    position: { x: 100, y: 350 },
  },
  {
    id: "ACEPTAR",
    data: { label: "ACEPTAR", isAccept: true },
    position: { x: 100, y: 550 },
  },
  {
    id: "RECHAZAR",
    data: { label: "RECHAZAR", isReject: true },
    position: { x: 900, y: 550 },
  },
];

export const EDGES_MONOCINTA = [
  {
    id: "e1",
    source: "Buscar_A",
    target: "Buscar_B",
    sourceHandle: "r_out",
    targetHandle: "l_in",
    label: "a → X, R",
  },
  {
    id: "e2",
    source: "Buscar_A",
    target: "Verificar_Fin",
    sourceHandle: "b_out",
    targetHandle: "t_in",
    label: "Y → Y, R",
  },
  {
    id: "e3",
    source: "Buscar_B",
    target: "Buscar_B",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "a→a,R | Y→Y,R",
    type: "selfLoop",
  },
  {
    id: "e4",
    source: "Buscar_B",
    target: "Buscar_C",
    sourceHandle: "r_out",
    targetHandle: "l_in",
    label: "b → Y, R",
  },
  {
    id: "e5",
    source: "Buscar_C",
    target: "Buscar_C",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "b→b,R | Z→Z,R",
    type: "selfLoop",
  },
  {
    id: "e6",
    source: "Buscar_C",
    target: "Regresar",
    sourceHandle: "b_out",
    targetHandle: "r_in",
    label: "c → Z, L",
  },
  {
    id: "e7",
    source: "Regresar",
    target: "Regresar",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "a,b,Y,Z (L)",
    type: "selfLoop",
  },
  {
    id: "e8",
    source: "Regresar",
    target: "Buscar_A",
    sourceHandle: "l_out",
    targetHandle: "b_in",
    label: "X → X, R",
  },
  {
    id: "e9",
    source: "Verificar_Fin",
    target: "Verificar_Fin",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "Y, Z (R)",
    type: "selfLoop",
  },
  {
    id: "e10",
    source: "Verificar_Fin",
    target: "ACEPTAR",
    sourceHandle: "b_out",
    targetHandle: "t_in",
    label: "_ → _, R",
  },
];

export const NODES_MULTICINTA = [
  { id: "Contar_A", data: { label: "Contar A" }, position: { x: 100, y: 200 } },
  {
    id: "Comparar_B",
    data: { label: "Comparar B" },
    position: { x: 500, y: 200 },
  },
  {
    id: "Comparar_C",
    data: { label: "Comparar C" },
    position: { x: 900, y: 200 },
  },
  {
    id: "ACEPTAR",
    data: { label: "ACEPTAR", isAccept: true },
    position: { x: 1300, y: 200 },
  },
  {
    id: "RECHAZAR",
    data: { label: "RECHAZAR", isReject: true },
    position: { x: 500, y: 400 },
  },
];

export const EDGES_MULTICINTA = [
  {
    id: "em1",
    source: "Contar_A",
    target: "Contar_A",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "a,_ → a,D,1,D",
    type: "selfLoop",
  },
  {
    id: "em2",
    source: "Contar_A",
    target: "Comparar_B",
    sourceHandle: "r_out",
    targetHandle: "l_in",
    label: "b,_ → b,S,_,I",
  },
  {
    id: "em3",
    source: "Comparar_B",
    target: "Comparar_B",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "b,1 → b,D,1,I",
    type: "selfLoop",
  },
  {
    id: "em4",
    source: "Comparar_B",
    target: "Comparar_C",
    sourceHandle: "r_out",
    targetHandle: "l_in",
    label: "c,_ → c,S,_,D",
  },
  {
    id: "em5",
    source: "Comparar_C",
    target: "Comparar_C",
    sourceHandle: "t_out",
    targetHandle: "t_in",
    label: "c,1 → c,D,1,D",
    type: "selfLoop",
  },
  {
    id: "em6",
    source: "Comparar_C",
    target: "ACEPTAR",
    sourceHandle: "r_out",
    targetHandle: "l_in",
    label: "_,_ → _,S,_,S",
  },
];

export const getActiveEdgeId = (modo, claveTransicion) => {
  if (modo === "monocinta") {
    const [est, symb] = claveTransicion.split(",");
    if (est === "Buscar_A" && symb === "a") return "e1";
    if (est === "Buscar_A" && symb === "Y") return "e2";
    if (est === "Buscar_B" && (symb === "a" || symb === "Y")) return "e3";
    if (est === "Buscar_B" && symb === "b") return "e4";
    if (est === "Buscar_C" && (symb === "b" || symb === "Z")) return "e5";
    if (est === "Buscar_C" && symb === "c") return "e6";
    if (
      est === "Regresar" &&
      (symb === "a" || symb === "b" || symb === "Y" || symb === "Z")
    )
      return "e7";
    if (est === "Regresar" && symb === "X") return "e8";
    if (est === "Verificar_Fin" && (symb === "Y" || symb === "Z")) return "e9";
    if (est === "Verificar_Fin" && symb === "") return "e10";
  } else {
    const [est, sym1] = claveTransicion.split(",");
    if (est === "Contar_A" && sym1 === "a") return "em1";
    if (est === "Contar_A" && sym1 === "b") return "em2";
    if (est === "Comparar_B" && sym1 === "b") return "em3";
    if (est === "Comparar_B" && sym1 === "c") return "em4";
    if (est === "Comparar_C" && sym1 === "c") return "em5";
    if (est === "Comparar_C" && sym1 === "") return "em6";
  }
  return null;
};

export const buildFlowEdges = (baseEdges, activeEdgeId) =>
  baseEdges.map((edge) => {
    const isActive = edge.id === activeEdgeId;
    return {
      ...edge,
      animated: isActive,
      style: {
        stroke: isActive ? "var(--accent)" : "var(--border)",
        strokeWidth: isActive ? 3 : 1.5,
        transition: "all 0.25s ease",
      },
      labelStyle: {
        // ReactFlow renderiza el label en un contenedor HTML (edge-label),
        // por eso aplicamos un badge oscuro con padding/border.
        color: isActive ? "#fff" : "var(--text-h)",
        fill: isActive ? "var(--accent)" : "var(--text-h)",
        fontWeight: isActive ? "bold" : "normal",
        fontSize: "9px",
      },
      // ReactFlow usa `labelBgStyle` para el fondo del badge.
      labelBgStyle: {
        background: isActive ? "var(--accent-bg)" : "var(--code-bg)",
        border: isActive
          ? "1px solid var(--accent-border)"
          : "1px solid var(--border)",
        borderRadius: "6px",
        padding: "2px 6px",
        boxSizing: "border-box",
      },
    };
  });
