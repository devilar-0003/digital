/**
 * builds.ts – Digital logic simulation definitions.
 * Each build describes inputs, outputs and the evaluation function.
 * Sequential builds carry internal state updated on clock rising edges.
 */
export type Bits = Record<string, number>;

export interface TruthRow {
  inputs: Record<string, string | number>;
  outputs: Record<string, string | number>;
  note?: string;
}

export interface CircuitBuild {
  id: string;
  inputs: string[]; // data inputs (switches)
  outputs: string[];
  clocked?: boolean; // has a CLK pulse button
  initState?: () => Bits;
  /** Combinational evaluation (may read state for sequential circuits) */
  evaluate: (inp: Bits, state: Bits) => Bits;
  /** Rising-edge handler for sequential circuits */
  onClock?: (inp: Bits, state: Bits) => Bits;
  /** Manual truth / characteristic table. Auto-generated when omitted (<=4 inputs). */
  table?: TruthRow[];
  tableTitle?: string;
  stateLabels?: string[]; // state keys to visualise
}

const b = (v: boolean) => (v ? 1 : 0);
const comb = (
  id: string,
  inputs: string[],
  outputs: string[],
  fn: (i: Bits) => Bits,
  extra: Partial<CircuitBuild> = {}
): CircuitBuild => ({ id, inputs, outputs, evaluate: fn, ...extra });

export const builds: Record<string, CircuitBuild> = {};
const reg = (c: CircuitBuild) => (builds[c.id] = c);

/* ───────────── Logic gates ───────────── */
reg(comb("and", ["A", "B"], ["Y"], (i) => ({ Y: i.A & i.B })));
reg(comb("or", ["A", "B"], ["Y"], (i) => ({ Y: i.A | i.B })));
reg(comb("not", ["A"], ["Y"], (i) => ({ Y: i.A ^ 1 })));
reg(comb("nand", ["A", "B"], ["Y"], (i) => ({ Y: (i.A & i.B) ^ 1 })));
reg(comb("nor", ["A", "B"], ["Y"], (i) => ({ Y: (i.A | i.B) ^ 1 })));
reg(comb("xor", ["A", "B"], ["Y"], (i) => ({ Y: i.A ^ i.B })));
reg(comb("xnor", ["A", "B"], ["Y"], (i) => ({ Y: (i.A ^ i.B) ^ 1 })));

/* ───────────── Combinational ───────────── */
reg(comb("half-adder", ["A", "B"], ["SUM", "CARRY"], (i) => ({ SUM: i.A ^ i.B, CARRY: i.A & i.B })));
reg(
  comb("full-adder", ["A", "B", "CIN"], ["SUM", "COUT"], (i) => ({
    SUM: i.A ^ i.B ^ i.CIN,
    COUT: (i.A & i.B) | (i.CIN & (i.A ^ i.B)),
  }))
);
reg(comb("half-subtractor", ["A", "B"], ["DIFF", "BORROW"], (i) => ({ DIFF: i.A ^ i.B, BORROW: (i.A ^ 1) & i.B })));
reg(
  comb("full-subtractor", ["A", "B", "BIN"], ["DIFF", "BOUT"], (i) => ({
    DIFF: i.A ^ i.B ^ i.BIN,
    BOUT: ((i.A ^ 1) & i.B) | ((i.A ^ i.B ^ 1) & i.BIN),
  }))
);
reg(
  comb(
    "multiplexer",
    ["I0", "I1", "I2", "I3", "S0", "S1"],
    ["Y"],
    (i) => {
      const sel = i.S1 * 2 + i.S0;
      return { Y: i[`I${sel}`] };
    },
    {
      tableTitle: "4:1 Multiplexer – Function Table",
      table: [0, 1, 2, 3].map((s) => ({
        inputs: { S1: (s >> 1) & 1, S0: s & 1, I0: "X", I1: "X", I2: "X", I3: "X" },
        outputs: { Y: `I${s}` },
      })),
    }
  )
);
reg(
  comb("demultiplexer", ["D", "S0", "S1"], ["Y0", "Y1", "Y2", "Y3"], (i) => {
    const sel = i.S1 * 2 + i.S0;
    const o: Bits = { Y0: 0, Y1: 0, Y2: 0, Y3: 0 };
    o[`Y${sel}`] = i.D;
    return o;
  })
);
reg(
  comb(
    "encoder",
    ["D0", "D1", "D2", "D3"],
    ["A1", "A0", "V"],
    (i) => {
      // 4-to-2 priority encoder (D3 highest)
      if (i.D3) return { A1: 1, A0: 1, V: 1 };
      if (i.D2) return { A1: 1, A0: 0, V: 1 };
      if (i.D1) return { A1: 0, A0: 1, V: 1 };
      if (i.D0) return { A1: 0, A0: 0, V: 1 };
      return { A1: 0, A0: 0, V: 0 };
    },
    {
      tableTitle: "4-to-2 Priority Encoder",
      table: [
        { inputs: { D3: 0, D2: 0, D1: 0, D0: 0 }, outputs: { A1: 0, A0: 0, V: 0 } },
        { inputs: { D3: 0, D2: 0, D1: 0, D0: 1 }, outputs: { A1: 0, A0: 0, V: 1 } },
        { inputs: { D3: 0, D2: 0, D1: 1, D0: "X" }, outputs: { A1: 0, A0: 1, V: 1 } },
        { inputs: { D3: 0, D2: 1, D1: "X", D0: "X" }, outputs: { A1: 1, A0: 0, V: 1 } },
        { inputs: { D3: 1, D2: "X", D1: "X", D0: "X" }, outputs: { A1: 1, A0: 1, V: 1 } },
      ],
    }
  )
);
reg(
  comb("decoder", ["A0", "A1", "EN"], ["Y0", "Y1", "Y2", "Y3"], (i) => {
    const o: Bits = { Y0: 0, Y1: 0, Y2: 0, Y3: 0 };
    if (i.EN) o[`Y${i.A1 * 2 + i.A0}`] = 1;
    return o;
  })
);
reg(
  comb("comparator", ["A1", "A0", "B1", "B0"], ["A>B", "A=B", "A<B"], (i) => {
    const a = i.A1 * 2 + i.A0;
    const bb = i.B1 * 2 + i.B0;
    return { "A>B": b(a > bb), "A=B": b(a === bb), "A<B": b(a < bb) };
  })
);

/* ───────────── Sequential ───────────── */
reg({
  id: "sr-flip-flop",
  inputs: ["S", "R"],
  outputs: ["Q", "Q'"],
  clocked: true,
  initState: () => ({ Q: 0 }),
  evaluate: (_i, s) => ({ Q: s.Q, "Q'": s.Q ^ 1 }),
  onClock: (i, s) => {
    if (i.S && i.R) return s; // invalid – hold (modelled)
    if (i.S) return { Q: 1 };
    if (i.R) return { Q: 0 };
    return s;
  },
  tableTitle: "SR Flip-Flop – Characteristic Table",
  table: [
    { inputs: { S: 0, R: 0 }, outputs: { "Q(n+1)": "Q(n)" }, note: "Hold" },
    { inputs: { S: 0, R: 1 }, outputs: { "Q(n+1)": 0 }, note: "Reset" },
    { inputs: { S: 1, R: 0 }, outputs: { "Q(n+1)": 1 }, note: "Set" },
    { inputs: { S: 1, R: 1 }, outputs: { "Q(n+1)": "?" }, note: "Invalid / forbidden" },
  ],
});
reg({
  id: "jk-flip-flop",
  inputs: ["J", "K"],
  outputs: ["Q", "Q'"],
  clocked: true,
  initState: () => ({ Q: 0 }),
  evaluate: (_i, s) => ({ Q: s.Q, "Q'": s.Q ^ 1 }),
  onClock: (i, s) => {
    if (i.J && i.K) return { Q: s.Q ^ 1 };
    if (i.J) return { Q: 1 };
    if (i.K) return { Q: 0 };
    return s;
  },
  tableTitle: "JK Flip-Flop – Characteristic Table",
  table: [
    { inputs: { J: 0, K: 0 }, outputs: { "Q(n+1)": "Q(n)" }, note: "Hold" },
    { inputs: { J: 0, K: 1 }, outputs: { "Q(n+1)": 0 }, note: "Reset" },
    { inputs: { J: 1, K: 0 }, outputs: { "Q(n+1)": 1 }, note: "Set" },
    { inputs: { J: 1, K: 1 }, outputs: { "Q(n+1)": "Q(n)'" }, note: "Toggle" },
  ],
});
reg({
  id: "d-flip-flop",
  inputs: ["D"],
  outputs: ["Q", "Q'"],
  clocked: true,
  initState: () => ({ Q: 0 }),
  evaluate: (_i, s) => ({ Q: s.Q, "Q'": s.Q ^ 1 }),
  onClock: (i) => ({ Q: i.D }),
  tableTitle: "D Flip-Flop – Characteristic Table",
  table: [
    { inputs: { D: 0 }, outputs: { "Q(n+1)": 0 }, note: "Reset" },
    { inputs: { D: 1 }, outputs: { "Q(n+1)": 1 }, note: "Set" },
  ],
});
reg({
  id: "t-flip-flop",
  inputs: ["T"],
  outputs: ["Q", "Q'"],
  clocked: true,
  initState: () => ({ Q: 0 }),
  evaluate: (_i, s) => ({ Q: s.Q, "Q'": s.Q ^ 1 }),
  onClock: (i, s) => ({ Q: i.T ? s.Q ^ 1 : s.Q }),
  tableTitle: "T Flip-Flop – Characteristic Table",
  table: [
    { inputs: { T: 0 }, outputs: { "Q(n+1)": "Q(n)" }, note: "Hold" },
    { inputs: { T: 1 }, outputs: { "Q(n+1)": "Q(n)'" }, note: "Toggle" },
  ],
});
reg({
  id: "register",
  inputs: ["D3", "D2", "D1", "D0", "LOAD"],
  outputs: ["Q3", "Q2", "Q1", "Q0"],
  clocked: true,
  initState: () => ({ Q3: 0, Q2: 0, Q1: 0, Q0: 0 }),
  evaluate: (_i, s) => ({ Q3: s.Q3, Q2: s.Q2, Q1: s.Q1, Q0: s.Q0 }),
  onClock: (i, s) => (i.LOAD ? { Q3: i.D3, Q2: i.D2, Q1: i.D1, Q0: i.D0 } : s),
  tableTitle: "4-bit Parallel Register – Function Table",
  table: [
    { inputs: { LOAD: 0, CLK: "↑" }, outputs: { "Q3..Q0": "Hold" } },
    { inputs: { LOAD: 1, CLK: "↑" }, outputs: { "Q3..Q0": "D3..D0" }, note: "Parallel load" },
  ],
});
reg({
  id: "counter",
  inputs: ["EN", "UP"],
  outputs: ["Q3", "Q2", "Q1", "Q0"],
  clocked: true,
  initState: () => ({ n: 0 }),
  evaluate: (_i, s) => ({ Q3: (s.n >> 3) & 1, Q2: (s.n >> 2) & 1, Q1: (s.n >> 1) & 1, Q0: s.n & 1 }),
  onClock: (i, s) => (i.EN ? { n: (s.n + (i.UP ? 1 : 15)) & 15 } : s),
  stateLabels: ["n"],
  tableTitle: "4-bit Up/Down Counter – Function Table",
  table: [
    { inputs: { EN: 0, UP: "X", CLK: "↑" }, outputs: { Count: "Hold" } },
    { inputs: { EN: 1, UP: 1, CLK: "↑" }, outputs: { Count: "Q + 1" }, note: "Up count, wraps 15→0" },
    { inputs: { EN: 1, UP: 0, CLK: "↑" }, outputs: { Count: "Q − 1" }, note: "Down count, wraps 0→15" },
  ],
});

/* ───────────── Memory ───────────── */
const romData = [0b1010, 0b0110, 0b1111, 0b0001];
reg(
  comb("rom", ["A1", "A0"], ["D3", "D2", "D1", "D0"], (i) => {
    const w = romData[i.A1 * 2 + i.A0];
    return { D3: (w >> 3) & 1, D2: (w >> 2) & 1, D1: (w >> 1) & 1, D0: w & 1 };
  })
);
reg({
  id: "ram",
  inputs: ["A1", "A0", "I3", "I2", "I1", "I0", "WE"],
  outputs: ["D3", "D2", "D1", "D0"],
  clocked: true,
  initState: () => ({ m0: 0, m1: 0, m2: 0, m3: 0 }),
  evaluate: (i, s) => {
    const w = s[`m${i.A1 * 2 + i.A0}`];
    return { D3: (w >> 3) & 1, D2: (w >> 2) & 1, D1: (w >> 1) & 1, D0: w & 1 };
  },
  onClock: (i, s) => {
    if (!i.WE) return s;
    const addr = i.A1 * 2 + i.A0;
    return { ...s, [`m${addr}`]: (i.I3 << 3) | (i.I2 << 2) | (i.I1 << 1) | i.I0 };
  },
  stateLabels: ["m0", "m1", "m2", "m3"],
  tableTitle: "4×4 RAM – Function Table",
  table: [
    { inputs: { WE: 0, CLK: "X" }, outputs: { "D3..D0": "M[A]" }, note: "Read (asynchronous)" },
    { inputs: { WE: 1, CLK: "↑" }, outputs: { "M[A]": "I3..I0" }, note: "Write on clock edge" },
  ],
});

/* ───────────── Special ───────────── */
reg({
  id: "shift-register",
  inputs: ["SI"],
  outputs: ["Q3", "Q2", "Q1", "Q0"],
  clocked: true,
  initState: () => ({ Q3: 0, Q2: 0, Q1: 0, Q0: 0 }),
  evaluate: (_i, s) => ({ Q3: s.Q3, Q2: s.Q2, Q1: s.Q1, Q0: s.Q0 }),
  onClock: (i, s) => ({ Q3: i.SI, Q2: s.Q3, Q1: s.Q2, Q0: s.Q1 }),
  tableTitle: "4-bit SIPO Shift Register",
  table: [
    { inputs: { SI: "d", CLK: "↑" }, outputs: { Q3: "d", Q2: "Q3", Q1: "Q2", Q0: "Q1" }, note: "Right shift each clock" },
  ],
});
reg({
  id: "ring-counter",
  inputs: [],
  outputs: ["Q3", "Q2", "Q1", "Q0"],
  clocked: true,
  initState: () => ({ Q3: 1, Q2: 0, Q1: 0, Q0: 0 }),
  evaluate: (_i, s) => ({ Q3: s.Q3, Q2: s.Q2, Q1: s.Q1, Q0: s.Q0 }),
  onClock: (_i, s) => ({ Q3: s.Q0, Q2: s.Q3, Q1: s.Q2, Q0: s.Q1 }),
  tableTitle: "4-bit Ring Counter – State Sequence",
  table: [
    { inputs: { Clock: 0 }, outputs: { Q3: 1, Q2: 0, Q1: 0, Q0: 0 } },
    { inputs: { Clock: 1 }, outputs: { Q3: 0, Q2: 1, Q1: 0, Q0: 0 } },
    { inputs: { Clock: 2 }, outputs: { Q3: 0, Q2: 0, Q1: 1, Q0: 0 } },
    { inputs: { Clock: 3 }, outputs: { Q3: 0, Q2: 0, Q1: 0, Q0: 1 } },
  ],
});
reg({
  id: "johnson-counter",
  inputs: [],
  outputs: ["Q3", "Q2", "Q1", "Q0"],
  clocked: true,
  initState: () => ({ Q3: 0, Q2: 0, Q1: 0, Q0: 0 }),
  evaluate: (_i, s) => ({ Q3: s.Q3, Q2: s.Q2, Q1: s.Q1, Q0: s.Q0 }),
  onClock: (_i, s) => ({ Q3: s.Q0 ^ 1, Q2: s.Q3, Q1: s.Q2, Q0: s.Q1 }),
  tableTitle: "4-bit Johnson Counter – State Sequence",
  table: [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 1],
    [0, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
  ].map((r, k) => ({ inputs: { Clock: k }, outputs: { Q3: r[0], Q2: r[1], Q1: r[2], Q0: r[3] } })),
});
reg(
  comb("parity-generator", ["D2", "D1", "D0"], ["P_EVEN", "P_ODD"], (i) => {
    const x = i.D2 ^ i.D1 ^ i.D0;
    return { P_EVEN: x, P_ODD: x ^ 1 };
  })
);
reg(
  comb("parity-checker", ["D2", "D1", "D0", "P"], ["ERROR"], (i) => ({
    ERROR: i.D2 ^ i.D1 ^ i.D0 ^ i.P,
  }))
);

/* ───────────── Helpers ───────────── */
export function makeInitialInputs(c: CircuitBuild): Bits {
  const o: Bits = {};
  c.inputs.forEach((k) => (o[k] = 0));
  return o;
}

export function getTable(c: CircuitBuild): TruthRow[] {
  if (c.table) return c.table;
  const n = c.inputs.length;
  const rows: TruthRow[] = [];
  for (let v = 0; v < 1 << n; v++) {
    const inp: Bits = {};
    c.inputs.forEach((k, idx) => (inp[k] = (v >> (n - 1 - idx)) & 1));
    const out = c.evaluate(inp, c.initState ? c.initState() : {});
    rows.push({ inputs: inp, outputs: out });
  }
  return rows;
}

/** Does a table row match the current live inputs? ("X" = don't care) */
export function rowMatches(row: TruthRow, live: Bits, liveOutputs?: Bits): boolean {
  let matched = false;
  for (const [k, v] of Object.entries(row.inputs)) {
    if (!(k in live)) continue;
    matched = true;
    if (typeof v === "number" && v !== live[k]) return false;
  }
  if (matched || !liveOutputs) return matched;
  // No live input columns (e.g. clock-only counters): match on the current output state instead
  let outMatched = false;
  for (const [k, v] of Object.entries(row.outputs)) {
    if (!(k in liveOutputs) || typeof v !== "number") continue;
    outMatched = true;
    if (v !== liveOutputs[k]) return false;
  }
  return outMatched;
}
