// Tabla de transiciones estática para la Máquina de Turing Monocinta (a^n b^n c^n)
export const TRANSICIONES_MONOCINTA = {
  // Estado, Símbolo -> [Escribir, Mover, SiguienteEstado]
  
  // 1. Buscar_A: Marcamos la primera 'a' no contada como 'X'
  'Buscar_A,a': ['X', 'R', 'Buscar_B'],
  'Buscar_A,Y': ['Y', 'R', 'Verificar_Fin'], // Si no hay más 'a's, verificamos que no queden letras sin contar

  // 2. Buscar_B: Saltamos las 'a' y las 'Y' para buscar la primera 'b' no contada y marcarla como 'Y'
  'Buscar_B,a': ['a', 'R', 'Buscar_B'],
  'Buscar_B,Y': ['Y', 'R', 'Buscar_B'],
  'Buscar_B,b': ['Y', 'R', 'Buscar_C'],

  // 3. Buscar_C: Saltamos las 'b' y las 'Z' para buscar la primera 'c' no contada y marcarla como 'Z'
  'Buscar_C,b': ['b', 'R', 'Buscar_C'],
  'Buscar_C,Z': ['Z', 'R', 'Buscar_C'],
  'Buscar_C,c': ['Z', 'L', 'Regresar'], // Al marcar la 'c', regresamos a la izquierda

  // 4. Regresar: Volvemos al inicio buscando la marca 'X'
  'Regresar,a': ['a', 'L', 'Regresar'],
  'Regresar,b': ['b', 'L', 'Regresar'],
  'Regresar,Y': ['Y', 'L', 'Regresar'],
  'Regresar,Z': ['Z', 'L', 'Regresar'],
  'Regresar,X': ['X', 'R', 'Buscar_A'], // Regresamos una celda a la derecha de 'X' para buscar la siguiente 'a'

  // 5. Verificar_Fin: Aseguramos que solo queden 'Y' y 'Z' hasta el final de la cadena
  'Verificar_Fin,Y': ['Y', 'R', 'Verificar_Fin'],
  'Verificar_Fin,Z': ['Z', 'R', 'Verificar_Fin'],
  'Verificar_Fin,': ['', 'R', 'ACEPTAR'], // Si llegamos al final de la cinta, aceptamos
};

// Símbolos marcados correspondientes
export const MARKED_MONOCINTA = {
  'a': 'X',
  'b': 'Y',
  'c': 'Z',
  'X': 'X',
  'Y': 'Y',
  'Z': 'Z',
};

// Tabla de transiciones estática para la Máquina de Turing Multicinta (a^n b^n c^n)
export const TRANSICIONES_MULTICINTA = {
  // Estado, Símbolo1, Símbolo2 -> [Escribir1, Mover1, Escribir2, Mover2, SiguienteEstado]
  
  // 1. Contar_A: Contamos las 'a' escribiendo '1's en la Cinta 2
  'Contar_A,a,': ['a', 'R', '1', 'R', 'Contar_A'],
  'Contar_A,b,': ['b', 'S', '', 'L', 'Comparar_B'], // Transicionamos al ver la primera 'b'
  
  // 2. Comparar_B: Comparamos las 'b' retrocediendo el cabezal de Cinta 2
  'Comparar_B,b,1': ['b', 'R', '1', 'L', 'Comparar_B'],
  'Comparar_B,c,': ['c', 'S', '', 'R', 'Comparar_C'], // Transicionamos al ver la primera 'c' y Cinta 2 vacía

  // 3. Comparar_C: Comparamos las 'c' avanzando el cabezal de Cinta 2
  'Comparar_C,c,1': ['c', 'R', '1', 'R', 'Comparar_C'],
  'Comparar_C,,': ['', 'S', '', 'S', 'ACEPTAR'], // Aceptamos si terminamos Cinta 1 y Cinta 2 juntas
};

const validarPalindromoAB = (texto) => {
  const s = texto.trim();
  if (!/^[ab]*$/.test(s)) return false;
  const rev = s.split("").reverse().join("");
  return s === rev;
};

const validarBalanceParentesis = (texto) => {
  const s = texto.trim();
  if (!/^[()]*$/.test(s)) return false;
  let balance = 0;
  for (const ch of s) {
    if (ch === "(") balance += 1;
    else if (ch === ")") balance -= 1;
    if (balance < 0) return false;
  }
  return balance === 0;
};

const validarAnBn = (texto) => {
  const s = texto.trim();
  const match = s.match(/^a+b+$/);
  if (!match) return false;
  const aCount = (match[0].match(/a/g) || []).length;
  const bCount = (match[0].match(/b/g) || []).length;
  return aCount === bCount && aCount > 0;
};

const validarAnBnCn = (texto) => {
  const s = texto.trim();
  const match = s.match(/^(a+)(b+)(c+)$/);
  if (!match) return false;
  const countA = match[1].length;
  const countB = match[2].length;
  const countC = match[3].length;
  return countA === countB && countA === countC;
};

export const TRANSICIONES_PALINDROMO_MONOCINTA = {
  // Markers: X para 'a' ya emparejada, Y para 'b' ya emparejada
  'PAL0,a': ['X', 'R', 'PAL_SEEK_A'],
  'PAL0,b': ['Y', 'R', 'PAL_SEEK_B'],
  'PAL0,X': ['X', 'R', 'PAL0'],
  'PAL0,Y': ['Y', 'R', 'PAL0'],
  'PAL0,': ['', 'R', 'ACEPTAR'],

  // Buscar al final para encontrar pareja con 'a'
  'PAL_SEEK_A,a': ['a', 'R', 'PAL_SEEK_A'],
  'PAL_SEEK_A,b': ['b', 'R', 'PAL_SEEK_A'],
  'PAL_SEEK_A,X': ['X', 'R', 'PAL_SEEK_A'],
  'PAL_SEEK_A,Y': ['Y', 'R', 'PAL_SEEK_A'],
  'PAL_SEEK_A,': ['', 'L', 'PAL_FIND_A'],

  // Volver hacia la izquierda buscando 'a' sin marcar
  'PAL_FIND_A,X': ['X', 'L', 'PAL_FIND_A'],
  'PAL_FIND_A,Y': ['Y', 'L', 'PAL_FIND_A'],
  'PAL_FIND_A,a': ['X', 'L', 'PAL_RETURN'],
  'PAL_FIND_A,b': ['b', 'L', 'RECHAZAR'],
  'PAL_FIND_A,': ['', 'L', 'RECHAZAR'],

  // Regresar al inicio de la cinta (al blanco de la izquierda) para repetir
  'PAL_RETURN,a': ['a', 'L', 'PAL_RETURN'],
  'PAL_RETURN,b': ['b', 'L', 'PAL_RETURN'],
  'PAL_RETURN,X': ['X', 'L', 'PAL_RETURN'],
  'PAL_RETURN,Y': ['Y', 'L', 'PAL_RETURN'],
  'PAL_RETURN,': ['', 'R', 'PAL0'],

  // Buscar al final para encontrar pareja con 'b'
  'PAL_SEEK_B,a': ['a', 'R', 'PAL_SEEK_B'],
  'PAL_SEEK_B,b': ['b', 'R', 'PAL_SEEK_B'],
  'PAL_SEEK_B,X': ['X', 'R', 'PAL_SEEK_B'],
  'PAL_SEEK_B,Y': ['Y', 'R', 'PAL_SEEK_B'],
  'PAL_SEEK_B,': ['', 'L', 'PAL_FIND_B'],

  // Volver hacia la izquierda buscando 'b' sin marcar
  'PAL_FIND_B,X': ['X', 'L', 'PAL_FIND_B'],
  'PAL_FIND_B,Y': ['Y', 'L', 'PAL_FIND_B'],
  'PAL_FIND_B,b': ['Y', 'L', 'PAL_RETURN'],
  'PAL_FIND_B,a': ['a', 'L', 'RECHAZAR'],
  'PAL_FIND_B,': ['', 'L', 'RECHAZAR'],
};

export const TRANSICIONES_BALANCEADOR_MONOCINTA = {
  // Markers:
  // X => parens ya emparejados (procesados)
  // L => paren '(' pendiente de emparejar (para evitar marcar el '(' incorrecto)
  'BP_SCAN,(': ['L', 'R', 'BP_LOOK'],
  'BP_SCAN,)': [')', 'R', 'BP_SCAN'],
  'BP_SCAN,X': ['X', 'R', 'BP_SCAN'],
  'BP_SCAN,L': ['L', 'R', 'BP_LOOK'],
  'BP_SCAN,': ['', 'L', 'BP_CHECK_START'],

  // Buscar el siguiente simbolo no-X a la derecha (para decidir si es "()" ignorando X)
  'BP_LOOK,X': ['X', 'R', 'BP_LOOK'],
  'BP_LOOK,)': ['X', 'L', 'BP_FIND_LEFT_L'],
  'BP_LOOK,(': ['(', 'R', 'BP_FAIL_BACK_TO_L'],
  'BP_LOOK,L': ['L', 'R', 'BP_FAIL_BACK_TO_L'],
  'BP_LOOK,': ['', 'L', 'BP_CHECK_START'],

  // Falla: el primer no-X despues de L es '(' (no cancelable ahora).
  // Restaurar L a '(' y luego re-iniciar intentando emparejar este '('.
  'BP_FAIL_BACK_TO_L,X': ['X', 'L', 'BP_FAIL_BACK_TO_L'],
  'BP_FAIL_BACK_TO_L,(': ['(', 'L', 'BP_FAIL_BACK_TO_L'],
  'BP_FAIL_BACK_TO_L,)': [')', 'L', 'BP_FAIL_BACK_TO_L'],
  'BP_FAIL_BACK_TO_L,L': ['(', 'R', 'BP_FAIL_FORWARD'],
  'BP_FAIL_BACK_TO_L,': ['', 'L', 'BP_CHECK_START'],

  'BP_FAIL_FORWARD,X': ['X', 'R', 'BP_FAIL_FORWARD'],
  'BP_FAIL_FORWARD,(': ['L', 'R', 'BP_LOOK'],
  'BP_FAIL_FORWARD,L': ['L', 'R', 'BP_LOOK'],
  'BP_FAIL_FORWARD,)': [')', 'R', 'RECHAZAR'],
  'BP_FAIL_FORWARD,': ['', 'L', 'BP_CHECK_START'],

  // Cancelacion: ya marcamos ')' como X, ahora buscamos el L correcto a la izquierda.
  'BP_FIND_LEFT_L,X': ['X', 'L', 'BP_FIND_LEFT_L'],
  'BP_FIND_LEFT_L,(': ['(', 'L', 'BP_FIND_LEFT_L'],
  'BP_FIND_LEFT_L,)': [')', 'L', 'BP_FIND_LEFT_L'],
  'BP_FIND_LEFT_L,L': ['X', 'L', 'BP_RESTART_LEFT'],
  'BP_FIND_LEFT_L,': ['', 'L', 'RECHAZAR'],

  // Reiniciar pase moviendonos al inicio.
  'BP_RESTART_LEFT,X': ['X', 'L', 'BP_RESTART_LEFT'],
  'BP_RESTART_LEFT,(': ['(', 'L', 'BP_RESTART_LEFT'],
  'BP_RESTART_LEFT,)': [')', 'L', 'BP_RESTART_LEFT'],
  'BP_RESTART_LEFT,L': ['L', 'L', 'BP_RESTART_LEFT'],
  'BP_RESTART_LEFT,': ['', 'R', 'BP_SCAN'],

  // Check final: no se encontraron pares cancelables en un pase completo.
  // Si queda '(' o ')' sin X => rechazo; si solo queda X => aceptacion.
  'BP_CHECK_START,X': ['X', 'L', 'BP_CHECK_START'],
  'BP_CHECK_START,(': ['(', 'L', 'BP_CHECK_START'],
  'BP_CHECK_START,)': [')', 'L', 'BP_CHECK_START'],
  'BP_CHECK_START,L': ['L', 'L', 'BP_CHECK_START'],
  'BP_CHECK_START,': ['', 'R', 'BP_CHECK_SCAN'],

  'BP_CHECK_SCAN,X': ['X', 'R', 'BP_CHECK_SCAN'],
  'BP_CHECK_SCAN,(': ['(', 'R', 'RECHAZAR'],
  'BP_CHECK_SCAN,)': [')', 'R', 'RECHAZAR'],
  'BP_CHECK_SCAN,L': ['L', 'R', 'RECHAZAR'],
  'BP_CHECK_SCAN,': ['', 'R', 'ACEPTAR'],
};

export const TRANSICIONES_DUPLICAR_MONOCINTA = {
  // Markers: A representa 'a' ya procesada/copiada, B representa 'b'
  'DUP_FIND,a': ['A', 'R', 'DUP_COPY_A'],
  'DUP_FIND,b': ['B', 'R', 'DUP_COPY_B'],
  'DUP_FIND,A': ['A', 'R', 'DUP_FIND'],
  'DUP_FIND,B': ['B', 'R', 'DUP_FIND'],
  'DUP_FIND,': ['', 'L', 'DUP_CLEAN'],

  'DUP_COPY_A,a': ['a', 'R', 'DUP_COPY_A'],
  'DUP_COPY_A,b': ['b', 'R', 'DUP_COPY_A'],
  'DUP_COPY_A,A': ['A', 'R', 'DUP_COPY_A'],
  'DUP_COPY_A,B': ['B', 'R', 'DUP_COPY_A'],
  'DUP_COPY_A,': ['A', 'L', 'DUP_RETURN_START'],

  'DUP_COPY_B,a': ['a', 'R', 'DUP_COPY_B'],
  'DUP_COPY_B,b': ['b', 'R', 'DUP_COPY_B'],
  'DUP_COPY_B,A': ['A', 'R', 'DUP_COPY_B'],
  'DUP_COPY_B,B': ['B', 'R', 'DUP_COPY_B'],
  'DUP_COPY_B,': ['B', 'L', 'DUP_RETURN_START'],

  'DUP_RETURN_START,a': ['a', 'L', 'DUP_RETURN_START'],
  'DUP_RETURN_START,b': ['b', 'L', 'DUP_RETURN_START'],
  'DUP_RETURN_START,A': ['A', 'L', 'DUP_RETURN_START'],
  'DUP_RETURN_START,B': ['B', 'L', 'DUP_RETURN_START'],
  'DUP_RETURN_START,': ['', 'R', 'DUP_FIND'],

  'DUP_CLEAN,A': ['a', 'R', 'DUP_CLEAN'],
  'DUP_CLEAN,B': ['b', 'R', 'DUP_CLEAN'],
  'DUP_CLEAN,a': ['a', 'R', 'DUP_CLEAN'],
  'DUP_CLEAN,b': ['b', 'R', 'DUP_CLEAN'],
  'DUP_CLEAN,': ['', 'R', 'ACEPTAR'],
};

export const TRANSICIONES_ANBN_MONOCINTA = {
  // Lenguaje a^n b^n (n >= 1)
  // Markers: X marca 'a' emparejada; Y marca 'b' emparejada
  'AB_START,a': ['X', 'R', 'AB_FIND_B'],
  'AB_START,X': ['X', 'R', 'AB_START'],
  'AB_START,Y': ['Y', 'R', 'AB_START'],
  'AB_START,b': ['b', 'R', 'RECHAZAR'],
  'AB_START,': ['', 'L', 'AB_CHECK_START'],

  'AB_FIND_B,a': ['a', 'R', 'AB_FIND_B'],
  'AB_FIND_B,X': ['X', 'R', 'AB_FIND_B'],
  'AB_FIND_B,Y': ['Y', 'R', 'AB_FIND_B'],
  'AB_FIND_B,b': ['Y', 'L', 'AB_RETURN'],
  'AB_FIND_B,': ['', 'L', 'RECHAZAR'],

  'AB_RETURN,a': ['a', 'L', 'AB_RETURN'],
  'AB_RETURN,b': ['b', 'L', 'AB_RETURN'],
  'AB_RETURN,X': ['X', 'L', 'AB_RETURN'],
  'AB_RETURN,Y': ['Y', 'L', 'AB_RETURN'],
  'AB_RETURN,': ['', 'R', 'AB_START'],

  'AB_CHECK_START,a': ['a', 'L', 'AB_CHECK_START'],
  'AB_CHECK_START,b': ['b', 'L', 'AB_CHECK_START'],
  'AB_CHECK_START,X': ['X', 'L', 'AB_CHECK_START'],
  'AB_CHECK_START,Y': ['Y', 'L', 'AB_CHECK_START'],
  'AB_CHECK_START,': ['', 'R', 'AB_CHECK_SCAN'],

  'AB_CHECK_SCAN,X': ['X', 'R', 'AB_CHECK_SCAN'],
  'AB_CHECK_SCAN,Y': ['Y', 'R', 'AB_CHECK_SCAN'],
  'AB_CHECK_SCAN,a': ['a', 'R', 'RECHAZAR'],
  'AB_CHECK_SCAN,b': ['b', 'R', 'RECHAZAR'],
  'AB_CHECK_SCAN,': ['', 'R', 'ACEPTAR'],
};

export const TURING_MACHINES_MONOCINTA = {
  abc: {
    id: "abc",
    displayName: "a^n b^n c^n",
    startState: "Buscar_A",
    exampleInput: "aaabbbccc",
    inputPlaceholder: "Ejemplo: aaabbbccc",
    inputHint:
      "Acepta si la cadena tiene n a's, luego n b's y luego n c's (n >= 1).",
    validateInput: validarAnBnCn,
    transitions: TRANSICIONES_MONOCINTA,
    marked: MARKED_MONOCINTA,
    presets: [
      { label: "aaabbbccc (Correcto - n=3)", value: "aaabbbccc", valid: true },
      { label: "aabbcc (Correcto - n=2)", value: "aabbcc", valid: true },
      { label: "abc (Correcto - n=1)", value: "abc", valid: true },
      { label: "aabbc (Incorrecto)", value: "aabbc", valid: false },
      { label: "abbcc (Incorrecto)", value: "abbcc", valid: false },
      { label: "bbaacc (Incorrecto)", value: "bbaacc", valid: false },
    ],
  },
  palindromo: {
    id: "palindromo",
    displayName: "Palindromo (a/b)",
    startState: "PAL0",
    exampleInput: "abba",
    inputPlaceholder: "Ejemplo: abba",
    inputHint: "Acepta si la cadena es un palindromo (solo a y b).",
    validateInput: validarPalindromoAB,
    transitions: TRANSICIONES_PALINDROMO_MONOCINTA,
    presets: [
      { label: "abba (Correcto)", value: "abba", valid: true },
      { label: "aba (Correcto)", value: "aba", valid: true },
      { label: "abbaab (Incorrecto)", value: "abbaab", valid: false },
      { label: "ab (Incorrecto)", value: "ab", valid: false },
    ],
  },
  parentesis: {
    id: "parentesis",
    displayName: "Balanceador de parentesis",
    startState: "BP_SCAN",
    exampleInput: "(())",
    inputPlaceholder: "Ejemplo: (())",
    inputHint: "Acepta cadenas balanceadas de '()' (solo parens).",
    validateInput: validarBalanceParentesis,
    transitions: TRANSICIONES_BALANCEADOR_MONOCINTA,
    presets: [
      { label: "(()) (Correcto)", value: "(())", valid: true },
      { label: "(()()) (Correcto)", value: "(()())", valid: true },
      { label: "()() (Correcto)", value: "()()", valid: true },
      { label: "(() (Incorrecto)", value: "(()", valid: false },
      { label: "()) (Incorrecto)", value: "())", valid: false },
    ],
  },
  duplicar: {
    id: "duplicar",
    displayName: "Duplicar cadena (a/b)",
    startState: "DUP_FIND",
    exampleInput: "abba",
    inputPlaceholder: "Ejemplo: abba",
    inputHint:
      "La maquina escribe una copia al final. Acepta cuando termina la duplicacion (solo a y b).",
    validateInput: (texto) => /^[ab]*$/.test(texto.trim()),
    transitions: TRANSICIONES_DUPLICAR_MONOCINTA,
    presets: [
      { label: "abba (Correcto)", value: "abba", valid: true },
      { label: "aaab (Correcto)", value: "aaab", valid: true },
      { label: "ababa (Correcto)", value: "ababa", valid: true },
      { label: "abca (Incorrecto)", value: "abca", valid: false },
    ],
  },
  anbn: {
    id: "anbn",
    displayName: "a^n b^n (n>=1)",
    startState: "AB_START",
    exampleInput: "aaabbb",
    inputPlaceholder: "Ejemplo: aaabbb",
    inputHint: "Acepta si la cadena es a^n b^n con n>=1.",
    validateInput: validarAnBn,
    transitions: TRANSICIONES_ANBN_MONOCINTA,
    presets: [
      { label: "aaabbb (Correcto - n=3)", value: "aaabbb", valid: true },
      { label: "aabb (Correcto - n=2)", value: "aabb", valid: true },
      { label: "ab (Correcto - n=1)", value: "ab", valid: true },
      { label: "aabbb (Incorrecto)", value: "aabbb", valid: false },
      { label: "abb (Incorrecto)", value: "abb", valid: false },
    ],
  },
};
