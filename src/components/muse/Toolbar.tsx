import { Columns, Eye, FolderOpen, Pencil, Save } from "lucide-react";
import { isDirty, useMuseStore, type ViewMode } from "@/lib/muse-store";
import { cn } from "@/lib/utils";
import { pickDirectory } from "@/lib/fs-access";

const MODES: { id: ViewMode; label: string; icon: typeof Columns }[] = [
  { id: "editor", label: "Editor", icon: Pencil },
  { id: "split", label: "Split", icon: Columns },
  { id: "preview", label: "Preview", icon: Eye },
];

export function Toolbar() {
  const mode = useMuseStore((s) => s.mode);
  const setMode = useMuseStore((s) => s.setMode);
  const tabs = useMuseStore((s) => s.tabs);
  const activeId = useMuseStore((s) => s.activeId);
  const saveActive = useMuseStore((s) => s.saveActive);
  const setRoot = useMuseStore((s) => s.setRoot);

  const activeTab = tabs.find((t) => t.id === activeId);
  const dirty = activeTab ? isDirty(activeTab) : false;

  const handleOpenFolder = async () => {
    const handle = await pickDirectory();
    if (handle) await setRoot(handle);
  };

  return (
    <div className="flex h-11 items-center justify-between border-b border-border/60 bg-background/80 px-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenFolder}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Open folder
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 p-0.5">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!activeTab || !dirty}
          onClick={() => void saveActive()}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium transition-colors",
            dirty
              ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
              : "text-muted-foreground/60",
          )}
        >
          <Save className="h-3.5 w-3.5" />
          Save
          <span className="ml-1 text-[10px] text-muted-foreground/70">⌘S</span>
        </button>
      </div>
    </div>
  );
}
