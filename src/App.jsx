import { useState, useEffect, useRef } from "react";
import { useTuringMachine } from "./hooks/useTuringMachine";
import { useMultiTapeTuringMachine } from "./hooks/useMultiTapeTuringMachine";
import TapeDisplay from "./components/TapeDisplay";
import MultiTapeDisplay from "./components/MultiTapeDisplay";
import AutomatonGraph from "./components/AutomatonGraph";
import {
  traducirEstado,
  traducirRegla,
  traducirReglaMulticinta,
  traducirTransicionCorta,
  traducirEstadoCorto,
} from "./translators";
import { TURING_MACHINES_MONOCINTA } from "./constants/turingConstants";





export default function TuringSimple() {
  const [machineId, setMachineId] = useState("abc");
  const monoMachine = TURING_MACHINES_MONOCINTA[machineId];

  const [entrada, setEntrada] = useState(monoMachine.exampleInput);
  const [modo, setModo] = useState("monocinta");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(700);

  const tmMonocinta = useTuringMachine(
    monoMachine.exampleInput.split(""),
    monoMachine
  );
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
    // Cuando cambiamos de maquina, reseteamos entrada y estado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPlaying(false);
    const nextInput = monoMachine.exampleInput;
    setEntrada(nextInput);
    tmMonocinta.cargarCinta(nextInput);
  }, [machineId]);

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
          {modo === "monocinta"
            ? `Maquina de Turing: ${monoMachine.displayName}`
            : "Maquina de Turing (Multicinta)"}
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
          Simulador de Máquina de Turing con Visualización de Autómata Activo
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
              setMachineId("abc");
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
              <strong>{monoMachine.displayName}</strong>
              <div style={{ marginTop: "8px", color: "var(--text)" }}>
                {monoMachine.inputHint}
              </div>
              <div style={{ marginTop: "6px", color: "var(--text)", opacity: 0.9 }}>
                El autómata resalta el estado activo y la transicion δ que se aplica.
              </div>
            </>
          ) : (
            <>
              <strong>Máquina de Turing Multicinta para aⁿbⁿcⁿ</strong>
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
                  <strong>Cinta 1</strong> almacena la entrada.{" "}
                  <strong>Cinta 2</strong> actúa como contador auxiliar en
                  tiempo lineal.
                </li>
                <li>
                  En <code>Contar_A</code>, cuenta todas las <code>a</code>'s
                  consecutivas de Cinta 1, escribiendo un <code>1</code> en
                  Cinta 2 por cada una.
                </li>
                <li>
                  En <code>Comparar_B</code>, valida que el bloque de{" "}
                  <code>b</code>'s mida lo mismo que Cinta 2 (moviéndose a la
                  izquierda en Cinta 2).
                </li>
                <li>
                  En <code>Comparar_C</code>, valida el bloque de <code>c</code>
                  's (moviéndose a la derecha en Cinta 2). Si la entrada y el
                  contador terminan simultáneamente, pasa a <code>ACEPTAR</code>
                  .
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
          maxWidth: "1400px",
          alignItems: "stretch",
          justifyContent: "center",
          boxSizing: "border-box",
          flexWrap: "wrap",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            flex: "1 1 600px",
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
            {modo === "monocinta" && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--text)",
                    opacity: 0.7,
                  }}
                >
                  Máquina:
                </span>
                <select
                  value={machineId}
                  onChange={(e) => {
                    setMachineId(e.target.value);
                    setIsPlaying(false);
                  }}
                  style={{
                    background: "var(--code-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    color: "var(--text-h)",
                    fontSize: "14px",
                    fontFamily: "var(--mono)",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                >
                  {[
                    "abc",
                    "palindromo",
                    "parentesis",
                    "duplicar",
                    "anbn",
                  ].map((id) => (
                    <option key={id} value={id}>
                      {TURING_MACHINES_MONOCINTA[id].displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              {monoMachine.presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => aplicarPreset(p.value)}
                  style={presetStyle(p.valid)}
                >
                  {p.label}
                </button>
              ))}
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
              {modo === "monocinta"
                ? `Escribe tu entrada para ${monoMachine.displayName}:`
                : "Escribe tu entrada para la multicinta:"}
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
              placeholder={
                modo === "monocinta"
                  ? monoMachine.inputPlaceholder
                  : "Ejemplo: aaabbbccc"
              }
            />
            <small
              style={{ fontSize: "11px", color: "var(--text)", opacity: 0.7 }}
            >
              {modo === "monocinta"
                ? monoMachine.inputHint
                : "La máquina valida el lenguaje a^n b^n c^n usando dos cintas."}
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
            maxHeight: "650px",
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
              border: "1px solid #2e303a",
              borderRadius: "8px",
              background: "#12131a",
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
                    background: "#1a1b23",
                    borderBottom: "1px solid #2e303a",
                    color: "#f3f4f6",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <th style={{ ...thStyle, textAlign: "left" }}>Definición y Explicación en Español</th>
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
                    const movEsp = mov === "R" ? "D" : mov === "L" ? "I" : "S";

                    return (
                      <tr
                        key={clave}
                        ref={esActiva ? activeRowRef : null}
                        style={{
                          borderBottom: "1px solid #2e303a",
                          background: esActiva
                            ? "rgba(170, 59, 255, 0.15)"
                            : "transparent",
                          fontWeight: esActiva ? "bold" : "normal",
                          color: esActiva ? "var(--accent)" : "#9ca3af",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <td style={{ ...tdStyle, padding: "8px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                              <code
                                style={{
                                  background: "transparent",
                                  padding: 0,
                                  color: esActiva ? "var(--accent)" : "#e5e7eb",
                                }}
                              >
                                δ({traducirEstadoCorto(est)}, {symbLabel})
                              </code>
                              <code
                                style={{
                                  background: "transparent",
                                  padding: 0,
                                  color: esActiva ? "var(--accent)" : "#e5e7eb",
                                }}
                              >
                                = ({escLabel}, {movEsp}, {traducirEstadoCorto(nextEst)})
                              </code>
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: esActiva ? "var(--accent)" : "var(--text)",
                                opacity: esActiva ? 1 : 0.7,
                                fontWeight: "normal",
                                fontFamily: "var(--sans)",
                                lineHeight: "1.3"
                              }}
                            >
                              {traducirTransicionCorta(est, symb, regla, modo)}
                            </div>
                          </div>
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
                    const mov1Esp = mov1 === "R" ? "D" : mov1 === "L" ? "I" : "S";
                    const mov2Esp = mov2 === "R" ? "D" : mov2 === "L" ? "I" : "S";

                    return (
                      <tr
                        key={clave}
                        ref={esActiva ? activeRowRef : null}
                        style={{
                          borderBottom: "1px solid #2e303a",
                          background: esActiva
                            ? "rgba(170, 59, 255, 0.15)"
                            : "transparent",
                          fontWeight: esActiva ? "bold" : "normal",
                          color: esActiva ? "var(--accent)" : "#9ca3af",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <td style={{ ...tdStyle, padding: "8px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                              <code
                                style={{
                                  background: "transparent",
                                  padding: 0,
                                  color: esActiva ? "var(--accent)" : "#e5e7eb",
                                }}
                              >
                                δ({traducirEstadoCorto(est)}, {sym1Label}, {sym2Label})
                              </code>
                              <code
                                style={{
                                  background: "transparent",
                                  padding: 0,
                                  color: esActiva ? "var(--accent)" : "#e5e7eb",
                                }}
                              >
                                = ({esc1Label}, {mov1Esp}, {esc2Label}, {mov2Esp}, {traducirEstadoCorto(nextEst)})
                              </code>
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: esActiva ? "var(--accent)" : "var(--text)",
                                opacity: esActiva ? 1 : 0.7,
                                fontWeight: "normal",
                                fontFamily: "var(--sans)",
                                lineHeight: "1.3"
                              }}
                            >
                              {traducirTransicionCorta(est, `${sym1},${sym2}`, regla, modo)}
                            </div>
                          </div>
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

      <AutomatonGraph
        modo={modo}
        estado={estado}
        claveTransicion={claveTransicion}
        monoTransitions={modo === "monocinta" ? transiciones : undefined}
      />

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
              <strong>X, Y, Z</strong>: Marcas de conteo (A, B, C procesadas)
            </div>
            <div>
              <strong>a, b, c</strong>: Letras por procesar
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>Cinta 1</strong>: Entrada y control
            </div>
            <div>
              <strong>Cinta 2</strong>: Memoria auxiliar (Conteo de bloques con
              1's)
            </div>
          </>
        )}
        <div>
          <strong>_ / vacío</strong>: Celda Vacía (Blank)
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
