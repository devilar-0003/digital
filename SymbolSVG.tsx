import type { Component } from "@/lib/kit";
import type { CircuitBuild } from "@/lib/builds";

interface Props {
  component: Component;
  build?: CircuitBuild;
  className?: string;
}

/** Renders IEEE-style gate symbols or a labelled block diagram for complex circuits. */
export default function SymbolSVG({ component, build, className }: Props) {
  const stroke = "currentColor";
  const s = component.symbol;
  const gate = s !== "block";

  if (gate) {
    const twoIn = s !== "not";
    const bubble = s === "nand" || s === "nor" || s === "xnor" || s === "not";
    const isOr = s === "or" || s === "nor" || s === "xor" || s === "xnor";
    const isXor = s === "xor" || s === "xnor";
    return (
      <svg viewBox="0 0 200 100" className={className} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round">
        {/* inputs */}
        {twoIn ? (
          <>
            <line x1={10} y1={35} x2={isOr ? 58 : 60} y2={35} />
            <line x1={10} y1={65} x2={isOr ? 58 : 60} y2={65} />
            <text x={14} y={28} fontSize={13} fill="currentColor" stroke="none">A</text>
            <text x={14} y={82} fontSize={13} fill="currentColor" stroke="none">B</text>
          </>
        ) : (
          <>
            <line x1={10} y1={50} x2={60} y2={50} />
            <text x={14} y={43} fontSize={13} fill="currentColor" stroke="none">A</text>
          </>
        )}
        {/* body */}
        {s === "and" || s === "nand" ? (
          <path d="M60 15 H105 A35 35 0 0 1 105 85 H60 Z" />
        ) : isOr ? (
          <>
            {isXor && <path d="M46 15 Q66 50 46 85" />}
            <path d="M56 15 Q76 50 56 85 Q100 85 140 50 Q100 15 56 15 Z" />
          </>
        ) : (
          <path d="M60 15 L140 50 L60 85 Z" />
        )}
        {bubble && <circle cx={146} cy={50} r={6} />}
        <line x1={bubble ? 152 : 140} y1={50} x2={190} y2={50} />
        <text x={176} y={43} fontSize={13} fill="currentColor" stroke="none">Y</text>
      </svg>
    );
  }

  const ins = build ? [...build.inputs, ...(build.clocked ? ["CLK"] : [])] : ["IN"];
  const outs = build ? build.outputs : ["OUT"];
  const rows = Math.max(ins.length, outs.length, 2);
  const h = rows * 22 + 30;
  const pitch = (h - 20) / rows;
  return (
    <svg viewBox={`0 0 240 ${h}`} className={className} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round">
      <rect x={70} y={10} width={100} height={h - 20} rx={6} />
      {ins.map((n, i) => {
        const y = 10 + pitch * (i + 0.5);
        const clk = n === "CLK";
        return (
          <g key={n}>
            <line x1={20} y1={y} x2={70} y2={y} />
            {clk && <path d={`M70 ${y - 7} L80 ${y} L70 ${y + 7}`} />}
            <text x={18} y={y - 5} fontSize={11} fill="currentColor" stroke="none" textAnchor="start">{n}</text>
          </g>
        );
      })}
      {outs.map((n, i) => {
        const y = 10 + pitch * (i + 0.5);
        return (
          <g key={n}>
            <line x1={170} y1={y} x2={220} y2={y} />
            <text x={222} y={y - 5} fontSize={11} fill="currentColor" stroke="none" textAnchor="end">{n}</text>
          </g>
        );
      })}
      <text x={120} y={h / 2 + 4} fontSize={11} fontWeight={700} fill="currentColor" stroke="none" textAnchor="middle">
        {component.name.split(" (")[0].toUpperCase().slice(0, 14)}
      </text>
    </svg>
  );
}
