import { cn } from "@/utils/cn";
import { categories, components, totals, getComponent, type CategoryId } from "@/lib/kit";

interface Props {
  category: string;
  inLibrary: boolean;
  favorites: string[];
  open: boolean;
  onClose: () => void;
  onLibrary: (category: CategoryId | "all" | "favorites") => void;
  onOpenComponent: (id: string) => void;
}

export default function Sidebar({ category, inLibrary, favorites, open, onClose, onLibrary, onOpenComponent }: Props) {
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-[#080e19] lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 font-bold text-slate-900">D</div>
          <div>
            <div className="font-bold">DigiLab <span className="text-cyan-500">Pro</span></div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">3D Digital Electronics</div>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <button
            onClick={() => onLibrary("all")}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition",
              inLibrary && category === "all" ? "border-cyan-400 bg-cyan-500/10" : "border-slate-200 hover:border-cyan-400 dark:border-slate-700"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Component Library</span>
              <span className="rounded-full bg-cyan-500 px-2 py-0.5 font-mono text-xs font-bold text-slate-900">{totals.all}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Browse All Digital Electronics Components</p>
          </button>

          <div>
            <Label>Categories</Label>
            {categories.map((c) => (
              <button key={c.id} onClick={() => onLibrary(c.id)} className={navCls(inLibrary && category === c.id)}>
                <span className="w-5 text-center text-cyan-500">{c.icon}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{components.filter((x) => x.category === c.id).length}</span>
              </button>
            ))}
          </div>

          <div>
            <Label>★ Favourites ({favorites.length})</Label>
            {favorites.length === 0 ? (
              <p className="px-2 text-[11px] text-slate-400">Tap ☆ on a component to pin it here.</p>
            ) : (
              favorites.map((id) => {
                const c = getComponent(id);
                return c ? (
                  <button key={id} onClick={() => onOpenComponent(id)} className={navCls(false)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span className="truncate text-xs">{c.name}</span>
                  </button>
                ) : null;
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

const navCls = (active: boolean) =>
  cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition", active ? "bg-cyan-500/15 font-semibold text-cyan-700 dark:text-cyan-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800");

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{children}</div>
);
