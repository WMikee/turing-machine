import { useEffect, useMemo } from "react";
import { ReactFlow, Background, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { traducirEstadoCorto } from "../translators";
import StateNode from "./StateNode";
import SelfLoopEdge from "./SelfLoopEdge";
import {
  NODES_MULTICINTA,
  EDGES_MULTICINTA,
  getActiveEdgeId,
  buildFlowEdges,
} from "../graphConfig";

const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  selfLoop: SelfLoopEdge,
};

export default function AutomatonGraph({
  modo,
  estado,
  claveTransicion,
  monoTransitions,
}) {
  const monoGraph = useMemo(() => {
    if (modo !== "monocinta") return null;
    const transitions = monoTransitions ?? {};

    const statesSet = new Set();
    const edges = [];

    const parseKey = (key) => {
      const idx = key.indexOf(",");
      const source = key.slice(0, idx);
      const symb = key.slice(idx + 1); // puede ser "" (blanco)
      return [source, symb];
    };

    for (const [key, regla] of Object.entries(transitions || {})) {
      const [source, symb] = parseKey(key);
      const [write, mover, nextState] = regla;
      statesSet.add(source);
      statesSet.add(nextState);

      const edgeId = `mono-${key}`;
      const symbLabel = symb === "" ? "_" : symb;
      const writeLabel = write === "" ? "_" : write;
      const moverEsp = mover === "R" ? "D" : mover === "L" ? "I" : "S";
      const label = `${symbLabel} → ${writeLabel}, ${moverEsp}`;

      const isSelf = source === nextState;
      if (isSelf) {
        edges.push({
          id: edgeId,
          source,
          target: nextState,
          type: "selfLoop",
          sourceHandle: "t_out",
          targetHandle: "t_in",
          label,
        });
      } else {
        const sourceHandle = mover === "R" ? "r_out" : "l_out";
        const targetHandle = mover === "R" ? "l_in" : "r_in";
        edges.push({
          id: edgeId,
          source,
          target: nextState,
          sourceHandle,
          targetHandle,
          label,
        });
      }
    }

    const states = Array.from(statesSet).sort();
    const cols = Math.max(1, Math.ceil(Math.sqrt(states.length)));
    const spacingX = 320;
    const spacingY = 200;
    const offsetX = 80;
    const offsetY = 120;

    const nodes = states.map((id, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      return {
        id,
        data: { label: traducirEstadoCorto(id) },
        position: { x: offsetX + col * spacingX, y: offsetY + row * spacingY },
      };
    });

    return { nodes, edges };
  }, [modo, monoTransitions]);

  const baseNodes = useMemo(
    () => (modo === "monocinta" ? monoGraph?.nodes ?? [] : NODES_MULTICINTA),
    [modo, monoGraph]
  );
  const baseEdges = useMemo(
    () => (modo === "monocinta" ? monoGraph?.edges ?? [] : EDGES_MULTICINTA),
    [modo, monoGraph]
  );

  const initialNodes = useMemo(
    () =>
      baseNodes.map((n) => ({
        ...n,
        type: "stateNode",
        data: {
          ...n.data,
          active: estado === n.id,
        },
      })),
    // Queremos que se recalculen cuando cambie el layout (modo) o el estado.
    // La posición del nodo se preserva vía `useNodesState` en renders
    // posteriores (solo se actualiza `active`).
    [baseNodes, estado]
  );

  // Controlamos nodos para que el usuario pueda arrastrarlos.
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const activeEdgeId =
    modo === "monocinta" ? `mono-${claveTransicion}` : getActiveEdgeId(modo, claveTransicion);
  const flowEdges = buildFlowEdges(baseEdges, activeEdgeId);

  // Cuando cambia el modo, restablecemos el layout (posiciones base).
  useEffect(() => {
    setNodes(initialNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, monoTransitions]);

  // Cuando cambia el estado, solo actualizamos `data.active`,
  // preservando posiciones movidas por el usuario.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          active: n.id === estado,
        },
      }))
    );
  }, [estado, setNodes]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        height: "480px",
        background: "var(--social-bg)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "var(--shadow)",
        padding: "24px",
        boxSizing: "border-box",
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h3
        style={{
          margin: "0",
          fontSize: "16px",
          color: "var(--text-h)",
          fontWeight: "bold",
          textAlign: "left",
        }}
      >
        Grafo del Autómata (Resaltado e Interactivo en Tiempo Real)
      </h3>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid var(--border)",
          borderRadius: "12px",
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesConnectable={false}
          nodesDraggable={true}
          elementsSelectable={false}
          zoomOnScroll={false}
          // Permite desplazar el canvas arrastrando (y arrastrar nodos sigue
          // funcionando porque `nodesDraggable` toma prioridad).
          panOnDrag={true}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
          onNodesChange={onNodesChange}
        >
          <Background color="var(--border)" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}

