import { useState, useEffect, useRef } from "react";
import { useTuringMachine } from "./hooks/useTuringMachine";
import TapeDisplay from "./components/TapeDisplay";

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
  if (est === "q_check_all_marked") return "Verificando que todos los grupos estén completos...";
  if (est.startsWith("q_skip_block_")) {
    const char = est.replace("q_skip_block_", "");
    return `Saltando letras del grupo '${char}'`;
  }
  if (est.startsWith("q_mark_block_")) {
    const char = est.replace("q_mark_block_", "");
    return `Buscando la siguiente '${char}' sin contar en su grupo`;
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
    const nextChar = nuevoEstado.split("_")[2];
    return `Termina el grupo de '${symb}' y empieza el de '${nextChar}'. ${accion}.`;
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

export default function TuringSimple() {
  const [entrada, setEntrada] = useState("aaabbbccc");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(700);

  const { cinta, cabezal, estado, darUnPaso, reiniciar, cargarCinta, transiciones } =
    useTuringMachine(["a", "a", "a", "b", "b", "b", "c", "c", "c"]);

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
          behavior: "smooth"
        });
      }
    }
  }, [estado, cabezal, cinta]);

  function handleChange(event) {
    const valor = event.target.value;
    setEntrada(valor);
    cargarCinta(valor);
  }

  function aplicarPreset(cadena) {
    setEntrada(cadena);
    cargarCinta(cadena);
    setIsPlaying(false);
  }

  const currentSymbol = cinta[cabezal] ?? "";
  const claveTransicion = `${estado},${currentSymbol}`;
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
        color: "var(--text)"
      }}
    >
      <div style={{ maxWidth: "1000px", width: "100%", textAlign: "center", marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            letterSpacing: "-1px",
            margin: "0 0 8px",
            color: "var(--text-h)"
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
            opacity: 0.8
          }}
        >
          Simulador formal de la Máquina de Turing
        </h3>

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
            marginBottom: "24px"
          }}
        >
          <strong>¿Cómo funciona?</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <li>
              La máquina revisa que los símbolos estén agrupados (todos los '1' juntos, luego los '2', etc.).
            </li>
            <li>
              Para aceptarla, cada grupo debe tener <strong>exactamente la misma cantidad</strong> de símbolos (ej: <code>aabb</code>, <code>111222333</code> o <code>**##$$</code>).
            </li>
            <li>
              Verás cómo la máquina va marcando los símbolos (mayúsculas o agregando una comilla <code>′</code>) para llevar la cuenta uno por uno.
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          width: "100%",
          maxWidth: "1080px",
          alignItems: "stretch",
          justifyContent: "center",
          boxSizing: "border-box",
          flexWrap: "wrap"
        }}
      >
        <div
          style={{
            flex: "1 1 600px",
            background: "var(--social-bg)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--shadow)",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <div>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text)", display: "block", marginBottom: "8px", opacity: 0.7 }}>
              Elige una cadena para probar:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-start" }}>
              <button onClick={() => aplicarPreset("aaabbbccc")} style={presetStyle(true)}>aaabbbccc (Correcto - 3 de cada una)</button>
              <button onClick={() => aplicarPreset("111222333")} style={presetStyle(true)}>111222333 (Correcto - números)</button>
              <button onClick={() => aplicarPreset("**##$$")} style={presetStyle(true)}>**##$$ (Correcto - símbolos)</button>
              <button onClick={() => aplicarPreset("bbaacc")} style={presetStyle(true)}>bbaacc (Correcto - otro orden)</button>
              <button onClick={() => aplicarPreset("112211")} style={presetStyle(false)}>112211 (Incorrecto - números separados)</button>
              <button onClick={() => aplicarPreset("aaabb")} style={presetStyle(false)}>aaabb (Incorrecto - cantidades desiguales)</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-h)" }}>
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
                transition: "border-color 0.2s ease"
              }}
              placeholder="Ejemplo: aabbcc o ddd"
            />
            <small style={{ fontSize: "11px", color: "var(--text)", opacity: 0.7 }}>
              Usa cualquier símbolo (letras, números, caracteres especiales, etc.).
            </small>
          </div>

          <TapeDisplay cinta={cinta} cabezal={cabezal} />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                background: "var(--code-bg)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 16px",
                textAlign: "left"
              }}
            >
              <span style={{ fontSize: "10px", color: "var(--text)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ¿Qué hace la máquina ahora?
              </span>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  color: estado === "ACEPTAR" ? "#10b981" : estado === "RECHAZAR" ? "#ef4444" : "var(--accent)",
                  marginTop: "4px"
                }}
              >
                {traducirEstado(estado)}
              </div>
              {reglaActiva && (
                <div style={{ fontSize: "13px", color: "var(--text-h)", marginTop: "6px", lineHeight: "1.4" }}>
                  <strong>Explicación:</strong> {traducirRegla(estado, currentSymbol, reglaActiva)}
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
              paddingTop: "16px"
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
                  cursor: estado === "ACEPTAR" || estado === "RECHAZAR" ? "not-allowed" : "pointer",
                  background: isPlaying ? "#ef4444" : "var(--accent)",
                  color: "#fff",
                  border: "none",
                  opacity: estado === "ACEPTAR" || estado === "RECHAZAR" ? 0.4 : 1,
                  transition: "all 0.2s ease"
                }}
              >
                {isPlaying ? "Pausar" : "Auto Reproducir"}
              </button>

              <button
                onClick={darUnPaso}
                disabled={estado === "ACEPTAR" || estado === "RECHAZAR" || isPlaying}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: (estado === "ACEPTAR" || estado === "RECHAZAR" || isPlaying) ? "not-allowed" : "pointer",
                  background: "transparent",
                  color: "var(--text-h)",
                  border: "1px solid var(--border)",
                  opacity: (estado === "ACEPTAR" || estado === "RECHAZAR" || isPlaying) ? 0.4 : 1,
                  transition: "all 0.2s ease"
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
                  transition: "all 0.2s ease"
                }}
              >
                Reiniciar
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text)", fontWeight: "bold" }}>Velocidad:</span>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={1600 - playbackSpeed}
                onChange={(e) => setPlaybackSpeed(1600 - Number(e.target.value))}
                disabled={estado === "ACEPTAR" || estado === "RECHAZAR"}
                style={{
                  width: "80px",
                  cursor: "pointer",
                  accentColor: "var(--accent)"
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 380px",
            background: "var(--social-bg)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--shadow)",
            padding: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxHeight: "680px"
          }}
        >
          <h3 style={{ margin: "0", fontSize: "16px", color: "var(--text-h)", fontWeight: "bold" }}>
            Función de Transición δ
          </h3>
          <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: "1.3" }}>
            Representación formal en gramáticas de autómatas: <br />
            <code>δ(Estado, Símbolo) = (Escribe, Mueve, Siguiente)</code>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text)", opacity: 0.8 }}>
            La regla activa se resalta y centra automáticamente.
          </div>

          <div
            ref={tableContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--bg)"
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--mono)" }}>
              <thead>
                <tr style={{ background: "var(--code-bg)", borderBottom: "1px solid var(--border)", color: "var(--text-h)", position: "sticky", top: 0, zIndex: 1 }}>
                  <th style={thStyle}>Instrucción δ</th>
                  <th style={thStyle}>Acción resultante</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(transiciones || {}).map(([clave, regla]) => {
                  const [est, symb] = clave.split(",");
                  const [esc, mov, nextEst] = regla;
                  const esActiva = clave === claveTransicion;
                  
                  const symbLabel = symb === "" ? "_" : symb;
                  const escLabel = esc === "" ? "_" : esc;
                  
                  return (
                    <tr
                      key={clave}
                      ref={esActiva ? activeRowRef : null}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: esActiva ? "var(--accent-bg)" : "transparent",
                        fontWeight: esActiva ? "bold" : "normal",
                        color: esActiva ? "var(--accent)" : "var(--text)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <td style={tdStyle}>
                        <code>δ({est}, {symbLabel})</code>
                      </td>
                      <td style={tdStyle}>
                        <code>= ({escLabel}, {mov}, {nextEst})</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1080px", width: "100%", marginTop: "24px", fontSize: "13px", color: "var(--text)", textAlign: "center", display: "flex", gap: "24px", justifyContent: "center", opacity: 0.8 }}>
        <div>
          <strong>Símbolo′ / MAYÚSCULA</strong>: Procesados
        </div>
        <div>
          <strong>Símbolo original</strong>: Por procesar
        </div>
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
    border: isValid ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
    transition: "all 0.2s ease"
  };
}

const thStyle = {
  padding: "8px 10px",
  textAlign: "left",
  fontWeight: "bold",
  fontSize: "11px",
  letterSpacing: "0.5px",
  textTransform: "uppercase"
};

const tdStyle = {
  padding: "6px 10px",
  textAlign: "left"
};
