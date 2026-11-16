import { useCallback, useMemo, useState } from "react";
import type { Bits, CircuitBuild } from "@/lib/builds";
import { makeInitialInputs } from "@/lib/builds";

/** Shared live-simulation state for a circuit build (used by 3D viewer, panels and truth table). */
export function useSimulation(build: CircuitBuild | undefined) {
  const [inputs, setInputs] = useState<Bits>(() => (build ? makeInitialInputs(build) : {}));
  const [state, setState] = useState<Bits>(() => (build?.initState ? build.initState() : {}));
  const [clockPulse, setClockPulse] = useState(0);
  const [clockCount, setClockCount] = useState(0);

  const outputs = useMemo<Bits>(() => {
    if (!build) return {};
    try {
      return build.evaluate(inputs, state);
    } catch (e) {
      console.error("Simulation error", e);
      return {};
    }
  }, [build, inputs, state]);

  const toggle = useCallback((name: string) => {
    setInputs((p) => ({ ...p, [name]: (p[name] ?? 0) ^ 1 }));
  }, []);

  const setInput = useCallback((name: string, v: number) => {
    setInputs((p) => ({ ...p, [name]: v }));
  }, []);

  const setAll = useCallback((vals: Bits) => {
    setInputs((p) => ({ ...p, ...vals }));
  }, []);

  const pulseClock = useCallback(() => {
    if (!build?.onClock) return;
    setState((s) => build.onClock!(inputs, s));
    setClockPulse((c) => c + 1);
    setClockCount((c) => c + 1);
  }, [build, inputs]);

  const reset = useCallback(() => {
    if (!build) return;
    setInputs(makeInitialInputs(build));
    setState(build.initState ? build.initState() : {});
    setClockCount(0);
  }, [build]);

  return { inputs, outputs, state, clockPulse, clockCount, toggle, setInput, setAll, pulseClock, reset };
}

export type Simulation = ReturnType<typeof useSimulation>;
