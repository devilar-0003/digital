import { useEffect, useRef, useState } from "react";
import { Engine } from "@/lib/engine";
import { buildCircuitModel, type CircuitModel } from "@/lib/models";
import type { CircuitBuild } from "@/lib/builds";
import type { Simulation } from "@/hooks/useSimulation";
import { cn } from "@/utils/cn";

interface Props {
  build: CircuitBuild;
  label: string;
  code: string;
  sim: Simulation;
  dark: boolean;
  className?: string;
}

export default function Viewer3D({ build, label, code, sim, dark, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const modelRef = useRef<CircuitModel | null>(null);
  const simRef = useRef(sim);
  simRef.current = sim;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fs, setFs] = useState(false);

  // Create engine once
  useEffect(() => {
    if (!hostRef.current) return;
    let engine: Engine;
    try {
      engine = new Engine(hostRef.current);
    } catch (e) {
      console.error(e);
      setError("WebGL is not available in this browser.");
      return;
    }
    engineRef.current = engine;
    setReady(true);
    return () => {
      engine.dispose();
      engineRef.current = null;
      setReady(false);
    };
  }, []);

  // (Re)build the model when the circuit changes
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !ready) return;
    const model = buildCircuitModel(build, label, code);
    modelRef.current = model;
    engine.root.add(model.group);
    engine.setPickables(model.pickables, (o) => {
      const id = o.userData.pickId as string;
      if (id === "CLK") simRef.current.pulseClock();
      else simRef.current.toggle(id);
    });
    engine.onFrame = (t) => model.animate(t);
    engine.resetView();
    return () => {
      engine.root.remove(model.group);
      model.group.traverse((o) => {
        if ((o as { isSprite?: boolean }).isSprite) {
          // Sprites share a static geometry in three.js – only dispose their material/texture
          const sm = (o as unknown as { material: { map?: { dispose: () => void }; dispose: () => void } }).material;
          sm.map?.dispose();
          sm.dispose();
          return;
        }
        const m = o as THREE_Mesh;
        m.geometry?.dispose?.();
        const mat = m.material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
    };
  }, [build, label, code, ready]);

  useEffect(() => {
    modelRef.current?.update(sim.inputs, sim.outputs, sim.clockPulse);
  }, [sim.inputs, sim.outputs, sim.clockPulse, ready, build]);

  useEffect(() => {
    engineRef.current?.setTheme(dark);
  }, [dark, ready]);

  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapRef.current?.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen unavailable", e);
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-cyan-500/20 dark:bg-[#060b14]", fs && "rounded-none", className)}>
      <div ref={hostRef} className="absolute inset-0" />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3">Initialising 3D engine…</span>
        </div>
      )}
      {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-400">{error}</div>}

      {/* HUD */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/70 px-2 py-1 text-[11px] text-slate-600 backdrop-blur dark:bg-slate-900/60 dark:text-slate-300">
        Drag to rotate · Scroll to zoom · Click switches to toggle
      </div>
      <div className="absolute right-3 top-3 flex gap-2">
        <HudBtn onClick={() => engineRef.current?.resetView()} title="Reset camera">⌖ View</HudBtn>
        <HudBtn onClick={sim.reset} title="Reset circuit">↺ Reset</HudBtn>
        <HudBtn onClick={toggleFullscreen} title="Fullscreen">{fs ? "✕ Exit" : "⛶ Full"}</HudBtn>
      </div>

      {/* Live controls */}
      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2">
        {build.inputs.map((name) => {
          const on = sim.inputs[name] === 1;
          return (
            <button
              key={name}
              onClick={() => sim.toggle(name)}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold backdrop-blur transition-all",
                on
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-700 shadow-[0_0_12px] shadow-cyan-500/40 dark:text-cyan-300"
                  : "border-slate-300 bg-white/70 text-slate-600 hover:border-cyan-400 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-300"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", on ? "bg-cyan-400" : "bg-slate-400")} />
              {name} = {on ? 1 : 0}
            </button>
          );
        })}
        {build.clocked && (
          <button
            onClick={sim.pulseClock}
            className="flex items-center gap-2 rounded-lg border border-violet-400 bg-violet-500/20 px-3 py-1.5 font-mono text-xs font-semibold text-violet-700 backdrop-blur transition-all hover:bg-violet-500/30 active:scale-95 dark:text-violet-300"
          >
            ⏱ CLK ↑ <span className="opacity-70">#{sim.clockCount}</span>
          </button>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {build.outputs.map((name) => {
            const on = sim.outputs[name] === 1;
            return (
              <span
                key={name}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold backdrop-blur",
                  on
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-700 shadow-[0_0_12px] shadow-emerald-500/40 dark:text-emerald-300"
                    : "border-slate-300 bg-white/70 text-slate-500 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-400"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", on ? "bg-emerald-400" : "bg-slate-400")} />
                {name} = {on ? 1 : 0}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type THREE_Mesh = { geometry?: { dispose?: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] };

function HudBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="rounded-md border border-slate-300 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-cyan-300"
    >
      {children}
    </button>
  );
}
