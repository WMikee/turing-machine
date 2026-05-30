import { useMemo, useState } from "react";
import { TURING_MACHINES_MONOCINTA } from "../constants/turingConstants";

const defaultMachine = TURING_MACHINES_MONOCINTA.abc;

const defaultCintaFromMachine = (machine) =>
  (machine?.exampleInput ? machine.exampleInput.split("") : [""]);

export function useTuringMachine(initialCinta, machine = defaultMachine) {
  const safeInitialCinta =
    initialCinta ?? defaultCintaFromMachine(machine) ?? defaultCintaFromMachine(defaultMachine);

  const [cintaInicial, setCintaInicial] = useState(safeInitialCinta);
  const [cinta, setCinta] = useState(safeInitialCinta);
  const [cabezal, setCabezal] = useState(0);
  const [estado, setEstado] = useState(machine.startState ?? defaultMachine.startState);
  const [mensaje, setMensaje] = useState("");

  const transiciones = useMemo(
    () => machine?.transitions ?? defaultMachine.transitions,
    [machine]
  );

  const marked = machine?.marked ?? defaultMachine.marked;

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
    setEstado(machine?.startState ?? defaultMachine.startState);

    if (typeof machine?.validateInput === "function") {
      const ok = machine.validateInput(texto);
      setMensaje(
        ok
          ? `Validación: ACEPTADA — ${texto}`
          : `Validación: RECHAZADA — ${texto}`
      );
    } else {
      setMensaje("");
    }
  };

  const validarEntrada = (entrada) => {
    const texto = entrada.trim();
    const ok =
      typeof machine?.validateInput === "function"
        ? machine.validateInput(texto)
        : false;
    setCinta(texto === "" ? [""] : texto.split(""));
    setCabezal(0);
    setEstado(ok ? "ACEPTAR" : "RECHAZAR");
    setMensaje(
      ok ? "Cadena aceptada" : "Cadena rechazada",
    );
    return ok;
  };

  const reiniciar = () => {
    setCinta(cintaInicial);
    setCabezal(0);
    setEstado(machine?.startState ?? defaultMachine.startState);
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
    validarEntrada,
    transiciones,
    marked,
  };
}
