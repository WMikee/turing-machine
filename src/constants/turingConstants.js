export function generarTransiciones(alphabet) {
  const transitions = {};
  const marked = {};
  const used = new Set(alphabet);

  for (const char of alphabet) {
    const upper = char.toUpperCase();
    if (upper !== char && !used.has(upper)) {
      marked[char] = upper;
      used.add(upper);
    } else {
      let candidate = char + "′";
      marked[char] = candidate;
      used.add(candidate);
    }
  }

  function addTransition(state, symbol, write, move, nextState) {
    transitions[`${state},${symbol}`] = [write, move, nextState];
  }

  for (const char of alphabet) {
    addTransition('q0', char, char, 'R', `q_scan_${char}_`);
  }
  addTransition('q0', '', '', 'R', 'RECHAZAR');

  const getSubsets = (arr) => {
    const res = [[]];
    for (const el of arr) {
      const len = res.length;
      for (let i = 0; i < len; i++) {
        res.push([...res[i], el]);
      }
    }
    return res;
  };

  const allSubsets = getSubsets(alphabet);

  for (const X of alphabet) {
    for (const subset of allSubsets) {
      if (subset.includes(X)) continue;
      
      const F = [...subset].sort().join('');
      const state = `q_scan_${X}_${F}`;
      
      addTransition(state, X, X, 'R', state);
      
      for (const Y of alphabet) {
        if (Y === X) continue;
        if (subset.includes(Y)) {
          addTransition(state, Y, Y, 'R', 'RECHAZAR');
        } else {
          const nextF = [...subset, X].sort().join('');
          addTransition(state, Y, Y, 'R', `q_scan_${Y}_${nextF}`);
        }
      }
      
      addTransition(state, '', '', 'L', 'q_go_left');
    }
  }

  for (const char of alphabet) {
    addTransition('q_go_left', char, char, 'L', 'q_go_left');
    addTransition('q_go_left', marked[char], marked[char], 'L', 'q_go_left');
  }
  addTransition('q_go_left', '', '', 'R', 'q_match_start');

  for (const char of alphabet) {
    addTransition('q_match_start', char, marked[char], 'R', `q_skip_block_${char}`);
    addTransition('q_match_start', marked[char], marked[char], 'R', `q_mark_block1_${char}`);
  }
  addTransition('q_match_start', '', '', 'R', 'ACEPTAR');

  for (const X of alphabet) {
    const state = `q_mark_block1_${X}`;
    addTransition(state, marked[X], marked[X], 'R', state);
    addTransition(state, X, marked[X], 'R', `q_skip_block_${X}`);
    
    for (const Y of alphabet) {
      if (Y === X) continue;
      addTransition(state, Y, Y, 'L', 'q_check_all_marked');
      addTransition(state, marked[Y], marked[Y], 'L', 'q_check_all_marked');
    }
    addTransition(state, '', '', 'L', 'q_check_all_marked');
  }

  for (const char of alphabet) {
    addTransition('q_check_all_marked', marked[char], marked[char], 'R', 'q_check_all_marked');
  }
  addTransition('q_check_all_marked', '', '', 'R', 'ACEPTAR');

  for (const X of alphabet) {
    const state = `q_skip_block_${X}`;
    
    addTransition(state, X, X, 'R', state);
    addTransition(state, marked[X], marked[X], 'R', state);
    
    for (const Y of alphabet) {
      if (Y === X) continue;
      addTransition(state, Y, marked[Y], 'R', `q_skip_block_${Y}`);
      addTransition(state, marked[Y], marked[Y], 'R', `q_mark_block_${Y}`);
    }
    
    addTransition(state, '', '', 'L', 'q_go_left');
  }

  for (const Y of alphabet) {
    const state = `q_mark_block_${Y}`;
    addTransition(state, marked[Y], marked[Y], 'R', state);
    addTransition(state, Y, marked[Y], 'R', `q_skip_block_${Y}`);
  }

  return { transitions, marked };
}

export function generarTransicionesMulticinta(alphabet) {
  const transitions = {};
  
  function addTransition(state, sym1, sym2, write1, move1, write2, move2, nextState) {
    transitions[`${state},${sym1},${sym2}`] = [write1, move1, write2, move2, nextState];
  }

  for (const char of alphabet) {
    addTransition('q0', char, '', char, 'R', '1', 'R', `q_count_first_${char}`);
  }
  addTransition('q0', '', '', '', 'R', '', 'R', 'RECHAZAR');

  const getSubsets = (arr) => {
    const res = [[]];
    for (const el of arr) {
      const len = res.length;
      for (let i = 0; i < len; i++) {
        res.push([...res[i], el]);
      }
    }
    return res;
  };

  const allSubsets = getSubsets(alphabet);

  for (const X of alphabet) {
    addTransition(`q_count_first_${X}`, X, '', X, 'R', '1', 'R', `q_count_first_${X}`);

    for (const Y of alphabet) {
      if (Y === X) continue;
      addTransition(`q_count_first_${X}`, Y, '', Y, 'S', '', 'L', `q_match_L_${Y}_${X}`);
    }

    addTransition(`q_count_first_${X}`, '', '', '', 'S', '', 'S', 'ACEPTAR');
  }

  for (const X of alphabet) {
    for (const subset of allSubsets) {
      if (subset.includes(X)) continue;
      const F = [...subset].sort().join('');

      addTransition(`q_match_L_${X}_${F}`, X, '1', X, 'R', '1', 'L', `q_match_L_${X}_${F}`);

      for (const Y of alphabet) {
        if (Y === X || subset.includes(Y)) continue;
        const nextF = [...subset, X].sort().join('');
        addTransition(`q_match_L_${X}_${F}`, Y, '', Y, 'S', '', 'R', `q_match_R_${Y}_${nextF}`);
      }

      addTransition(`q_match_L_${X}_${F}`, '', '', '', 'S', '', 'S', 'ACEPTAR');

      addTransition(`q_match_R_${X}_${F}`, X, '1', X, 'R', '1', 'R', `q_match_R_${X}_${F}`);

      for (const Y of alphabet) {
        if (Y === X || subset.includes(Y)) continue;
        const nextF = [...subset, X].sort().join('');
        addTransition(`q_match_R_${X}_${F}`, Y, '', Y, 'S', '', 'L', `q_match_L_${Y}_${nextF}`);
      }

      addTransition(`q_match_R_${X}_${F}`, '', '', '', 'S', '', 'S', 'ACEPTAR');
    }
  }

  return { transitions };
}

const defaultAlphabet = ['a', 'b', 'c', 'd'];
const { transitions: defaultTransitions } = generarTransiciones(defaultAlphabet);
export const TRANSICIONES = defaultTransitions;

