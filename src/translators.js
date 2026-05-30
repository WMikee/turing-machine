export const traducirEstado = (est) => {
  // --- Máquina abc (Monocinta y Multicinta) ---
  if (est === "Buscar_A")
    return "Buscar 'a': Buscando la primera 'a' sin contar...";
  if (est === "Buscar_B")
    return "Buscar 'b': Saltando letras para buscar la primera 'b' sin contar...";
  if (est === "Buscar_C")
    return "Buscar 'c': Saltando letras para buscar la primera 'c' sin contar...";
  if (est === "Regresar")
    return "Regresando: Regresando el cabezal hacia el inicio de la cinta...";
  if (est === "Verificar_Fin")
    return "Verificar Fin: Asegurando que todas las letras estén procesadas...";
  if (est === "Contar_A")
    return "Contar 'a': Contando las 'a' y escribiendo en Cinta 2...";
  if (est === "Comparar_B")
    return "Comparar 'b': Comparamos las 'b' restando del contador en Cinta 2...";
  if (est === "Comparar_C")
    return "Comparar 'c': Comparamos las 'c' restando del contador en Cinta 2...";

  // --- Máquina Palíndromo ---
  if (est === "PAL0")
    return "Inicio / Comparar: Buscando primer símbolo sin procesar...";
  if (est === "PAL_SEEK_A")
    return "Buscando fin (a): Moviéndose al extremo derecho para buscar pareja de 'a'...";
  if (est === "PAL_FIND_A")
    return "Verificando pareja (a): Buscando 'a' sin marcar en el extremo derecho...";
  if (est === "PAL_RETURN")
    return "Retornando: Volviendo al extremo izquierdo de la cinta...";
  if (est === "PAL_SEEK_B")
    return "Buscando fin (b): Moviéndose al extremo derecho para buscar pareja de 'b'...";
  if (est === "PAL_FIND_B")
    return "Verificando pareja (b): Buscando 'b' sin marcar en el extremo derecho...";

  // --- Máquina Balanceador de Paréntesis ---
  if (est === "BP_SCAN")
    return "Escanear: Buscando primer '(' sin emparejar...";
  if (est === "BP_LOOK")
    return "Buscar pareja: Buscando ')' para emparejar con el '('...";
  if (est === "BP_FAIL_BACK_TO_L")
    return "Recuperar error: Volviendo al '(' actual tras fallo...";
  if (est === "BP_FAIL_FORWARD")
    return "Avanzar tras error: Reanudando búsqueda de '('...";
  if (est === "BP_FIND_LEFT_L")
    return "Buscar marca: Retrocediendo a buscar la marca de '(' ('L')...";
  if (est === "BP_RESTART_LEFT")
    return "Reiniciar ciclo: Volviendo al extremo izquierdo...";
  if (est === "BP_CHECK_START")
    return "Inicio de verificación: Preparando verificación de fin de cinta...";
  if (est === "BP_CHECK_SCAN")
    return "Verificando cinta: Asegurando que todos los paréntesis fueron emparejados...";

  // --- Máquina Duplicar ---
  if (est === "DUP_FIND")
    return "Buscar letra: Buscando la siguiente letra ('a' o 'b') para copiar...";
  if (est === "DUP_COPY_A")
    return "Copiar 'a': Moviéndose al extremo derecho para escribir 'a'...";
  if (est === "DUP_COPY_B")
    return "Copiar 'b': Moviéndose al extremo derecho para escribir 'b'...";
  if (est === "DUP_RETURN_START")
    return "Retornar: Regresando a la posición de la letra procesada...";
  if (est === "DUP_CLEAN")
    return "Limpieza: Restaurando marcas de mayúsculas ('A', 'B') a minúsculas ('a', 'b')...";

  // --- Máquina a^n b^n ---
  if (est === "AB_START")
    return "Inicio / Conteo: Buscando primera 'a' no emparejada...";
  if (est === "AB_FIND_B")
    return "Buscar 'b': Buscando su pareja 'b' no emparejada a la derecha...";
  if (est === "AB_RETURN")
    return "Retornar: Volviendo al extremo izquierdo para la siguiente ronda...";
  if (est === "AB_CHECK_START")
    return "Inicio de verificación: Volviendo al inicio para escanear...";
  if (est === "AB_CHECK_SCAN")
    return "Verificar balance: Comprobando que no queden 'a's o 'b's sueltas...";

  // --- Estados Finales ---
  if (est === "ACEPTAR") return "¡Cadena VÁLIDA y Aceptada!";
  if (est === "RECHAZAR") return "Cadena RECHAZADA";
  return est;
};

export const traducirRegla = (est, symb, regl) => {
  if (!regl) return "";
  const [escribir, mover, nuevoEstado] = regl;
  const dir = mover === "R" ? "derecha" : "izquierda";

  const symLabel = symb === "" ? "celda vacía (_ )" : `'${symb}'`;
  const escLabel = escribir === "" ? "celda vacía (_ )" : `'${escribir}'`;

  let accion = `Leo ${symLabel}, escribo ${escLabel}, muevo el cabezal a la ${dir}`;

  // --- Máquina abc ---
  if (est === "Buscar_A") {
    if (symb === "a") {
      return `${accion} para comenzar a marcar esta 'a' como procesada ('X').`;
    }
    if (symb === "Y") {
      return `¡Ya no quedan 'a's! ${accion} para comenzar a verificar el fin de la cinta.`;
    }
  }
  if (est === "Buscar_B") {
    if (symb === "a" || symb === "Y") {
      return `${accion} para saltar símbolos del grupo procesado y buscar una 'b'.`;
    }
    if (symb === "b") {
      return `¡Encontré una 'b'! ${accion} para marcarla como procesada ('Y') y buscar una 'c'.`;
    }
  }
  if (est === "Buscar_C") {
    if (symb === "b" || symb === "Z") {
      return `${accion} para saltar símbolos del grupo procesado y buscar una 'c'.`;
    }
    if (symb === "c") {
      return `¡Encontré una 'c'! ${accion} para marcarla como procesada ('Z') y regresar al inicio.`;
    }
  }
  if (est === "Regresar") {
    if (symb === "X") {
      return `Llegué al inicio de la ronda de conteo. ${accion} para reiniciar en Buscar_A.`;
    }
    return `Retrocediendo: ${accion} para buscar el delimitador de ronda 'X'.`;
  }
  if (est === "Verificar_Fin") {
    if (symb === "") {
      return `Cinta finalizada y verificada correctamente. ¡La cadena es balanceada! Acepto.`;
    }
    return `Verificando final: ${accion} (todas las letras deben estar procesadas).`;
  }

  // --- Máquina Palíndromo ---
  if (est === "PAL0") {
    if (symb === "a") return `${accion} y cambio a buscar pareja de 'a' al final.`;
    if (symb === "b") return `${accion} y cambio a buscar pareja de 'b' al final.`;
    if (symb === "X" || symb === "Y") return `${accion} para saltar marcas ya verificadas.`;
    if (symb === "") return `Cinta totalmente verificada. ${accion} y paso a ACEPTAR.`;
  }
  if (est === "PAL_SEEK_A") {
    if (symb === "") return `Alcancé el final de la cadena. ${accion} para verificar el extremo derecho.`;
    return `${accion} buscando el extremo derecho.`;
  }
  if (est === "PAL_FIND_A") {
    if (symb === "a") return `¡Pareja 'a' encontrada! ${accion} y emprendo el retorno al inicio.`;
    if (symb === "b" || symb === "") return `Error de pareja para 'a': ${accion} y cambio a RECHAZAR.`;
    return `${accion} buscando la pareja 'a'.`;
  }
  if (est === "PAL_SEEK_B") {
    if (symb === "") return `Alcancé el final de la cadena. ${accion} para verificar el extremo derecho.`;
    return `${accion} buscando el extremo derecho.`;
  }
  if (est === "PAL_FIND_B") {
    if (symb === "b") return `¡Pareja 'b' encontrada! ${accion} y emprendo el retorno al inicio.`;
    if (symb === "a" || symb === "") return `Error de pareja para 'b': ${accion} y cambio a RECHAZAR.`;
    return `${accion} buscando la pareja 'b'.`;
  }
  if (est === "PAL_RETURN") {
    if (symb === "") return `Llegué de vuelta al inicio de la cinta. ${accion} para evaluar el siguiente carácter.`;
    return `${accion} regresando al inicio.`;
  }

  // --- Máquina Balanceador de Paréntesis ---
  if (est === "BP_SCAN") {
    if (symb === "(") return `${accion} para registrar '(' como pendiente y buscar su pareja ')'.`;
    if (symb === "X") return `${accion} saltando elementos emparejados.`;
    if (symb === ")") return `${accion} buscando resolver el cierre.`;
    if (symb === "") return `Fin de escaneo inicial. ${accion} para verificar resultados.`;
  }
  if (est === "BP_LOOK") {
    if (symb === ")") return `¡Pareja ')' encontrada! ${accion} para volver a marcar el '(' correspondiente.`;
    if (symb === "X") return `${accion} omitiendo marcas.`;
    if (symb === "(" || symb === "L") return `Encontré otro '(' antes de cerrar. ${accion} para gestionar retroceso de error.`;
    if (symb === "") return `Cierre faltante para un '('. ${accion} y verifico balance.`;
  }
  if (est === "BP_FAIL_BACK_TO_L") {
    if (symb === "L") return `Llegué al '(' temporal. ${accion} para restaurarlo a '(' y reintentar.`;
    return `${accion} retrocediendo al '(' original.`;
  }
  if (est === "BP_FAIL_FORWARD") {
    if (symb === "(") return `${accion} y lo marco como 'L' para buscar pareja.`;
    if (symb === ")") return `Paréntesis de cierre huérfano detectado: ${accion} y cambio a RECHAZAR.`;
    return `${accion} avanzando tras error.`;
  }
  if (est === "BP_FIND_LEFT_L") {
    if (symb === "L") return `Encontré el '(' correspondiente. ${accion} (marcándolo como 'X') para consolidar el par.`;
    return `${accion} buscando el '(' temporal a la izquierda.`;
  }
  if (est === "BP_RESTART_LEFT") {
    if (symb === "") return `Retornado al inicio. ${accion} para iniciar nuevo ciclo de escaneo.`;
    return `${accion} volviendo al inicio.`;
  }
  if (est === "BP_CHECK_START") {
    if (symb === "") return `Inicio del escaneo final: ${accion} para validar que no queden símbolos sueltos.`;
    return `${accion} retrocediendo al inicio para control de aceptación.`;
  }
  if (est === "BP_CHECK_SCAN") {
    if (symb === "") return `¡Perfecto! Todo emparejado. ${accion} y paso a ACEPTAR.`;
    if (symb === "(" || symb === ")" || symb === "L") return `Desbalance detectado: ${accion} y cambio a RECHAZAR.`;
    return `${accion} controlando la cinta.`;
  }

  // --- Máquina Duplicar ---
  if (est === "DUP_FIND") {
    if (symb === "a") return `${accion} (marcado como 'A') para duplicar 'a' al final.`;
    if (symb === "b") return `${accion} (marcado como 'B') para duplicar 'b' al final.`;
    if (symb === "A" || symb === "B") return `${accion} saltando letras ya procesadas.`;
    if (symb === "") return `Copiado terminado. ${accion} para iniciar la limpieza de marcas.`;
  }
  if (est === "DUP_COPY_A") {
    if (symb === "") return `Espacio vacío encontrado. Escribo la copia: ${accion} y retorno.`;
    return `${accion} avanzando al final para copiar 'a'.`;
  }
  if (est === "DUP_COPY_B") {
    if (symb === "") return `Espacio vacío encontrado. Escribo la copia: ${accion} y retorno.`;
    return `${accion} avanzando al final para copiar 'b'.`;
  }
  if (est === "DUP_RETURN_START") {
    if (symb === "") return `Retornado a la zona de origen. ${accion} para buscar el siguiente carácter.`;
    return `${accion} regresando al inicio.`;
  }
  if (est === "DUP_CLEAN") {
    if (symb === "") return `Limpieza completa. ${accion} y paso a ACEPTAR.`;
    return `${accion} restaurando símbolo original.`;
  }

  // --- Máquina a^n b^n ---
  if (est === "AB_START") {
    if (symb === "a") return `${accion} (marcado como 'X') e inicia la búsqueda de pareja 'b'.`;
    if (symb === "X" || symb === "Y") return `${accion} saltando marcas de conteo.`;
    if (symb === "b") return `Encontré 'b' sin una 'a' previa: ${accion} y cambio a RECHAZAR.`;
    if (symb === "") return `Escaneo inicial completo. ${accion} para verificar coincidencia.`;
  }
  if (est === "AB_FIND_B") {
    if (symb === "b") return `¡Pareja 'b' encontrada! ${accion} (marca como 'Y') e inicia retorno.`;
    if (symb === "") return `Falta una 'b' para emparejar: ${accion} y cambio a RECHAZAR.`;
    return `${accion} buscando pareja 'b'.`;
  }
  if (est === "AB_RETURN") {
    if (symb === "") return `Retornado al inicio de ronda. ${accion} para procesar siguiente 'a'.`;
    return `${accion} regresando al extremo izquierdo.`;
  }
  if (est === "AB_CHECK_START") {
    if (symb === "") return `Retornado al inicio. ${accion} para verificación final.`;
    return `${accion} retrocediendo para comprobación final.`;
  }
  if (est === "AB_CHECK_SCAN") {
    if (symb === "") return `¡Balance perfecto verificado! ${accion} y paso a ACEPTAR.`;
    if (symb === "a" || symb === "b") return `Desbalance detectado al final: ${accion} y cambio a RECHAZAR.`;
    return `${accion} comprobando marcas de cinta.`;
  }

  return `${accion} y cambio al estado ${nuevoEstado}.`;
};

export const traducirReglaMulticinta = (est, sym1, sym2, regl) => {
  if (!regl) return "";
  const [write1, move1, write2, move2, nuevoEstado] = regl;
  const dir1 =
    move1 === "R" ? "derecha" : move1 === "L" ? "izquierda" : "mantengo";
  const dir2 =
    move2 === "R" ? "derecha" : move2 === "L" ? "izquierda" : "mantengo";

  const sym1Label = sym1 === "" ? "celda vacía (_ )" : `'${sym1}'`;
  const sym2Label = sym2 === "" ? "celda vacía (_ )" : `'${sym2}'`;
  const esc1Label = write1 === "" ? "celda vacía (_ )" : `'${write1}'`;
  const esc2Label = write2 === "" ? "celda vacía (_ )" : `'${write2}'`;

  let accion = `Cinta 1: leo ${sym1Label}, escribo ${esc1Label}, muevo a la ${dir1}. Cinta 2: leo ${sym2Label}, escribo ${esc2Label}, muevo a la ${dir2}`;

  if (nuevoEstado === "ACEPTAR") {
    return `${accion}. ¡La cadena coincide perfectamente! Acepto la cadena.`;
  }
  if (nuevoEstado === "RECHAZAR") {
    return `${accion}. ¡Inconsistencia o desbalance de bloques detectado! Rechazo la cadena.`;
  }
  if (est === "Contar_A") {
    if (sym1 === "a") {
      return `${accion} para almacenar un '1' en Cinta 2 por esta 'a'.`;
    }
    if (sym1 === "b") {
      return `Terminó el bloque de 'a'. ${accion} para iniciar la comparación de 'b'.`;
    }
  }
  if (est === "Comparar_B") {
    if (sym1 === "b") {
      return `Comparando: ${accion} (restando un '1' en la Cinta 2 por esta 'b').`;
    }
    if (sym1 === "c") {
      return `Terminó el bloque de 'b'. ${accion} para iniciar la comparación de 'c'.`;
    }
  }
  if (est === "Comparar_C") {
    return `Comparando: ${accion} (restando un '1' en la Cinta 2 por esta 'c').`;
  }

  return `${accion} y cambio al estado ${nuevoEstado}.`;
};

// Genera una explicación corta en español para mostrar en la tabla de transiciones
export const traducirTransicionCorta = (estado, simbolo, regla, modo) => {
  if (!regla) return "";

  if (modo !== "monocinta") {
    // Multicinta
    const [, m1, , m2, nextEst] = regla;
    const m1Esp = m1 === "R" ? "D" : m1 === "L" ? "I" : "S";
    const m2Esp = m2 === "R" ? "D" : m2 === "L" ? "I" : "S";

    if (estado === "Contar_A") {
      if (simbolo.startsWith("a")) return "Cuenta 'a' (escribe '1' en C2)";
      if (simbolo.startsWith("b")) return "Fin de 'a', inicia comparar 'b'";
    }
    if (estado === "Comparar_B") {
      if (simbolo.includes(",1")) return "Empareja 'b' restando '1' en C2";
      if (simbolo.includes(", ") || simbolo.endsWith(",")) return "Fin de 'b', inicia comparar 'c'";
    }
    if (estado === "Comparar_C") {
      if (simbolo.includes(",1")) return "Empareja 'c' restando '1' en C2";
      if (simbolo.includes(", ") || simbolo.endsWith(",")) return "Fin de 'c' y contador vacío: ACEPTA";
    }
    return `C1: ${m1Esp}, C2: ${m2Esp} → ${nextEst}`;
  }

  // Monocinta
  const [, , nextEst] = regla;
  const symb = simbolo;

  // --- abc ---
  if (estado === "Buscar_A") {
    if (symb === "a") return "Marca 'a' con 'X' y va a buscar 'b'";
    if (symb === "Y") return "Fin de 'a's, inicia verificación";
  }
  if (estado === "Buscar_B") {
    if (symb === "a" || symb === "Y") return "Salta 'a'/'Y' buscando 'b'";
    if (symb === "b") return "Marca 'b' con 'Y' y va a buscar 'c'";
  }
  if (estado === "Buscar_C") {
    if (symb === "b" || symb === "Z") return "Salta 'b'/'Z' buscando 'c'";
    if (symb === "c") return "Marca 'c' con 'Z' y regresa al inicio";
  }
  if (estado === "Regresar") {
    if (symb === "X") return "Alcanzó inicio 'X', reinicia ciclo";
    return "Retrocede hacia la izquierda";
  }
  if (estado === "Verificar_Fin") {
    if (symb === "") return "Todo verificado: ACEPTA CADENA";
    return "Verifica que solo queden 'Y' y 'Z'";
  }

  // --- Palíndromo ---
  if (estado === "PAL0") {
    if (symb === "a") return "Marca 'a' inicial con 'X' y va al final";
    if (symb === "b") return "Marca 'b' inicial con 'Y' y va al final";
    if (symb === "X" || symb === "Y") return "Salta marcas anteriores";
    if (symb === "") return "Verificado completo: ACEPTA CADENA";
  }
  if (estado === "PAL_SEEK_A") {
    if (symb === "") return "Fin alcanzado, retrocede a validar 'a'";
    return "Avanza buscando el extremo derecho";
  }
  if (estado === "PAL_FIND_A") {
    if (symb === "a") return "Pareja 'a' encontrada, marca y retorna";
    return "Pareja incorrecta/vacía: RECHAZA";
  }
  if (estado === "PAL_SEEK_B") {
    if (symb === "") return "Fin alcanzado, retrocede a validar 'b'";
    return "Avanza buscando el extremo derecho";
  }
  if (estado === "PAL_FIND_B") {
    if (symb === "b") return "Pareja 'b' encontrada, marca y retorna";
    return "Pareja incorrecta/vacía: RECHAZA";
  }
  if (estado === "PAL_RETURN") {
    if (symb === "") return "Extremo izquierdo alcanzado, reinicia";
    return "Retrocede buscando extremo izquierdo";
  }

  // --- Balanceador de Paréntesis ---
  if (estado === "BP_SCAN") {
    if (symb === "(") return "Marca '(' con 'L' y busca su pareja ')'";
    if (symb === "X") return "Salta pareja ya resuelta 'X'";
    if (symb === ")") return "Salta ')' a la derecha";
    if (symb === "") return "Fin de cinta, inicia verificación";
  }
  if (estado === "BP_LOOK") {
    if (symb === ")") return "Pareja ')' hallada, va a confirmar '('";
    if (symb === "X") return "Salta marcas 'X' buscando ')'";
    if (symb === "(" || symb === "L") return "Otro '(' antes de cerrar, retrocede";
    if (symb === "") return "Falta cierre ')', inicia verificación";
  }
  if (estado === "BP_FAIL_BACK_TO_L") {
    if (symb === "L") return "Llegó a 'L', lo restaura a '('";
    return "Retrocede tras fallo de emparejamiento";
  }
  if (estado === "BP_FAIL_FORWARD") {
    if (symb === "(") return "Marca '(' con 'L' y reintenta buscar ')'";
    if (symb === ")") return "Cierre huérfano hallado: RECHAZA";
    return "Avanza buscando '(' tras recuperación";
  }
  if (estado === "BP_FIND_LEFT_L") {
    if (symb === "L") return "Marca par '(' y ')' con 'X' y reinicia";
    return "Retrocede buscando el '(' temporal";
  }
  if (estado === "BP_RESTART_LEFT") {
    if (symb === "") return "Extremo izquierdo alcanzado, reinicia";
    return "Retrocede hacia el extremo izquierdo";
  }
  if (estado === "BP_CHECK_START") {
    if (symb === "") return "Al inicio, inicia escaneo de control";
    return "Retrocede para verificación";
  }
  if (estado === "BP_CHECK_SCAN") {
    if (symb === "") return "Todos emparejados: ACEPTA CADENA";
    return "Símbolo sin emparejar hallado: RECHAZA";
  }

  // --- Duplicar ---
  if (estado === "DUP_FIND") {
    if (symb === "a") return "Marca 'a' con 'A' y va a copiarla";
    if (symb === "b") return "Marca 'b' con 'B' y va a copiarla";
    if (symb === "A" || symb === "B") return "Salta letras ya copiadas";
    if (symb === "") return "Copia finalizada, inicia limpieza";
  }
  if (estado === "DUP_COPY_A") {
    if (symb === "") return "Escribe copia 'A' al final y regresa";
    return "Avanza buscando fin de cinta para 'a'";
  }
  if (estado === "DUP_COPY_B") {
    if (symb === "") return "Escribe copia 'B' al final y regresa";
    return "Avanza buscando fin de cinta para 'b'";
  }
  if (estado === "DUP_RETURN_START") {
    if (symb === "") return "Retorno al inicio completo, busca letra";
    return "Retrocede buscando origen";
  }
  if (estado === "DUP_CLEAN") {
    if (symb === "") return "Limpieza completa: ACEPTA CADENA";
    return `Restaura marca '${symb}' a minúscula`;
  }

  // --- a^n b^n ---
  if (estado === "AB_START") {
    if (symb === "a") return "Marca 'a' con 'X' y busca pareja 'b'";
    if (symb === "X" || symb === "Y") return "Salta símbolos ya procesados";
    if (symb === "b") return "'b' huérfana al inicio: RECHAZA";
    if (symb === "") return "Escanéo terminado, inicia control";
  }
  if (estado === "AB_FIND_B") {
    if (symb === "b") return "Pareja 'b' hallada, marca 'Y' y regresa";
    if (symb === "") return "Falta pareja 'b': RECHAZA";
    return "Avanza buscando pareja 'b'";
  }
  if (estado === "AB_RETURN") {
    if (symb === "") return "Inicio de cinta alcanzado, reinicia";
    return "Retrocede al extremo izquierdo";
  }
  if (estado === "AB_CHECK_START") {
    if (symb === "") return "Al inicio, comprueba balance de marcas";
    return "Retrocede para comprobar marcas";
  }
  if (estado === "AB_CHECK_SCAN") {
    if (symb === "") return "Perfecto balance: ACEPTA CADENA";
    return "Símbolo sin emparejar hallado: RECHAZA";
  }

  return `Operación básica → ${traducirEstadoCorto(nextEst)}`;
};

export const traducirEstadoCorto = (est) => {
  if (est === "Buscar_A") return "Buscar A";
  if (est === "Buscar_B") return "Buscar B";
  if (est === "Buscar_C") return "Buscar C";
  if (est === "Regresar") return "Regresar";
  if (est === "Verificar_Fin") return "Verificar Fin";
  if (est === "Contar_A") return "Contar A";
  if (est === "Comparar_B") return "Comparar B";
  if (est === "Comparar_C") return "Comparar C";

  if (est === "PAL0") return "Inicio";
  if (est === "PAL_SEEK_A") return "Buscar fin 'a'";
  if (est === "PAL_FIND_A") return "Confirmar 'a'";
  if (est === "PAL_RETURN") return "Retornar";
  if (est === "PAL_SEEK_B") return "Buscar fin 'b'";
  if (est === "PAL_FIND_B") return "Confirmar 'b'";

  if (est === "BP_SCAN") return "Escanear";
  if (est === "BP_LOOK") return "Buscar pareja";
  if (est === "BP_FAIL_BACK_TO_L") return "Recuperar error";
  if (est === "BP_FAIL_FORWARD") return "Avanzar";
  if (est === "BP_FIND_LEFT_L") return "Confirmar par";
  if (est === "BP_RESTART_LEFT") return "Retornar";
  if (est === "BP_CHECK_START") return "Retornar (check)";
  if (est === "BP_CHECK_SCAN") return "Verificar";

  if (est === "DUP_FIND") return "Buscar letra";
  if (est === "DUP_COPY_A") return "Copiar 'a'";
  if (est === "DUP_COPY_B") return "Copiar 'b'";
  if (est === "DUP_RETURN_START") return "Retornar";
  if (est === "DUP_CLEAN") return "Limpieza";

  if (est === "AB_START") return "Buscar 'a'";
  if (est === "AB_FIND_B") return "Buscar 'b'";
  if (est === "AB_RETURN") return "Retornar";
  if (est === "AB_CHECK_START") return "Retornar (check)";
  if (est === "AB_CHECK_SCAN") return "Verificar";

  return est;
};
