import { useMemo } from "react";
import { cn } from "@/utils/cn";
import type { CircuitBuild, Bits } from "@/lib/builds";
import { getTable, rowMatches } from "@/lib/builds";

interface Props {
  build: CircuitBuild;
  inputs: Bits;
  outputs: Bits;
  onSelectRow?: (vals: Bits) => void;
}

export default function TruthTable({ build, inputs, outputs, onSelectRow }: Props) {
  const rows = useMemo(() => getTable(build), [build]);
  const inCols = useMemo(() => Array.from(new Set(rows.flatMap((r) => Object.keys(r.inputs)))), [rows]);
  const outCols = useMemo(() => Array.from(new Set(rows.flatMap((r) => Object.keys(r.outputs)))), [rows]);
  const hasNotes = rows.some((r) => r.note);
  const auto = !build.table;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">{build.tableTitle ?? "Truth Table"}</h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {auto ? "Click a row to apply its inputs • highlighted row = live simulation" : "Characteristic / function table • highlighted row = live inputs"}
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-cyan-500/15">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
              {inCols.map((c) => (
                <th key={c} className="px-3 py-2 text-center font-semibold text-cyan-600 dark:text-cyan-400">{c}</th>
              ))}
              <th className="w-px bg-slate-300 p-0 dark:bg-cyan-500/30" />
              {outCols.map((c) => (
                <th key={c} className="px-3 py-2 text-center font-semibold text-emerald-600 dark:text-emerald-400">{c}</th>
              ))}
              {hasNotes && <th className="px-3 py-2 text-left font-sans font-medium">Note</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const live = rowMatches(r, inputs, outputs);
              const clickable = auto && !!onSelectRow;
              return (
                <tr
                  key={i}
                  onClick={() => clickable && onSelectRow!(r.inputs as Bits)}
                  className={cn(
                    "border-t border-slate-100 transition-colors dark:border-slate-800",
                    clickable && "cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-500/5",
                    live && "bg-cyan-100/70 ring-1 ring-inset ring-cyan-400/60 dark:bg-cyan-500/15 dark:ring-cyan-400/40"
                  )}
                >
                  {inCols.map((c) => (
                    <td key={c} className="px-3 py-1.5 text-center">
                      <Bit v={r.inputs[c]} live={live} />
                    </td>
                  ))}
                  <td className="w-px bg-slate-200 p-0 dark:bg-cyan-500/20" />
                  {outCols.map((c) => {
                    const v = r.outputs[c];
                    const liveVal = live && c in outputs ? outputs[c] : undefined;
                    return (
                      <td key={c} className="px-3 py-1.5 text-center">
                        <Bit v={v} live={live} out match={liveVal === undefined ? undefined : liveVal === v} />
                      </td>
                    );
                  })}
                  {hasNotes && <td className="px-3 py-1.5 text-left font-sans text-xs text-slate-500 dark:text-slate-400">{r.note}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Bit({ v, live, out, match }: { v: string | number | undefined; live: boolean; out?: boolean; match?: boolean }) {
  if (v === undefined) return <span className="text-slate-400">–</span>;
  const isOne = v === 1;
  const isZero = v === 0;
  return (
    <span
      className={cn(
        "inline-flex min-w-[1.75rem] items-center justify-center rounded px-1.5 py-0.5 text-xs font-bold",
        isOne && (out ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"),
        isZero && "text-slate-500 dark:text-slate-500",
        !isOne && !isZero && "text-amber-600 dark:text-amber-400",
        live && isOne && "shadow-[0_0_10px] shadow-current/30",
        match === false && "ring-1 ring-red-400"
      )}
      title={match === false ? "Mismatch with simulation" : undefined}
    >
      {v}
    </span>
  );
}
