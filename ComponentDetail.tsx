import { cn } from "@/utils/cn";
import { categoryOf, getBuild, type Component } from "@/lib/kit";
import { useSimulation } from "@/hooks/useSimulation";
import Viewer3D from "./Viewer3D";
import TruthTable from "./TruthTable";
import SymbolSVG from "./SymbolSVG";
import { StatusBadge } from "./LibraryView";

interface Props {
  component: Component;
  dark: boolean;
  fav: boolean;
  onToggleFav: () => void;
  onBack: () => void;
}

export default function ComponentDetail({ component: c, dark, fav, onToggleFav, onBack }: Props) {
  const build = getBuild(c);
  const sim = useSimulation(build);
  const cat = categoryOf(c.category);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:border-cyan-400 dark:border-slate-700">← Back to Library</button>
        <button onClick={onToggleFav} className={cn("rounded-lg border px-3 py-1.5 text-sm", fav ? "border-amber-400 text-amber-500" : "border-slate-300 hover:border-amber-400 dark:border-slate-700")}>
          {fav ? "★ Saved" : "☆ Save"}
        </button>
      </div>

      {/* Overview */}
      <Card>
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="h-28 w-full shrink-0 text-slate-700 dark:text-cyan-200 md:w-56"><SymbolSVG component={c} build={build} className="h-full w-full" /></div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500"><span>{cat.icon} {cat.name}</span><StatusBadge ready={!!build} /></div>
            <h1 className="mt-1 text-2xl font-bold">{c.name}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
              {c.expressions.map((e) => <span key={e} className="rounded-md bg-cyan-500/10 px-2 py-1 text-cyan-700 dark:text-cyan-300">{e}</span>)}
            </div>
          </div>
        </div>
      </Card>

      {/* 3D Simulation */}
      {build ? (
        <Card title="Interactive 3D Simulation">
          <Viewer3D build={build} label={c.name} code={build.id.toUpperCase().slice(0, 10)} sim={sim} dark={dark} className="h-[420px] md:h-[500px]" />
          {build.stateLabels && (
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
              {build.stateLabels.map((k) => (
                <span key={k} className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">{k} = {sim.state[k]} ({sim.state[k].toString(2).padStart(4, "0")})</span>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-center text-sm text-slate-500">🚧 3D simulation for <b>{c.name}</b> is not yet available. Theory is provided below.</p>
        </Card>
      )}

      {/* Truth table */}
      {build && (
        <Card>
          <TruthTable build={build} inputs={sim.inputs} outputs={sim.outputs} onSelectRow={sim.setAll} />
        </Card>
      )}

      {/* Theory */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Definition"><P>{c.definition}</P></Card>
        <Card title="Working Principle"><P>{c.principle}</P></Card>
        <Card title="Applications"><List items={c.applications} /></Card>
        <Card title="Parts Used">
          <ul className="space-y-2 text-sm">
            {c.parts.map((p) => (
              <li key={p.name} className="flex gap-2"><span className="text-cyan-500">▸</span><span><b>{p.name}</b>{p.qty ? ` ×${p.qty}` : ""} – <span className="text-slate-500">{p.fn}</span></span></li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Learning */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Learning Objectives"><List items={c.objectives} /></Card>
        <Card title="Examples"><List items={c.examples} /></Card>
        <Card title="Notes"><List items={c.notes} /></Card>
      </div>
    </div>
  );
}

const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
    {title && <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">{title}</h3>}
    {children}
  </section>
);
const P = ({ children }: { children: React.ReactNode }) => <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</p>;
const List = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
    {items.map((i) => <li key={i} className="flex gap-2"><span className="text-cyan-500">▸</span>{i}</li>)}
  </ul>
);
