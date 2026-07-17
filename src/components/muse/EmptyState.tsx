import { FolderOpen, Sparkles } from "lucide-react";
import { pickDirectory, hasFsAccess } from "@/lib/fs-access";
import { useMuseStore } from "@/lib/muse-store";

export function EmptyState() {
  const setRoot = useMuseStore((s) => s.setRoot);
  const supported = hasFsAccess();

  const handleOpen = async () => {
    const handle = await pickDirectory();
    if (handle) await setRoot(handle);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-2xl" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/5">
          <Sparkles className="h-8 w-8 text-accent" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Markdown Muse
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        A local-first markdown notebook for context engineers. Open a folder
        of agent files or drop a single{" "}
        <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-accent">
          .md
        </code>{" "}
        anywhere on this page to get started.
      </p>

      {supported ? (
        <button
          type="button"
          onClick={handleOpen}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:-translate-y-0.5"
        >
          <FolderOpen className="h-4 w-4" />
          Open a folder
        </button>
      ) : (
        <p className="mt-8 max-w-md rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
          Your browser doesn't support the File System Access API. Muse works
          best in Chrome, Edge, Arc, or Brave — or install it to your dock
          for the full desktop experience.
        </p>
      )}

      <div className="mt-10 flex items-center gap-4 text-[11px] uppercase tracking-widest text-muted-foreground/60">
        <span>⌘S save</span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
        <span>drag & drop</span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
        <span>local only</span>
      </div>
    </div>
  );
}
