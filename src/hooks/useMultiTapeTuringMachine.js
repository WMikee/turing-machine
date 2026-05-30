import { useState } from "react";
import { TRANSICIONES_MULTICINTA } from "../constants/turingConstants";

const defaultCinta = ["a", "a", "a", "b", "b", "b", "c", "c", "c"];

export function useMultiTapeTuringMachine(initialCinta = defaultCinta) {
  const [cintaInicial, setCintaInicial] = useState(initialCinta);
  const [cintas, setCintas] = useState([initialCinta, [""]]);
  const [cabezales, setCabezales] = useState([0, 0]);
  const [estado, setEstado] = useState("Contar_A");
  const [mensaje, setMensaje] = useState("");

  const transiciones = TRANSICIONES_MULTICINTA;

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

    let tape1 = [...cintas[0]];
    let tape2 = [...cintas[1]];
    let pos1 = cabezales[0];
    let pos2 = cabezales[1];

    ({ nuevaCinta: tape1, nuevaPosicion: pos1 } = extenderCinta(tape1, pos1));
    ({ nuevaCinta: tape2, nuevaPosicion: pos2 } = extenderCinta(tape2, pos2));

    const sym1 = tape1[pos1] ?? "";
    const sym2 = tape2[pos2] ?? "";
    const clave = `${estado},${sym1},${sym2}`;
    const regla = transiciones[clave];

    if (regla) {
      const [write1, move1, write2, move2, nuevoEstado] = regla;
      
      tape1[pos1] = write1;
      tape2[pos2] = write2;

      let nextPos1 = pos1 + (move1 === "R" ? 1 : move1 === "L" ? -1 : 0);
      let nextPos2 = pos2 + (move2 === "R" ? 1 : move2 === "L" ? -1 : 0);

      ({ nuevaCinta: tape1, nuevaPosicion: nextPos1 } = extenderCinta(tape1, nextPos1));
      ({ nuevaCinta: tape2, nuevaPosicion: nextPos2 } = extenderCinta(tape2, nextPos2));

      setCintas([tape1, tape2]);
      setCabezales([nextPos1, nextPos2]);
      setEstado(nuevoEstado);
      setMensaje(`Regla aplicada: δ(${estado}, ${sym1 === "" ? "_" : sym1}, ${sym2 === "" ? "_" : sym2}) → (${write1 === "" ? "_" : write1}, ${move1}, ${write2 === "" ? "_" : write2}, ${move2}, ${nuevoEstado})`);
    } else {
      setEstado("RECHAZAR");
      setMensaje(`Sin regla para la configuración δ(${estado}, ${sym1 === "" ? "_" : sym1}, ${sym2 === "" ? "_" : sym2}). Cadena rechazada.`);
    }
  };

  const cargarCinta = (entrada) => {
    const texto = entrada.trim();
    const nuevaCinta = texto === "" ? [""] : texto.split("");
    setCintaInicial(nuevaCinta);
    setCintas([nuevaCinta, [""]]);
    setCabezales([0, 0]);
    setEstado("Contar_A");
    setMensaje(`Nueva cinta cargada: ${texto}`);
  };

  const reiniciar = () => {
    setCintas([cintaInicial, [""]]);
    setCabezales([0, 0]);
    setEstado("Contar_A");
    setMensaje("");
  };

  return {
    cintas,
    cabezales,
    estado,
    mensaje,
    darUnPaso,
    reiniciar,
    cargarCinta,
    transiciones,
  };
}
