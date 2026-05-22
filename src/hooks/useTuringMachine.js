import { useState, useMemo } from "react";
import { generarTransiciones } from "../constants/turingConstants";

const defaultCinta = ["a", "a", "b", "b"];

export function useTuringMachine(initialCinta = defaultCinta) {
  const [cintaInicial, setCintaInicial] = useState(initialCinta);
  const [cinta, setCinta] = useState(initialCinta);
  const [cabezal, setCabezal] = useState(0);
  const [estado, setEstado] = useState("q0");
  const [mensaje, setMensaje] = useState("");

  const transicionesInfo = useMemo(() => {
    const alphabet = [...new Set(cintaInicial)].filter(sym => sym !== "");
    return generarTransiciones(alphabet);
  }, [cintaInicial]);

  const transiciones = transicionesInfo.transitions;
  const marked = transicionesInfo.marked;

  const extenderCinta = (cintaActual, posicion) => {
    let nuevaCinta = [...cintaActual];
    let nuevaPosicion = posicion;

    if (nuevaPosicion < 0) {
      const relleno = Array(-nuevaPosicion).fill("");
      nuevaCinta = [...relleno, ...nuevaCinta];
      nuevaPosicion = 0;
    }

    if (nuevaPosicion >= nuevaCinta.length) {
      const relleno = Array(nuevaPosicion - nuevaCinta.length + 1).fill("");
      nuevaCinta = [...nuevaCinta, ...relleno];
    }

    return { nuevaCinta, nuevaPosicion };
  };

  const darUnPaso = () => {
    if (estado === "ACEPTAR" || estado === "RECHAZAR") return;

    let cintaActual = [...cinta];
    let posicion = cabezal;
    ({ nuevaCinta: cintaActual, nuevaPosicion: posicion } = extenderCinta(
      cintaActual,
      posicion,
    ));

    const simboloActual = cintaActual[posicion] ?? "";
    const clave = `${estado},${simboloActual}`;
    const regla = transiciones[clave];

    if (regla) {
      const [escribir, mover, nuevoEstado] = regla;
      cintaActual[posicion] = escribir;
      let nuevaPosicion = posicion + (mover === "R" ? 1 : -1);
      ({ nuevaCinta: cintaActual, nuevaPosicion } = extenderCinta(
        cintaActual,
        nuevaPosicion,
      ));

      setCinta(cintaActual);
      setCabezal(nuevaPosicion);
      setEstado(nuevoEstado);
      setMensaje(`Regla aplicada: ${clave} → ${regla.join(", ")}`);
    } else {
      setEstado("RECHAZAR");
      setMensaje(`Sin regla para ${clave}. Cadena rechazada.`);
    }
  };

  const cargarCinta = (entrada) => {
    const texto = entrada.trim();
    const nuevaCinta = texto === "" ? [""] : texto.split("");
    setCintaInicial(nuevaCinta);
    setCinta(nuevaCinta);
    setCabezal(0);
    const ok = detectarBloquesIguales(texto);
    setEstado("q0");
    setMensaje(
      ok
        ? `Validación: ACEPTADA — ${texto}`
        : `Validación: RECHAZADA — ${texto}`,
    );
  };

  const detectarBloquesIguales = (texto) => {
    if (typeof texto !== "string") return false;
    const s = texto.trim();
    if (s.length === 0) return false;

    const blocks = [];
    let currentSymbol = s[0];
    let currentLength = 1;

    for (let i = 1; i < s.length; i++) {
      if (s[i] === currentSymbol) {
        currentLength++;
      } else {
        blocks.push({ symbol: currentSymbol, length: currentLength });
        currentSymbol = s[i];
        currentLength = 1;
      }
    }
    blocks.push({ symbol: currentSymbol, length: currentLength });



    const seenSymbols = new Set();
    for (const block of blocks) {
      if (seenSymbols.has(block.symbol)) {
        return false;
      }
      seenSymbols.add(block.symbol);
    }

    const expectedLength = blocks[0].length;
    for (const block of blocks) {
      if (block.length !== expectedLength) {
        return false;
      }
    }

    return true;
  };

  const validarEntrada = (entrada) => {
    const texto = entrada.trim();
    const ok = detectarBloquesIguales(texto);
    setCinta(texto === "" ? [""] : texto.split(""));
    setCabezal(0);
    setEstado(ok ? "ACEPTAR" : "RECHAZAR");
    setMensaje(
      ok
        ? "Cadena aceptada (bloques de igual longitud)"
        : "Cadena rechazada (no cumple con bloques continuos de igual longitud)",
    );
    return ok;
  };

  const reiniciar = () => {
    setCinta(cintaInicial);
    setCabezal(0);
    setEstado("q0");
    setMensaje("");
  };

  return {
    cinta,
    cabezal,
    estado,
    mensaje,
    darUnPaso,
    reiniciar,
    cargarCinta,
    detectarBloquesIguales,
    validarEntrada,
    transiciones,
    marked,
  };
}
