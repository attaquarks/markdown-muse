import { useState } from "react";
import { ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import type { MdDirNode, MdNode } from "@/lib/fs-access";
import { useMuseStore } from "@/lib/muse-store";
import { cn } from "@/lib/utils";

function TreeNode({ node, depth }: { node: MdNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const openFile = useMuseStore((s) => s.openFile);
  const activeId = useMuseStore((s) => s.activeId);

  if (node.kind === "directory") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              open && "rotate-90",
            )}
          />
          {open ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {open && (
          <div>
            {node.children.map((child) => (
              <TreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = activeId === node.path;

  return (
    <button
      type="button"
      onClick={() => openFile(node.handle, node.path)}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-colors",
        isActive
          ? "bg-accent/15 text-foreground"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
      style={{ paddingLeft: 8 + depth * 12 + 14 }}
    >
      <FileText
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          isActive ? "text-accent" : "text-muted-foreground/60",
        )}
      />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree({ root }: { root: MdDirNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {root.name}
      </div>
      {root.children.length === 0 ? (
        <p className="px-3 py-4 text-xs text-muted-foreground">
          No .md files here.
        </p>
      ) : (
        root.children.map((child) => (
          <TreeNode key={child.path} node={child} depth={0} />
        ))
      )}
    </div>
  );
}
