import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import LibraryView, { type LibCategory } from "./components/LibraryView";
import ComponentDetail from "./components/ComponentDetail";
import { getComponent } from "./lib/kit";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  const [dark, setDark] = useLocalStorage<boolean>("digilab.dark", true);
  const [favorites, setFavorites] = useLocalStorage<string[]>("digilab.favorites", []);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LibCategory>("all");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const open = (id: string) => {
    if (!getComponent(id)) return;
    setSelected(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };
  const showLibrary = (c: LibCategory) => {
    setCategory(c);
    setSelected(null);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };
  const toggleFavorite = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const detail = selected ? getComponent(selected) : undefined;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070c15] dark:text-slate-100">
      <Sidebar
        category={category}
        inLibrary={!detail}
        favorites={favorites}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLibrary={showLibrary}
        onOpenComponent={open}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-[#070c15]/80">
          <button onClick={() => setMenuOpen(true)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm lg:hidden dark:border-slate-700" aria-label="Menu">☰</button>
          <span className="text-sm font-medium">{detail ? detail.name : "Component Library"}</span>
          <button onClick={() => setDark((d) => !d)} className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:border-cyan-400 dark:border-slate-700">
            {dark ? "☀ Light" : "☾ Dark"}
          </button>
        </header>
        <main className="flex-1">
          {detail ? (
            <ComponentDetail key={detail.id} component={detail} dark={dark} fav={favorites.includes(detail.id)} onToggleFav={() => toggleFavorite(detail.id)} onBack={() => setSelected(null)} />
          ) : (
            <LibraryView query={query} category={category} favorites={favorites} onQuery={setQuery} onCategory={setCategory} onToggleFavorite={toggleFavorite} onOpen={open} />
          )}
        </main>
      </div>
    </div>
  );
}
