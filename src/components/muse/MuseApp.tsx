import { useCallback, useEffect, useState } from "react";
import { FileTree } from "./FileTree";
import { TabBar } from "./TabBar";
import { Toolbar } from "./Toolbar";
import { Editor } from "./Editor";
import { Preview } from "./Preview";
import { EmptyState } from "./EmptyState";
import { useMuseStore } from "@/lib/muse-store";
import {
  extractDroppedMdFiles,
  loadSavedDirectory,
} from "@/lib/fs-access";
import { cn } from "@/lib/utils";
import { FolderOpen, Github, KeyRound } from "lucide-react";

const APP_ICON = "/app-icon.png";

export function MuseApp() {
  const root = useMuseStore((s) => s.root);
  const setRoot = useMuseStore((s) => s.setRoot);
  const tabs = useMuseStore((s) => s.tabs);
  const activeId = useMuseStore((s) => s.activeId);
  const mode = useMuseStore((s) => s.mode);
  const updateContent = useMuseStore((s) => s.updateContent);
  const saveActive = useMuseStore((s) => s.saveActive);
  const openFile = useMuseStore((s) => s.openFile);

  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Try restoring the last opened folder (needs a user gesture for permission).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSavedDirectory();
      if (cancelled || !saved) return;
      // @ts-expect-error - non-standard
      const perm = await saved.queryPermission?.({ mode: "readwrite" });
      if (perm === "granted") {
        await setRoot(saved);
      } else {
        setNeedsReconnect(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setRoot]);

  // Keyboard: Cmd/Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveActive();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveActive]);

  // Drag & drop .md files onto anywhere in the window.
  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = await extractDroppedMdFiles(e.nativeEvent);
      for (const f of files) {
        await openFile(f.handle);
      }
    },
    [openFile],
  );

  const activeTab = tabs.find((t) => t.id === activeId) ?? null;

  const reconnectFolder = async () => {
    const saved = await loadSavedDirectory();
    if (!saved) {
      setNeedsReconnect(false);
      return;
    }
    await setRoot(saved);
    setNeedsReconnect(false);
  };

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Title bar */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border/60 bg-background/90 px-3">
        <div className="flex items-center gap-2">
          <img src={APP_ICON} alt="" width={20} height={20} className="rounded" />
          <span className="text-xs font-semibold tracking-wide text-foreground">
            Markdown <span className="text-accent">Muse</span>
          </span>
          <span className="ml-2 rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            local · beta
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="rounded p-1.5 hover:bg-muted/40 hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-border/60 bg-muted/10">
          <div className="flex-1 overflow-y-auto">
            {root ? (
              <FileTree root={root} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                <FolderOpen className="h-5 w-5 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">
                  No folder open yet.
                </p>
                {needsReconnect && (
                  <button
                    type="button"
                    onClick={() => void reconnectFolder()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs text-accent hover:bg-accent/20"
                  >
                    <KeyRound className="h-3 w-3" />
                    Reconnect last folder
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main pane */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <Toolbar />
          <TabBar />
          <div className="min-h-0 flex-1">
            {!activeTab ? (
              <EmptyState />
            ) : (
              <div
                className={cn(
                  "grid h-full",
                  mode === "split" ? "grid-cols-2 divide-x divide-border/60" : "grid-cols-1",
                )}
              >
                {(mode === "editor" || mode === "split") && (
                  <Editor
                    value={activeTab.content}
                    onChange={(v) => updateContent(activeTab.id, v)}
                  />
                )}
                {(mode === "preview" || mode === "split") && (
                  <Preview content={activeTab.content} />
                )}
              </div>
            )}
          </div>

          {dragging && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-accent/5 backdrop-blur-sm">
              <div className="rounded-2xl border-2 border-dashed border-accent/70 bg-background/90 px-8 py-6 text-center">
                <p className="text-sm font-semibold text-accent">
                  Drop .md files to open
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
