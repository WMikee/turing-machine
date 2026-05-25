import { useState, useEffect, useRef } from "react";
import { useTuringMachine } from "./hooks/useTuringMachine";
import { useMultiTapeTuringMachine } from "./hooks/useMultiTapeTuringMachine";
import TapeDisplay from "./components/TapeDisplay";
import MultiTapeDisplay from "./components/MultiTapeDisplay";

const traducirEstado = (est) => {
  if (est === "q0") return "Iniciando escaneo básico...";
  if (est.startsWith("q_scan_")) {
    const parts = est.split("_");
    const activeBlock = parts[2] || "?";
    return `Revisando orden (Grupo activo: '${activeBlock}')`;
  }
  if (est === "q_go_left") return "Regresando cabezal al extremo izquierdo...";
  if (est === "q_match_start") return "Iniciando nueva ronda de conteo...";
  if (est.startsWith("q_mark_block1_")) {
    const char = est.replace("q_mark_block1_", "");
    return `Buscando la siguiente '${char}' sin contar en el primer grupo`;
  }
  if (est === "q_check_all_marked")
    return "Verificando que todos los grupos estén completos...";
  if (est.startsWith("q_skip_block_")) {
    const char = est.replace("q_skip_block_", "");
    return `Saltando letras del grupo '${char}'`;
  }
  if (est.startsWith("q_mark_block_")) {
    const char = est.replace("q_mark_block_", "");
    return `Buscando la siguiente '${char}' sin contar en su grupo`;
  }

  if (est.startsWith("q_count_first_")) {
    const char = est.replace("q_count_first_", "");
    return `Contando el primer bloque (Grupo activo: '${char}'). Escribiendo en Cinta 2.`;
  }
  if (est.startsWith("q_match_L_")) {
    const parts = est.split("_");
    const activeBlock = parts[3] || "?";
    return `Comparando bloque '${activeBlock}' moviendo Cinta 2 a la izquierda`;
  }
  if (est.startsWith("q_match_R_")) {
    const parts = est.split("_");
    const activeBlock = parts[3] || "?";
    return `Comparando bloque '${activeBlock}' moviendo Cinta 2 a la derecha`;
  }

  if (est === "ACEPTAR") return "¡Cadena VÁLIDA y Aceptada!";
  if (est === "RECHAZAR") return "Cadena RECHAZADA";
  return est;
};

const traducirRegla = (est, symb, regl) => {
  if (!regl) return "";
  const [escribir, mover, nuevoEstado] = regl;
  const dir = mover === "R" ? "derecha" : "izquierda";

  const symLabel = symb === "" ? "celda vacía (_)" : `'${symb}'`;
  const escLabel = escribir === "" ? "celda vacía (_)" : `'${escribir}'`;

  let accion = `Leo ${symLabel}, escribo ${escLabel}, muevo el cabezal a la ${dir}`;

  if (est === "q0") {
    return `${accion} para comenzar a escanear el grupo de '${symb}'.`;
  }
  if (est.startsWith("q_scan_")) {
    if (symb === escribir && nuevoEstado === est) {
      return `${accion} para continuar revisando el grupo de '${symb}'.`;
    }
    if (nuevoEstado === "RECHAZAR") {
      return `¡Letra '${symb}' fuera de lugar detectada! Rechazo la cadena inmediatamente.`;
    }
    if (nuevoEstado === "q_go_left") {
      return `Fin de la cadena alcanzado de forma correcta. ${accion} para regresar al inicio.`;
    }
    const currentGroup = est.split("_")[2];
    const nextChar = nuevoEstado.split("_")[2];
    return `Termina el grupo de '${currentGroup}' y empieza el de '${nextChar}'. ${accion}.`;
  }
  if (est === "q_go_left") {
    if (nuevoEstado === "q_match_start") {
      return `Llegué al extremo izquierdo. ${accion} para iniciar el conteo.`;
    }
    return `Regresando: ${accion}.`;
  }
  if (est === "q_match_start") {
    if (nuevoEstado === "ACEPTAR") {
      return `¡Todo está perfectamente contado! Acepto la cadena.`;
    }
    return `Encuentro el inicio. ${accion} para contar la primera '${symb}' (marcando como '${escribir}').`;
  }
  if (est.startsWith("q_mark_block1_")) {
    if (nuevoEstado === "q_check_all_marked") {
      return `El primer grupo está totalmente contado. ${accion} para verificar los demás grupos.`;
    }
    if (symb === escribir) {
      return `Sigo buscando en el primer grupo: ${accion}.`;
    }
    return `Encuentro una '${symb}' sin contar. La cuento (escribo '${escribir}') y ${accion}.`;
  }
  if (est === "q_check_all_marked") {
    if (nuevoEstado === "ACEPTAR") {
      return `¡Verificación completada! Todas las letras están contadas. Acepto la cadena.`;
    }
    return `Verificando: ${accion}.`;
  }
  if (est.startsWith("q_skip_block_")) {
    if (nuevoEstado === "q_go_left") {
      return `Ronda de conteo terminada con éxito. ${accion} para regresar y contar de nuevo.`;
    }
    if (nuevoEstado.startsWith("q_mark_block_")) {
      return `Paso al grupo de las '${nuevoEstado.replace("q_mark_block_", "")}'. ${accion}.`;
    }
    if (nuevoEstado.startsWith("q_skip_block_") && nuevoEstado !== est) {
      return `Salto al grupo de las '${nuevoEstado.replace("q_skip_block_", "")}'. ${accion}.`;
    }
    return `Saltando letras del grupo actual: ${accion}.`;
  }
  if (est.startsWith("q_mark_block_")) {
    if (symb === escribir) {
      return `Buscando en este grupo: ${accion}.`;
    }
    return `Encuentro una '${symb}' sin contar en su grupo. La cuento (escribo '${escribir}') y ${accion}.`;
  }

  return `${accion} y cambio al estado ${nuevoEstado}.`;
};

const traducirReglaMulticinta = (est, sym1, sym2, regl) => {
  if (!regl) return "";
  const [write1, move1, write2, move2, nuevoEstado] = regl;
  const dir1 =
    move1 === "R" ? "derecha" : move1 === "L" ? "izquierda" : "mantengo";
  const dir2 =
    move2 === "R" ? "derecha" : move2 === "L" ? "izquierda" : "mantengo";

  const sym1Label = sym1 === "" ? "celda vacía (_)" : `'${sym1}'`;
  const sym2Label = sym2 === "" ? "celda vacía (_)" : `'${sym2}'`;
  const esc1Label = write1 === "" ? "celda vacía (_)" : `'${write1}'`;
  const esc2Label = write2 === "" ? "celda vacía (_)" : `'${write2}'`;

  let accion = `Cinta 1: leo ${sym1Label}, escribo ${esc1Label}, muevo a la ${dir1}. Cinta 2: leo ${sym2Label}, escribo ${esc2Label}, muevo a la ${dir2}`;

  if (nuevoEstado === "ACEPTAR") {
    return `${accion}. ¡La cadena ha sido completamente verificada y coincide perfectamente! Acepto la cadena.`;
  }
  if (nuevoEstado === "RECHAZAR") {
    return `${accion}. ¡Inconsistencia o desbalance de bloques detectado! Rechazo la cadena.`;
  }
  if (est === "q0") {
    return `${accion} para comenzar a contar el primer bloque de '${sym1}'.`;
  }
  if (est.startsWith("q_count_first_")) {
    if (nuevoEstado.startsWith("q_match_L_")) {
      const nextChar = nuevoEstado.split("_")[3];
      return `Terminó el primer bloque. Empieza el bloque de '${nextChar}'. ${accion} para iniciar la comparación.`;
    }
    return `Seguimos contando el primer bloque: ${accion}.`;
  }
  if (est.startsWith("q_match_L_") || est.startsWith("q_match_R_")) {
    const currentBlock = est.split("_")[3];
    if (
      nuevoEstado.startsWith("q_match_L_") ||
      nuevoEstado.startsWith("q_match_R_")
    ) {
      const nextBlock = nuevoEstado.split("_")[3];
      if (currentBlock !== nextBlock) {
        return `Bloque '${currentBlock}' completado correctamente. Cambiamos al bloque '${nextBlock}'. ${accion}.`;
      }
    }
    return `Comparando el bloque de '${currentBlock}' contra el contador de la Cinta 2: ${accion}.`;
  }

  return `${accion} y cambio al estado ${nuevoEstado}.`;
};

export default function TuringSimple() {
  const [entrada, setEntrada] = useState("aaabbbccc");
  const [modo, setModo] = useState("monocinta");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(700);

  const tmMonocinta = useTuringMachine([
    "a",
    "a",
    "a",
    "b",
    "b",
    "b",
    "c",
    "c",
    "c",
  ]);
  const tmMulticinta = useMultiTapeTuringMachine([
    "a",
    "a",
    "a",
    "b",
    "b",
    "b",
    "c",
    "c",
    "c",
  ]);

  const activeTM = modo === "monocinta" ? tmMonocinta : tmMulticinta;
  const { estado, darUnPaso, reiniciar, transiciones } = activeTM;

  const tableContainerRef = useRef(null);
  const activeRowRef = useRef(null);

  useEffect(() => {
    let timer = null;
    if (isPlaying && estado !== "ACEPTAR" && estado !== "RECHAZAR") {
      timer = setInterval(() => {
        darUnPaso();
      }, playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, estado, playbackSpeed, darUnPaso]);

  useEffect(() => {
    if (estado === "ACEPTAR" || estado === "RECHAZAR") {
      const t = setTimeout(() => {
        setIsPlaying(false);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [estado]);

  useEffect(() => {
    if (activeRowRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const row = activeRowRef.current;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const rowTop = row.offsetTop;
      const rowBottom = rowTop + row.clientHeight;

      if (rowTop < containerTop || rowBottom > containerBottom) {
        container.scrollTo({
          top: rowTop - container.clientHeight / 2 + row.clientHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [estado, activeTM]);

  function handleChange(event) {
    const valor = event.target.value;
    setEntrada(valor);
    tmMonocinta.cargarCinta(valor);
    tmMulticinta.cargarCinta(valor);
  }

  function aplicarPreset(cadena) {
    setEntrada(cadena);
    tmMonocinta.cargarCinta(cadena);
    tmMulticinta.cargarCinta(cadena);
    setIsPlaying(false);
  }

  const currentSymbol1 =
    modo === "monocinta"
      ? (activeTM.cinta[activeTM.cabezal] ?? "")
      : (activeTM.cintas[0][activeTM.cabezales[0]] ?? "");

  const currentSymbol2 =
    modo === "monocinta"
      ? ""
      : (activeTM.cintas[1][activeTM.cabezales[1]] ?? "");

  const claveTransicion =
    modo === "monocinta"
      ? `${estado},${currentSymbol1}`
      : `${estado},${currentSymbol1},${currentSymbol2}`;

  const reglaActiva = transiciones ? transiciones[claveTransicion] : null;

  return (
    <div
      style={{
        padding: "32px 16px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "var(--sans)",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          width: "100%",
          textAlign: "center",
          marginBottom: "24px",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            letterSpacing: "-1px",
            margin: "0 0 8px",
            color: "var(--text-h)",
          }}
        >
          Contador de Letras
        </h1>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "normal",
            color: "var(--text)",
            margin: "0 0 16px",
            opacity: 0.8,
          }}
        >
          Simulador de Máquina de Turing (Monocinta vs Multicinta)
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => {
              setModo("monocinta");
              setIsPlaying(false);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              background:
                modo === "monocinta" ? "var(--accent)" : "transparent",
              color: modo === "monocinta" ? "#fff" : "var(--text-h)",
              border: modo === "monocinta" ? "none" : "1px solid var(--border)",
              boxShadow:
                modo === "monocinta" ? "0 4px 10px var(--accent-bg)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            Monocinta (O(n²))
          </button>
          <button
            onClick={() => {
              setModo("multicinta");
              setIsPlaying(false);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              background:
                modo === "multicinta" ? "var(--accent)" : "transparent",
              color: modo === "multicinta" ? "#fff" : "var(--text-h)",
              border:
                modo === "multicinta" ? "none" : "1px solid var(--border)",
              boxShadow:
                modo === "multicinta" ? "0 4px 10px var(--accent-bg)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            Multicinta (O(n))
          </button>
        </div>

        <div
          style={{
            background: "var(--code-bg)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            lineHeight: "1.5",
            textAlign: "left",
            color: "var(--text-h)",
            marginBottom: "24px",
          }}
        >
          {modo === "monocinta" ? (
            <>
              <strong>¿Cómo funciona el enfoque Monocinta? (O(n²))</strong>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <li>Verifica que los símbolos estén agrupados.</li>
                <li>
                  Va de un lado a otro de la cinta, marcando exactamente un
                  símbolo de cada bloque en cada pasada para comparar sus
                  longitudes.
                </li>
                <li>
                  Requiere muchas iteraciones de ida y vuelta sobre la cinta
                  física, lo que hace el proceso lento.
                </li>
              </ul>
            </>
          ) : (
            <>
              <strong>¿Cómo funciona el enfoque Multicinta? (O(n))</strong>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <li>
                  <strong>Cinta 1</strong> contiene la entrada original.{" "}
                  <strong>Cinta 2</strong> actúa como contador/memoria de
                  trabajo.
                </li>
                <li>
                  En la primera pasada, cuenta la longitud del primer bloque
                  escribiendo un <code>1</code> en la Cinta 2 por cada letra
                  leída.
                </li>
                <li>
                  Para los bloques siguientes, simplemente lee la Cinta 2 (en
                  zig-zag hacia la izquierda y derecha) para verificar que
                  tengan la misma cantidad de elementos sin tener que volver
                  atrás en la entrada.
                </li>
              </ul>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          width: "100%",
          alignItems: "stretch",
          justifyContent: "center",
          boxSizing: "border-box",
          flexWrap: "nowrap",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            background: "var(--social-bg)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--shadow)",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "var(--text)",
                display: "block",
                marginBottom: "8px",
                opacity: 0.7,
              }}
            >
              Elige una cadena para probar:
            </span>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              <button
                onClick={() => aplicarPreset("aaabbbccc")}
                style={presetStyle(true)}
              >
                aaabbbccc (Correcto - 3 de cada una)
              </button>
              <button
                onClick={() => aplicarPreset("111222333")}
                style={presetStyle(true)}
              >
                111222333 (Correcto - números)
              </button>
              <button
                onClick={() => aplicarPreset("**##$$")}
                style={presetStyle(true)}
              >
                **##$$ (Correcto - símbolos)
              </button>
              <button
                onClick={() => aplicarPreset("bbaacc")}
                style={presetStyle(true)}
              >
                bbaacc (Correcto - otro orden)
              </button>
              <button
                onClick={() => aplicarPreset("112211")}
                style={presetStyle(false)}
              >
                112211 (Incorrecto - números separados)
              </button>
              <button
                onClick={() => aplicarPreset("aaabb")}
                style={presetStyle(false)}
              >
                aaabb (Incorrecto - cantidades desiguales)
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "var(--text-h)",
              }}
            >
              Escribe tu propia secuencia de letras:
            </label>
            <input
              value={entrada}
              onChange={handleChange}
              style={{
                background: "var(--code-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--text-h)",
                fontSize: "16px",
                fontFamily: "var(--mono)",
                fontWeight: "bold",
                width: "100%",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              placeholder="Ejemplo: aabbcc o ddd"
            />
            <small
              style={{ fontSize: "11px", color: "var(--text)", opacity: 0.7 }}
            >
              Usa cualquier símbolo (letras, números, caracteres especiales,
              etc.).
            </small>
          </div>

          {modo === "monocinta" ? (
            <TapeDisplay cinta={activeTM.cinta} cabezal={activeTM.cabezal} />
          ) : (
            <MultiTapeDisplay
              cintas={activeTM.cintas}
              cabezales={activeTM.cabezales}
            />
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                background: "var(--code-bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 16px",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text)",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                ¿Qué hace la máquina ahora?
              </span>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  color:
                    estado === "ACEPTAR"
                      ? "#10b981"
                      : estado === "RECHAZAR"
                        ? "#ef4444"
                        : "var(--accent)",
                  marginTop: "4px",
                }}
              >
                {traducirEstado(estado)}
              </div>
              {reglaActiva && (
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-h)",
                    marginTop: "6px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>Explicación:</strong>{" "}
                  {modo === "monocinta"
                    ? traducirRegla(estado, currentSymbol1, reglaActiva)
                    : traducirReglaMulticinta(
                        estado,
                        currentSymbol1,
                        currentSymbol2,
                        reglaActiva,
                      )}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              borderTop: "1px solid var(--border)",
              paddingTop: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={estado === "ACEPTAR" || estado === "RECHAZAR"}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor:
                    estado === "ACEPTAR" || estado === "RECHAZAR"
                      ? "not-allowed"
                      : "pointer",
                  background: isPlaying ? "#ef4444" : "var(--accent)",
                  color: "#fff",
                  border: "none",
                  opacity:
                    estado === "ACEPTAR" || estado === "RECHAZAR" ? 0.4 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {isPlaying ? "Pausar" : "Auto Reproducir"}
              </button>

              <button
                onClick={darUnPaso}
                disabled={
                  estado === "ACEPTAR" || estado === "RECHAZAR" || isPlaying
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor:
                    estado === "ACEPTAR" || estado === "RECHAZAR" || isPlaying
                      ? "not-allowed"
                      : "pointer",
                  background: "transparent",
                  color: "var(--text-h)",
                  border: "1px solid var(--border)",
                  opacity:
                    estado === "ACEPTAR" || estado === "RECHAZAR" || isPlaying
                      ? 0.4
                      : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Paso a paso
              </button>

              <button
                onClick={() => {
                  reiniciar();
                  setIsPlaying(false);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--text)",
                  border: "none",
                  textDecoration: "underline",
                  transition: "all 0.2s ease",
                }}
              >
                Reiniciar
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text)",
                  fontWeight: "bold",
                }}
              >
                Velocidad:
              </span>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={1600 - playbackSpeed}
                onChange={(e) =>
                  setPlaybackSpeed(1600 - Number(e.target.value))
                }
                disabled={estado === "ACEPTAR" || estado === "RECHAZAR"}
                style={{
                  width: "80px",
                  cursor: "pointer",
                  accentColor: "var(--accent)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: "0 0 420px",
            width: "420px",
            background: "var(--social-bg)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--shadow)",
            padding: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "sticky",
            top: "24px",
            maxHeight: "calc(100vh - 48px)",
            alignSelf: "flex-start",
          }}
        >
          <h3
            style={{
              margin: "0",
              fontSize: "16px",
              color: "var(--text-h)",
              fontWeight: "bold",
            }}
          >
            Función de Transición δ
          </h3>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text)",
              lineHeight: "1.3",
            }}
          >
            Representación formal en gramáticas de autómatas: <br />
            {modo === "monocinta" ? (
              <code>δ(Estado, Símbolo) = (Escribe, Mueve, Siguiente)</code>
            ) : (
              <code>
                δ(Estado, Símb1, Símb2) = (Escribe1, Mueve1, Escribe2, Mueve2,
                Siguiente)
              </code>
            )}
          </div>
          <div
            ref={tableContainerRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--bg)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
                fontFamily: "var(--mono)",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--code-bg)",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-h)",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <th style={thStyle}>Instrucción δ</th>
                  <th style={thStyle}>Acción resultante</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(transiciones || {}).map(([clave, regla]) => {
                  const parts = clave.split(",");
                  const esActiva = clave === claveTransicion;

                  if (modo === "monocinta") {
                    const [est, symb] = parts;
                    const [esc, mov, nextEst] = regla;
                    const symbLabel = symb === "" ? "_" : symb;
                    const escLabel = esc === "" ? "_" : esc;

                    return (
                      <tr
                        key={clave}
                        ref={esActiva ? activeRowRef : null}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: esActiva
                            ? "var(--accent-bg)"
                            : "transparent",
                          fontWeight: esActiva ? "bold" : "normal",
                          color: esActiva ? "var(--accent)" : "var(--text)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <td style={tdStyle}>
                          <code>
                            δ({est}, {symbLabel})
                          </code>
                        </td>
                        <td style={tdStyle}>
                          <code>
                            = ({escLabel}, {mov}, {nextEst})
                          </code>
                        </td>
                      </tr>
                    );
                  } else {
                    const [est, sym1, sym2] = parts;
                    const [esc1, mov1, esc2, mov2, nextEst] = regla;
                    const sym1Label = sym1 === "" ? "_" : sym1;
                    const sym2Label = sym2 === "" ? "_" : sym2;
                    const esc1Label = esc1 === "" ? "_" : esc1;
                    const esc2Label = esc2 === "" ? "_" : esc2;

                    return (
                      <tr
                        key={clave}
                        ref={esActiva ? activeRowRef : null}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: esActiva
                            ? "var(--accent-bg)"
                            : "transparent",
                          fontWeight: esActiva ? "bold" : "normal",
                          color: esActiva ? "var(--accent)" : "var(--text)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <td style={tdStyle}>
                          <code>
                            δ({est}, {sym1Label}, {sym2Label})
                          </code>
                        </td>
                        <td style={tdStyle}>
                          <code>
                            = ({esc1Label}, {mov1}, {esc2Label}, {mov2},{" "}
                            {nextEst})
                          </code>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          marginTop: "24px",
          fontSize: "13px",
          color: "var(--text)",
          textAlign: "center",
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          opacity: 0.8,
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        {modo === "monocinta" ? (
          <>
            <div>
              <strong>Símbolo′ / MAYÚSCULA</strong>: Procesados
            </div>
            <div>
              <strong>Símbolo original</strong>: Por procesar
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>Cinta 1</strong>: Entrada y control
            </div>
            <div>
              <strong>Cinta 2</strong>: Almacena conteo de bloques
            </div>
          </>
        )}
        <div>
          <strong>_</strong>: Celda Vacía
        </div>
      </div>
    </div>
  );
}

function presetStyle(isValid) {
  return {
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: "500",
    borderRadius: "6px",
    cursor: "pointer",
    background: "transparent",
    color: isValid ? "#10b981" : "#ef4444",
    border: isValid
      ? "1px solid rgba(16, 185, 129, 0.4)"
      : "1px solid rgba(239, 68, 68, 0.4)",
    transition: "all 0.2s ease",
  };
}

const thStyle = {
  padding: "8px 10px",
  textAlign: "left",
  fontWeight: "bold",
  fontSize: "11px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "6px 10px",
  textAlign: "left",
};
