import { X } from "lucide-react";
import { isDirty, useMuseStore } from "@/lib/muse-store";
import { cn } from "@/lib/utils";

export function TabBar() {
  const tabs = useMuseStore((s) => s.tabs);
  const activeId = useMuseStore((s) => s.activeId);
  const setActive = useMuseStore((s) => s.setActive);
  const closeTab = useMuseStore((s) => s.closeTab);

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border/60 bg-background/60 px-2">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const dirty = isDirty(tab);
        return (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center gap-2 border-b-2 px-3 py-2 text-xs transition-colors",
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <button
              type="button"
              onClick={() => setActive(tab.id)}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  dirty ? "bg-accent" : "bg-transparent",
                )}
              />
              <span className="max-w-[160px] truncate font-mono">{tab.name}</span>
            </button>
            <button
              type="button"
              onClick={() => closeTab(tab.id)}
              className="rounded p-0.5 text-muted-foreground/60 opacity-0 hover:bg-muted/40 hover:text-foreground group-hover:opacity-100"
              aria-label={`Close ${tab.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
