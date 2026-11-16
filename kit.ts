/**
 * kit.ts – Component Library catalogue (metadata, theory, learning content).
 * The `build` field links a component to its simulation model in builds.ts.
 * Components without a build are "pending" (theory only).
 */
import { builds } from "./builds";

export type CategoryId = "gates" | "combinational" | "sequential" | "memory" | "special";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  blurb: string;
}

export const categories: Category[] = [
  { id: "gates", name: "Logic Gates", icon: "⊕", blurb: "Fundamental building blocks of all digital systems" },
  { id: "combinational", name: "Combinational Circuits", icon: "⊞", blurb: "Outputs depend only on present inputs" },
  { id: "sequential", name: "Sequential Circuits", icon: "⟳", blurb: "Circuits with memory and clocked behaviour" },
  { id: "memory", name: "Memory Circuits", icon: "▦", blurb: "Storage elements: RAM, ROM and variants" },
  { id: "special", name: "Special Circuits", icon: "✦", blurb: "Shift registers, ring/Johnson counters, parity" },
];

export interface Part {
  name: string;
  fn: string;
  qty?: number;
}

export interface Component {
  id: string;
  name: string;
  category: CategoryId;
  tags: string[];
  description: string;
  build?: string; // id in builds.ts
  symbol: "and" | "or" | "not" | "nand" | "nor" | "xor" | "xnor" | "block";
  definition: string;
  principle: string;
  expressions: string[];
  applications: string[];
  parts: Part[];
  objectives: string[];
  examples: string[];
  notes: string[];
}

const C = (c: Component) => c;

export const components: Component[] = [
  /* ───── Logic Gates ───── */
  C({
    id: "and-gate", name: "AND Gate", category: "gates", tags: ["basic", "conjunction"], symbol: "and", build: "and",
    description: "Output is HIGH only when all inputs are HIGH.",
    definition: "The AND gate is a basic digital logic gate implementing logical conjunction. It produces a HIGH (1) output only when every input is HIGH.",
    principle: "Conceptually two switches in series: current flows to the load only when both switches are closed. In CMOS, series NMOS transistors pull the output low only when both gates are driven high (through an inverting NAND stage).",
    expressions: ["Y = A · B", "Y = AB"],
    applications: ["Enable / gating signals", "Address decoding", "Building multipliers", "Safety interlocks (all conditions must be true)"],
    parts: [{ name: "Input terminals A, B", fn: "Accept the two binary input signals" }, { name: "AND logic core (7408 IC)", fn: "Performs the conjunction operation" }, { name: "Output terminal Y", fn: "Drives the output LED" }],
    objectives: ["Identify the AND symbol and truth table", "Express AND as a Boolean product", "Use AND for enabling signals"],
    examples: ["A car starts only if key is turned AND brake is pressed", "A door alarm triggers when armed AND door is open"],
    notes: ["Any 0 input forces output 0", "Multi-input AND gates extend the same rule"],
  }),
  C({
    id: "or-gate", name: "OR Gate", category: "gates", tags: ["basic", "disjunction"], symbol: "or", build: "or",
    description: "Output is HIGH when at least one input is HIGH.",
    definition: "The OR gate implements logical disjunction: its output is HIGH if any one or more of its inputs is HIGH.",
    principle: "Equivalent to switches in parallel – closing either switch completes the circuit. In CMOS it is built as NOR followed by an inverter.",
    expressions: ["Y = A + B"],
    applications: ["Combining interrupt requests", "Alarm systems with multiple sensors", "Set-signal generation in control units"],
    parts: [{ name: "Input terminals A, B", fn: "Binary input signals" }, { name: "OR logic core (7432 IC)", fn: "Performs disjunction" }, { name: "Output terminal Y", fn: "Drives output indicator" }],
    objectives: ["Recognise OR symbol and table", "Use Boolean sum notation", "Differentiate OR from XOR"],
    examples: ["Room light turns on from either of two wall switches wired in parallel", "A notification fires if email OR SMS arrives"],
    notes: ["Output 0 only when all inputs are 0", "Inclusive OR – both HIGH also gives HIGH"],
  }),
  C({
    id: "not-gate", name: "NOT Gate", category: "gates", tags: ["basic", "inverter"], symbol: "not", build: "not",
    description: "Inverts the input: 1 becomes 0 and 0 becomes 1.",
    definition: "The NOT gate (inverter) is a single-input gate that outputs the logical complement of its input.",
    principle: "A CMOS inverter uses one PMOS and one NMOS transistor. A HIGH input turns on the NMOS pulling the output LOW; a LOW input turns on the PMOS pulling the output HIGH.",
    expressions: ["Y = A'", "Y = ¬A"],
    applications: ["Signal complementing", "Oscillators (ring oscillator)", "Buffering/restoring logic levels", "Generating active-low controls"],
    parts: [{ name: "Input terminal A", fn: "Signal to invert" }, { name: "Inverter core (7404 IC)", fn: "Complements the signal" }, { name: "Output terminal Y", fn: "Inverted output" }],
    objectives: ["Understand complement operation", "Recognise the bubble notation", "Combine NOT with AND/OR for universal logic"],
    examples: ["Converting active-high to active-low enable", "Two inverters in series form a buffer"],
    notes: ["Only gate with one input", "Double inversion returns the original signal"],
  }),
  C({
    id: "nand-gate", name: "NAND Gate", category: "gates", tags: ["universal"], symbol: "nand", build: "nand",
    description: "AND followed by NOT – LOW only when all inputs are HIGH.",
    definition: "NAND (NOT-AND) outputs LOW only when all inputs are HIGH. It is a universal gate: any Boolean function can be built using only NAND gates.",
    principle: "Series NMOS transistors to ground with parallel PMOS to VDD. Output goes LOW only when both inputs are HIGH.",
    expressions: ["Y = (A · B)'", "Y = A' + B'  (De Morgan)"],
    applications: ["Universal gate for implementing any logic", "SR latches", "Flash memory cells (NAND flash)", "Oscillators and timers"],
    parts: [{ name: "Input terminals A, B", fn: "Binary inputs" }, { name: "NAND core (7400 IC)", fn: "AND + inversion" }, { name: "Output terminal Y", fn: "Inverted AND output" }],
    objectives: ["Prove NAND universality", "Apply De Morgan's theorem", "Build NOT, AND, OR from NAND"],
    examples: ["Tie both inputs together → NOT gate", "Two NAND gates cross-coupled → SR latch"],
    notes: ["Fastest and cheapest gate in CMOS", "Default choice in IC design"],
  }),
  C({
    id: "nor-gate", name: "NOR Gate", category: "gates", tags: ["universal"], symbol: "nor", build: "nor",
    description: "OR followed by NOT – HIGH only when all inputs are LOW.",
    definition: "NOR (NOT-OR) outputs HIGH only when all inputs are LOW. Like NAND, it is a universal gate.",
    principle: "Parallel NMOS to ground, series PMOS to VDD. Any HIGH input pulls the output LOW.",
    expressions: ["Y = (A + B)'", "Y = A' · B'  (De Morgan)"],
    applications: ["Universal gate", "NOR-based SR latches", "Apollo Guidance Computer was built entirely from NOR gates", "NOR flash memory"],
    parts: [{ name: "Input terminals A, B", fn: "Binary inputs" }, { name: "NOR core (7402 IC)", fn: "OR + inversion" }, { name: "Output terminal Y", fn: "Inverted OR output" }],
    objectives: ["Prove NOR universality", "Compare NAND vs NOR implementations"],
    examples: ["Two NOR gates cross-coupled form an SR latch", "Tie inputs together → inverter"],
    notes: ["Output 1 only for all-zero input", "Slower than NAND in CMOS due to series PMOS"],
  }),
  C({
    id: "xor-gate", name: "XOR Gate", category: "gates", tags: ["exclusive", "arithmetic"], symbol: "xor", build: "xor",
    description: "HIGH when inputs are different.",
    definition: "The Exclusive-OR gate outputs HIGH when an odd number of inputs are HIGH – for two inputs, when they differ.",
    principle: "Implemented as A·B' + A'·B using AND/OR/NOT, or with four NAND gates. Acts as a controlled inverter: when B=1 the output is A', when B=0 the output is A.",
    expressions: ["Y = A ⊕ B", "Y = A'B + AB'"],
    applications: ["Binary addition (sum bit)", "Parity generation & checking", "Comparators", "Cryptography (one-time pad)", "Controlled inverter"],
    parts: [{ name: "Input terminals A, B", fn: "Binary inputs" }, { name: "XOR core (7486 IC)", fn: "Exclusive-OR operation" }, { name: "Output terminal Y", fn: "Difference indicator" }],
    objectives: ["Understand odd-parity behaviour", "Use XOR for addition and comparison"],
    examples: ["Sum bit of a half adder", "Toggling a bit: X ⊕ 1 = X'"],
    notes: ["A ⊕ A = 0, A ⊕ 0 = A", "Associative and commutative"],
  }),
  C({
    id: "xnor-gate", name: "XNOR Gate", category: "gates", tags: ["equivalence"], symbol: "xnor", build: "xnor",
    description: "HIGH when inputs are equal (equivalence gate).",
    definition: "The Exclusive-NOR gate is the complement of XOR; its output is HIGH when both inputs are equal.",
    principle: "XOR followed by an inverter. Detects equality between two bits, making it the core of digital comparators.",
    expressions: ["Y = (A ⊕ B)'", "Y = AB + A'B'"],
    applications: ["Equality comparators", "Error detection", "Phase detectors"],
    parts: [{ name: "Input terminals A, B", fn: "Binary inputs" }, { name: "XNOR core (74266 IC)", fn: "Equivalence operation" }, { name: "Output terminal Y", fn: "Equality indicator" }],
    objectives: ["Relate XNOR to equality", "Build a 1-bit comparator"],
    examples: ["Bitwise equality check of two words uses XNOR per bit + AND"],
    notes: ["Also called the equivalence gate", "Even-parity detector for 2 inputs"],
  }),

  /* ───── Combinational ───── */
  C({
    id: "half-adder", name: "Half Adder", category: "combinational", tags: ["arithmetic", "adder"], symbol: "block", build: "half-adder",
    description: "Adds two single bits producing Sum and Carry.",
    definition: "A half adder adds two 1-bit numbers and produces a Sum bit and a Carry-out bit. It has no provision for a carry-in.",
    principle: "The Sum is the XOR of the inputs (1 when exactly one input is 1) and the Carry is the AND (1 only when both are 1).",
    expressions: ["SUM = A ⊕ B", "CARRY = A · B"],
    applications: ["Least-significant stage of ripple adders", "Incrementers", "Building block of full adders"],
    parts: [{ name: "XOR gate", fn: "Generates the SUM bit" }, { name: "AND gate", fn: "Generates the CARRY bit" }],
    objectives: ["Derive half adder from the binary addition table", "Identify its limitation (no carry-in)"],
    examples: ["1 + 1 = 10₂ → SUM 0, CARRY 1"],
    notes: ["Cannot cascade directly for multi-bit addition"],
  }),
  C({
    id: "full-adder", name: "Full Adder", category: "combinational", tags: ["arithmetic", "adder"], symbol: "block", build: "full-adder",
    description: "Adds three bits (A, B, Cin) producing Sum and Cout.",
    definition: "A full adder adds two bits plus an incoming carry, producing Sum and Carry-out. It can be cascaded to add multi-bit numbers.",
    principle: "Built from two half adders and an OR gate: the first adds A and B, the second adds the result to Cin; carries are ORed.",
    expressions: ["SUM = A ⊕ B ⊕ Cin", "COUT = AB + Cin(A ⊕ B)"],
    applications: ["Ripple-carry and carry-lookahead adders", "ALUs", "Multipliers", "Address calculation"],
    parts: [{ name: "Half adder", fn: "Adds A and B", qty: 2 }, { name: "OR gate", fn: "Combines the two carry outputs" }],
    objectives: ["Build a full adder from half adders", "Cascade adders into an n-bit adder"],
    examples: ["1 + 1 + 1 = 11₂ → SUM 1, COUT 1"],
    notes: ["Sum is odd-parity of the three inputs", "Carry is the majority function"],
  }),
  C({
    id: "half-subtractor", name: "Half Subtractor", category: "combinational", tags: ["arithmetic", "subtractor"], symbol: "block", build: "half-subtractor",
    description: "Subtracts B from A producing Difference and Borrow.",
    definition: "A half subtractor computes A − B for single bits, outputting Difference and Borrow.",
    principle: "Difference is XOR of inputs; Borrow is generated when A=0 and B=1 (A'·B).",
    expressions: ["DIFF = A ⊕ B", "BORROW = A' · B"],
    applications: ["LSB stage of subtractors", "Decrementers"],
    parts: [{ name: "XOR gate", fn: "Difference bit" }, { name: "NOT gate", fn: "Complements A" }, { name: "AND gate", fn: "Borrow bit" }],
    objectives: ["Compare with half adder", "Understand borrow generation"],
    examples: ["0 − 1 → DIFF 1 with BORROW 1"],
    notes: ["Same XOR as half adder; only the carry/borrow logic differs"],
  }),
  C({
    id: "full-subtractor", name: "Full Subtractor", category: "combinational", tags: ["arithmetic", "subtractor"], symbol: "block", build: "full-subtractor",
    description: "Subtracts with borrow-in: A − B − Bin.",
    definition: "A full subtractor subtracts two bits and a borrow-in, producing Difference and Borrow-out.",
    principle: "Two half subtractors cascaded with an OR gate combining the borrows.",
    expressions: ["DIFF = A ⊕ B ⊕ Bin", "BOUT = A'B + (A ⊕ B)'·Bin"],
    applications: ["Multi-bit subtractors", "ALU subtract operation", "Comparators"],
    parts: [{ name: "Half subtractor", fn: "Stage-wise subtraction", qty: 2 }, { name: "OR gate", fn: "Combine borrow outputs" }],
    objectives: ["Cascade subtractors", "Relate subtraction to 2's complement addition"],
    examples: ["0 − 1 − 1 → DIFF 0, BOUT 1"],
    notes: ["In practice subtraction uses adders with 2's complement"],
  }),
  C({
    id: "multiplexer", name: "Multiplexer (4:1)", category: "combinational", tags: ["mux", "data selector"], symbol: "block", build: "multiplexer",
    description: "Selects one of four data inputs using two select lines.",
    definition: "A multiplexer (MUX) routes one of 2ⁿ input lines to a single output based on n select lines.",
    principle: "Each input is ANDed with a unique minterm of the select lines; the AND outputs are ORed together so only the selected input passes.",
    expressions: ["Y = S1'S0'I0 + S1'S0 I1 + S1 S0'I2 + S1 S0 I3"],
    applications: ["Data routing and bus sharing", "Function generators (implement any logic function)", "Parallel-to-serial conversion", "Communication systems (TDM)"],
    parts: [{ name: "NOT gate", fn: "Complement select lines", qty: 2 }, { name: "3-input AND gate", fn: "Decode each select combination", qty: 4 }, { name: "4-input OR gate", fn: "Merge selected data" }],
    objectives: ["Explain selection using minterms", "Implement a Boolean function with a MUX"],
    examples: ["Selecting between four sensors with a 2-bit channel code"],
    notes: ["A 2ⁿ:1 MUX needs n select lines", "Known as a data selector"],
  }),
  C({
    id: "demultiplexer", name: "Demultiplexer (1:4)", category: "combinational", tags: ["demux", "data distributor"], symbol: "block", build: "demultiplexer",
    description: "Routes one data input to one of four outputs.",
    definition: "A demultiplexer performs the reverse of a MUX: a single input is steered to one of 2ⁿ outputs chosen by n select lines.",
    principle: "The data input is ANDed with each minterm of the select lines; only the selected output follows the data.",
    expressions: ["Y0 = D·S1'S0'", "Y1 = D·S1'S0", "Y2 = D·S1 S0'", "Y3 = D·S1 S0"],
    applications: ["Serial-to-parallel conversion", "Memory chip selection", "Distributing a clock/data to multiple destinations"],
    parts: [{ name: "NOT gate", fn: "Complement select lines", qty: 2 }, { name: "3-input AND gate", fn: "One per output", qty: 4 }],
    objectives: ["Contrast MUX and DEMUX", "Use DEMUX as a decoder with enable"],
    examples: ["Routing a serial data stream to four display segments"],
    notes: ["A DEMUX with D=1 behaves as a decoder"],
  }),
  C({
    id: "encoder", name: "Encoder (4-to-2 Priority)", category: "combinational", tags: ["priority", "code converter"], symbol: "block", build: "encoder",
    description: "Converts the highest active input line to a binary code.",
    definition: "An encoder converts 2ⁿ input lines into an n-bit binary code. A priority encoder resolves multiple active inputs by encoding the highest-priority one and provides a Valid flag.",
    principle: "Priority logic masks lower inputs when a higher one is active; OR gates generate each output code bit.",
    expressions: ["A1 = D3 + D2", "A0 = D3 + D1·D2'", "V = D3 + D2 + D1 + D0"],
    applications: ["Keyboard scanning", "Interrupt priority controllers", "Position encoders"],
    parts: [{ name: "OR gate", fn: "Form output code bits", qty: 3 }, { name: "AND / NOT gates", fn: "Priority masking" }],
    objectives: ["Explain the need for priority", "Read a function table with don't-cares"],
    examples: ["Four interrupt lines → 2-bit vector of highest priority request"],
    notes: ["Simple encoders misbehave when multiple inputs are active – priority fixes this"],
  }),
  C({
    id: "decoder", name: "Decoder (2-to-4)", category: "combinational", tags: ["address", "minterm"], symbol: "block", build: "decoder",
    description: "Activates one of four outputs for each 2-bit input code.",
    definition: "A decoder converts an n-bit binary code into 2ⁿ unique output lines, exactly one of which is active. An Enable input gates all outputs.",
    principle: "Each output is a 3-input AND of the enable and a unique minterm of the address lines.",
    expressions: ["Y0 = EN·A1'A0'", "Y1 = EN·A1'A0", "Y2 = EN·A1 A0'", "Y3 = EN·A1 A0"],
    applications: ["Memory address decoding", "Seven-segment drivers (BCD decoder)", "Instruction decoding in CPUs", "Minterm generation"],
    parts: [{ name: "NOT gate", fn: "Complement address lines", qty: 2 }, { name: "3-input AND gate", fn: "One per output line", qty: 4 }],
    objectives: ["Relate decoder outputs to minterms", "Use enable to cascade decoders"],
    examples: ["Selecting one of four memory chips from two address bits"],
    notes: ["Outputs are often active-low in real ICs (74139)"],
  }),
  C({
    id: "comparator", name: "Comparator (2-bit)", category: "combinational", tags: ["magnitude", "compare"], symbol: "block", build: "comparator",
    description: "Compares two 2-bit numbers: A>B, A=B, A<B.",
    definition: "A magnitude comparator compares two binary numbers and indicates whether the first is greater than, equal to, or less than the second.",
    principle: "Equality uses XNOR per bit ANDed together. Greater-than is found by checking the MSB first, then lower bits when the higher bits are equal.",
    expressions: ["A=B = (A1⊙B1)(A0⊙B0)", "A>B = A1B1' + (A1⊙B1)A0B0'", "A<B = A1'B1 + (A1⊙B1)A0'B0"],
    applications: ["Conditional branching in CPUs", "Threshold detection", "Sorting networks"],
    parts: [{ name: "XNOR gate", fn: "Bitwise equality", qty: 2 }, { name: "AND / OR gates", fn: "Magnitude logic" }, { name: "NOT gate", fn: "Complements for inequality terms" }],
    objectives: ["Design an n-bit comparator", "Understand cascading of 7485 comparators"],
    examples: ["A=10₂, B=01₂ → A>B"],
    notes: ["Exactly one output is HIGH at a time"],
  }),

  /* ───── Sequential ───── */
  C({
    id: "sr-flip-flop", name: "SR Flip-Flop", category: "sequential", tags: ["latch", "set reset"], symbol: "block", build: "sr-flip-flop",
    description: "Set–Reset flip-flop with hold and forbidden states.",
    definition: "The SR flip-flop stores one bit. S sets Q to 1, R resets it to 0, and S=R=0 holds the state. S=R=1 is forbidden.",
    principle: "Two cross-coupled NAND (or NOR) gates form a bistable latch; a clock input gates S and R so the state changes only on the active clock edge.",
    expressions: ["Q(n+1) = S + R'Q(n)", "Constraint: S·R = 0"],
    applications: ["Switch debouncing", "Basic memory cells", "Control flags"],
    parts: [{ name: "NAND gate", fn: "Cross-coupled latch + clock gating", qty: 4 }, { name: "Clock input", fn: "Synchronises state change" }],
    objectives: ["Explain bistability", "Identify the forbidden input condition"],
    examples: ["Push S then pulse CLK → Q=1 stays until R is pulsed"],
    notes: ["The simulator holds state for the invalid S=R=1 case", "JK flip-flop removes the forbidden state"],
  }),
  C({
    id: "jk-flip-flop", name: "JK Flip-Flop", category: "sequential", tags: ["toggle", "universal flip-flop"], symbol: "block", build: "jk-flip-flop",
    description: "Universal flip-flop: hold, set, reset and toggle.",
    definition: "The JK flip-flop refines the SR flip-flop by defining J=K=1 as toggle, eliminating the invalid state.",
    principle: "Outputs Q and Q' are fed back to the input gating so that with J=K=1 the flip-flop complements on every clock edge.",
    expressions: ["Q(n+1) = JQ' + K'Q"],
    applications: ["Counters", "Frequency dividers", "Shift registers", "Can emulate D and T flip-flops"],
    parts: [{ name: "NAND gate", fn: "3-input gating and latch", qty: 4 }, { name: "Feedback paths", fn: "Route Q and Q' back to the inputs" }],
    objectives: ["Derive the JK characteristic equation", "Explain race-around and master-slave solution"],
    examples: ["J=K=1 → output toggles each clock → divide-by-2"],
    notes: ["Edge triggering avoids race-around", "Most versatile flip-flop"],
  }),
  C({
    id: "d-flip-flop", name: "D Flip-Flop", category: "sequential", tags: ["data", "delay"], symbol: "block", build: "d-flip-flop",
    description: "Captures the D input on each clock edge.",
    definition: "The D (data/delay) flip-flop transfers the value on D to Q at the active clock edge and holds it until the next edge.",
    principle: "An SR flip-flop with R = S' guarantees S≠R, so the output simply follows D at the clock edge.",
    expressions: ["Q(n+1) = D"],
    applications: ["Registers and pipelines", "Synchronisers", "Sample-and-hold of digital data"],
    parts: [{ name: "NOT gate", fn: "Derives R from D" }, { name: "Clocked SR latch", fn: "Stores the bit" }],
    objectives: ["Understand edge-triggered storage", "Use D flip-flops to build registers"],
    examples: ["Set D=1, pulse CLK → Q=1; changing D later has no effect until next pulse"],
    notes: ["Most common flip-flop in FPGA/ASIC design", "Setup and hold times must be respected"],
  }),
  C({
    id: "t-flip-flop", name: "T Flip-Flop", category: "sequential", tags: ["toggle", "divider"], symbol: "block", build: "t-flip-flop",
    description: "Toggles output on every clock when T=1.",
    definition: "The T (toggle) flip-flop complements its output on each clock edge when T=1 and holds when T=0.",
    principle: "A JK flip-flop with J and K tied together. The toggling behaviour divides the clock frequency by two.",
    expressions: ["Q(n+1) = T ⊕ Q(n)"],
    applications: ["Binary counters", "Frequency division", "Clock prescalers"],
    parts: [{ name: "JK flip-flop", fn: "J=K=T configuration" }],
    objectives: ["Relate toggling to frequency division", "Chain T flip-flops into a ripple counter"],
    examples: ["T=1: Q sequence 0,1,0,1… at half the clock rate"],
    notes: ["Not available as a stand-alone IC; derived from JK or D"],
  }),
  C({
    id: "register", name: "Register (4-bit)", category: "sequential", tags: ["storage", "parallel load"], symbol: "block", build: "register",
    description: "Stores a 4-bit word with parallel load control.",
    definition: "A register is a group of flip-flops sharing a common clock, used to store multi-bit data. The LOAD line controls when new data is captured.",
    principle: "Each bit is a D flip-flop. A 2:1 MUX in front of each D selects between the current Q (hold) and the new data (load).",
    expressions: ["Qi(n+1) = LOAD·Di + LOAD'·Qi(n)"],
    applications: ["CPU general-purpose registers", "I/O latches", "Pipeline stages"],
    parts: [{ name: "D flip-flop", fn: "Store one bit each", qty: 4 }, { name: "2:1 MUX", fn: "Hold / load selection", qty: 4 }, { name: "Common clock line", fn: "Synchronous update" }],
    objectives: ["Build a register from flip-flops", "Explain synchronous load"],
    examples: ["Set D=1011, LOAD=1, pulse CLK → Q=1011; clear LOAD and the value is retained"],
    notes: ["Width equals number of flip-flops"],
  }),
  C({
    id: "counter", name: "Counter (4-bit Up/Down)", category: "sequential", tags: ["binary counter", "synchronous"], symbol: "block", build: "counter",
    description: "Synchronous 4-bit counter with enable and direction.",
    definition: "A counter is a sequential circuit that cycles through a predetermined sequence of states on each clock pulse. This 4-bit binary counter counts 0–15 up or down.",
    principle: "T flip-flops toggle when all lower bits are 1 (up) or 0 (down). Synchronous design clocks all stages simultaneously.",
    expressions: ["T0 = EN", "T1 = EN·(UP?Q0:Q0')", "T2 = EN·(UP?Q0Q1:Q0'Q1')", "T3 = EN·(UP?Q0Q1Q2:Q0'Q1'Q2')"],
    applications: ["Event counting", "Timers and clocks", "Program counters", "Frequency measurement"],
    parts: [{ name: "T flip-flop", fn: "One per bit", qty: 4 }, { name: "AND gates", fn: "Toggle enable chain" }, { name: "Direction MUX", fn: "Select up/down logic" }],
    objectives: ["Differentiate ripple and synchronous counters", "Design mod-N counters"],
    examples: ["EN=1, UP=1: 0000→0001→…→1111→0000"],
    notes: ["Wraps around modulo 16"],
  }),

  /* ───── Memory ───── */
  C({
    id: "ram", name: "RAM (4×4)", category: "memory", tags: ["random access", "read write"], symbol: "block", build: "ram",
    description: "Read/write memory with 4 words of 4 bits.",
    definition: "Random Access Memory stores data that can be both read and written at any address in constant time. Data is volatile – lost when power is removed.",
    principle: "An address decoder selects one word line. On a write (WE=1, clock edge) the data inputs are latched into the selected word; otherwise the selected word drives the outputs.",
    expressions: ["Read: D = M[A]", "Write: M[A] ← I  when WE=1 at CLK↑"],
    applications: ["Main computer memory", "Caches", "Buffers and FIFOs"],
    parts: [{ name: "2-to-4 decoder", fn: "Selects word by address" }, { name: "4-bit register", fn: "One per word", qty: 4 }, { name: "4:1 MUX (×4)", fn: "Read-out path" }],
    objectives: ["Understand address, data and control lines", "Perform a write-then-read cycle"],
    examples: ["Set A=01, I=1100, WE=1, pulse CLK; then set WE=0 and read back 1100"],
    notes: ["Contents are cleared on Reset", "Real RAM uses bidirectional data buses"],
  }),
  C({
    id: "rom", name: "ROM (4×4)", category: "memory", tags: ["read only", "lookup"], symbol: "block", build: "rom",
    description: "Read-only memory with fixed 4-word contents.",
    definition: "Read-Only Memory holds data permanently programmed during manufacture or by a programmer. It is non-volatile and can only be read.",
    principle: "The address decoder activates one word line; diodes/transistors at the crosspoints of the word line and bit lines define stored 1s and 0s.",
    expressions: ["D = ROM[A]", "Contents: 00→1010, 01→0110, 10→1111, 11→0001"],
    applications: ["Boot firmware (BIOS)", "Lookup tables", "Character generators", "Microcode storage"],
    parts: [{ name: "2-to-4 decoder", fn: "Word selection" }, { name: "Diode matrix", fn: "Permanently stored bits" }, { name: "Output buffers", fn: "Drive data lines" }],
    objectives: ["Treat ROM as a combinational truth table", "Implement logic functions using ROM"],
    examples: ["Address 10 → outputs 1111"],
    notes: ["Any combinational function can be stored in a ROM"],
  }),
  C({
    id: "sram", name: "SRAM", category: "memory", tags: ["static", "cache"], symbol: "block",
    description: "Static RAM cell built from cross-coupled inverters.",
    definition: "Static RAM stores each bit in a bistable latch of six transistors. It retains data as long as power is supplied without needing refresh.",
    principle: "Two cross-coupled inverters hold the bit; two access transistors connect the cell to complementary bit lines when the word line is asserted.",
    expressions: ["6T cell: 2 PMOS + 4 NMOS", "Access time ≈ 1–10 ns"],
    applications: ["CPU caches (L1/L2/L3)", "Register files", "Fast buffers"],
    parts: [{ name: "Cross-coupled inverters", fn: "Store the bit", qty: 2 }, { name: "Access transistors", fn: "Connect to bit lines", qty: 2 }, { name: "Sense amplifier", fn: "Detect small bit-line differences" }],
    objectives: ["Compare SRAM and DRAM", "Explain cell read/write stability"],
    examples: ["A 32 KB L1 cache contains ~262 144 six-transistor cells"],
    notes: ["Transistor-level cell simulation is pending – see RAM (4×4) for a working read/write model"],
  }),
  C({
    id: "dram", name: "DRAM", category: "memory", tags: ["dynamic", "capacitor"], symbol: "block",
    description: "Dynamic RAM cell using a single transistor and capacitor.",
    definition: "Dynamic RAM stores each bit as charge on a capacitor accessed through one transistor. Charge leaks away, so cells must be periodically refreshed.",
    principle: "Asserting the word line connects the capacitor to the bit line. Reading destroys the stored charge, so the sense amplifier rewrites the value.",
    expressions: ["1T1C cell", "Refresh interval ≈ 64 ms"],
    applications: ["Main system memory (DDR4/DDR5)", "Graphics memory (GDDR)", "Embedded frame buffers"],
    parts: [{ name: "Access transistor", fn: "Switch between capacitor and bit line" }, { name: "Storage capacitor", fn: "Holds the bit as charge" }, { name: "Refresh controller", fn: "Periodically rewrites all rows" }],
    objectives: ["Explain the need for refresh", "Compare density and speed with SRAM"],
    examples: ["A 16 GB DIMM contains ~137 billion 1T1C cells"],
    notes: ["Charge-level/refresh simulation is pending – see RAM (4×4) for a working digital model"],
  }),

  /* ───── Special ───── */
  C({
    id: "shift-register", name: "Shift Register (SIPO)", category: "special", tags: ["serial", "shift"], symbol: "block", build: "shift-register",
    description: "Serial-in, parallel-out 4-bit shift register.",
    definition: "A shift register moves data one position per clock. In SIPO mode bits enter serially on SI and appear in parallel on Q3..Q0.",
    principle: "D flip-flops in a chain: each stage's D input is the previous stage's Q. New data enters the first stage on each clock edge.",
    expressions: ["Q3(n+1) = SI", "Qi(n+1) = Qi+1(n)"],
    applications: ["Serial-to-parallel conversion (UART, SPI)", "Delay lines", "LED drivers (74HC595)"],
    parts: [{ name: "D flip-flop", fn: "One per stage", qty: 4 }, { name: "Common clock", fn: "Shift control" }],
    objectives: ["Load a 4-bit word serially", "Explain shift register modes (SISO, SIPO, PISO, PIPO)"],
    examples: ["Clock in 1,0,1,1 on SI → Q3Q2Q1Q0 = 1101 after 4 clocks"],
    notes: ["Takes n clocks to fill n stages"],
  }),
  C({
    id: "ring-counter", name: "Ring Counter", category: "special", tags: ["one-hot", "sequencer"], symbol: "block", build: "ring-counter",
    description: "Circulates a single 1 through four flip-flops.",
    definition: "A ring counter is a shift register whose last output feeds back to the first input. One hot bit rotates around the ring, giving n states for n flip-flops.",
    principle: "Initialised to 1000, each clock shifts the 1 one position right; Q0 wraps around to Q3.",
    expressions: ["Q3(n+1) = Q0(n)", "Qi(n+1) = Qi+1(n)", "States = n"],
    applications: ["Sequencers and timing generators", "Stepper-motor phase drives", "One-hot state machines"],
    parts: [{ name: "D flip-flop", fn: "One per stage", qty: 4 }, { name: "Feedback wire", fn: "Q0 → D of first stage" }, { name: "Preset logic", fn: "Load initial 1000 pattern" }],
    objectives: ["Explain one-hot encoding", "Compare with binary counter efficiency"],
    examples: ["1000 → 0100 → 0010 → 0001 → 1000"],
    notes: ["Requires presetting a 1; no decoding gates needed"],
  }),
  C({
    id: "johnson-counter", name: "Johnson Counter", category: "special", tags: ["twisted ring", "sequencer"], symbol: "block", build: "johnson-counter",
    description: "Twisted-ring counter with 2n states.",
    definition: "A Johnson (twisted-ring) counter feeds the complement of the last stage back into the first, producing 2n states from n flip-flops.",
    principle: "Starting from 0000, 1s fill in from the left, then 0s fill in: 0000→1000→1100→1110→1111→0111→0011→0001→0000.",
    expressions: ["Q3(n+1) = Q0(n)'", "Qi(n+1) = Qi+1(n)", "States = 2n"],
    applications: ["Quadrature / multiphase clock generation", "Decade counters (CD4017)", "Glitch-free sequencing"],
    parts: [{ name: "D flip-flop", fn: "One per stage", qty: 4 }, { name: "NOT gate", fn: "Inverts Q0 for feedback" }],
    objectives: ["Derive the 2n-state sequence", "Decode states with 2-input AND gates"],
    examples: ["Four flip-flops produce an 8-state sequence"],
    notes: ["Self-starting from all zeros", "Adjacent states differ by one bit"],
  }),
  C({
    id: "parity-generator", name: "Parity Generator", category: "special", tags: ["error detection", "xor"], symbol: "block", build: "parity-generator",
    description: "Generates even and odd parity bits for 3-bit data.",
    definition: "A parity generator appends a bit to data so the total number of 1s is even (even parity) or odd (odd parity).",
    principle: "XOR of all data bits gives the even-parity bit (1 if the count of 1s is odd). Its complement is the odd-parity bit.",
    expressions: ["P_EVEN = D2 ⊕ D1 ⊕ D0", "P_ODD = (D2 ⊕ D1 ⊕ D0)'"],
    applications: ["Serial communication (UART parity)", "Memory error detection", "Bus integrity checks"],
    parts: [{ name: "XOR gate", fn: "Cascade to sum bits mod 2", qty: 2 }, { name: "NOT gate", fn: "Derive odd parity" }],
    objectives: ["Compute parity by hand", "Understand single-bit error detection"],
    examples: ["Data 101 → P_EVEN = 0 (already even), P_ODD = 1"],
    notes: ["Detects odd numbers of bit errors only"],
  }),
  C({
    id: "parity-checker", name: "Parity Checker", category: "special", tags: ["error detection", "xor"], symbol: "block", build: "parity-checker",
    description: "Checks 3 data bits + parity bit for even parity errors.",
    definition: "A parity checker XORs received data and parity bits; a result of 1 indicates an odd number of bit errors occurred in transmission (even parity scheme).",
    principle: "If the transmitter used even parity, the XOR of all four bits should be 0. Any single flipped bit makes it 1.",
    expressions: ["ERROR = D2 ⊕ D1 ⊕ D0 ⊕ P"],
    applications: ["Receivers of parity-protected links", "RAM error flags", "RAID parity verification"],
    parts: [{ name: "XOR gate", fn: "Sum received bits mod 2", qty: 3 }],
    objectives: ["Pair a generator with a checker", "Identify the limits of parity"],
    examples: ["Receive 1011 with P=1 (even) → ERROR=0; flip one bit → ERROR=1"],
    notes: ["Cannot locate or correct the error – use Hamming codes for that"],
  }),
];

export const getComponent = (id: string) => components.find((c) => c.id === id);
export const getBuild = (c: Component) => (c.build ? builds[c.build] : undefined);
export const isImplemented = (c: Component) => !!getBuild(c);
export const categoryOf = (id: CategoryId) => categories.find((c) => c.id === id)!;
export const totals = {
  all: components.length,
  implemented: components.filter(isImplemented).length,
  pending: components.filter((c) => !isImplemented(c)).length,
};
