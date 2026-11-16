import { useMemo } from "react";
import { cn } from "@/utils/cn";
import { categories, components, isImplemented, categoryOf, getBuild, totals, type CategoryId, type Component } from "@/lib/kit";
import SymbolSVG from "./SymbolSVG";

export type LibCategory = CategoryId | "all" | "favorites";

interface Props {
  query: string;
  category: LibCategory;
  favorites: string[];
  onQuery: (q: string) => void;
  onCategory: (c: LibCategory) => void;
  onToggleFavorite: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function LibraryView({ query, category, favorites, onQuery, onCategory, onToggleFavorite, onOpen }: Props) {
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return components
      .filter((c) => (category === "favorites" ? favorites.includes(c.id) : category === "all" || c.category === category))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query, category, favorites]);

  const title = category === "all" ? "Component Library" : category === "favorites" ? "Favourites" : categoryOf(category).name;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500">{totals.all} components · {totals.implemented} with 3D simulation · {totals.pending} theory only</p>
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search components…"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-20 text-sm outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900"
        />
        {query && (
          <button onClick={() => onQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-red-500">✕ Clear</button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={category === "all"} onClick={() => onCategory("all")}>All</Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => onCategory(c.id)}>{c.name}</Chip>
        ))}
        <Chip active={category === "favorites"} onClick={() => onCategory("favorites")}>★ Favourites</Chip>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">
          No components found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ComponentCard key={c.id} c={c} fav={favorites.includes(c.id)} onFav={() => onToggleFavorite(c.id)} onOpen={() => onOpen(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentCard({ c, fav, onFav, onOpen }: { c: Component; fav: boolean; onFav: () => void; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="flex items-start justify-between">
        <div className="h-14 w-24 text-slate-600 group-hover:text-cyan-500 dark:text-slate-300">
          <SymbolSVG component={c} build={getBuild(c)} className="h-full w-full" />
        </div>
        <button onClick={(e) => { e.stopPropagation(); onFav(); }} className={cn("text-lg", fav ? "text-amber-400" : "text-slate-300 hover:text-amber-400 dark:text-slate-600")}>
          {fav ? "★" : "☆"}
        </button>
      </div>
      <h3 className="mt-2 font-semibold">{c.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.description}</p>
      <div className="mt-auto pt-3"><StatusBadge ready={isImplemented(c)} /></div>
    </div>
  );
}

export function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", ready ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
      {ready ? "● 3D Simulation" : "● Theory only"}
    </span>
  );
}

function Chip({ active, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      {...p}
      className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", active ? "border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" : "border-slate-300 text-slate-600 hover:border-cyan-400 dark:border-slate-700 dark:text-slate-300")}
    >
      {children}
    </button>
  );
}
