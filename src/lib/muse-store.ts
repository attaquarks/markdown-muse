import { create } from "zustand";
import type { MdDirNode, MdFileNode } from "./fs-access";
import {
  ensurePermission,
  readDirectoryTree,
  readFileText,
  writeFileText,
} from "./fs-access";

export type ViewMode = "split" | "editor" | "preview";

export type OpenTab = {
  /** Unique id — path within the tree if known, else a synthetic id. */
  id: string;
  name: string;
  handle: FileSystemFileHandle;
  original: string;
  content: string;
};

type MuseState = {
  root: MdDirNode | null;
  tabs: OpenTab[];
  activeId: string | null;
  mode: ViewMode;
  loading: boolean;

  setRoot: (handle: FileSystemDirectoryHandle) => Promise<void>;
  refreshTree: () => Promise<void>;
  clearRoot: () => void;

  openFile: (handle: FileSystemFileHandle, id?: string) => Promise<void>;
  closeTab: (id: string) => void;
  setActive: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveActive: () => Promise<void>;
  setMode: (mode: ViewMode) => void;
};

export const useMuseStore = create<MuseState>((set, get) => ({
  root: null,
  tabs: [],
  activeId: null,
  mode: "split",
  loading: false,

  setRoot: async (handle) => {
    set({ loading: true });
    const ok = await ensurePermission(handle, "readwrite");
    if (!ok) {
      set({ loading: false });
      return;
    }
    const tree = await readDirectoryTree(handle);
    set({ root: tree, loading: false });
  },

  refreshTree: async () => {
    const root = get().root;
    if (!root) return;
    const tree = await readDirectoryTree(root.handle);
    set({ root: tree });
  },

  clearRoot: () => set({ root: null }),

  openFile: async (handle, id) => {
    const tabId = id ?? handle.name + "::" + Math.random().toString(36).slice(2, 8);
    const existing = get().tabs.find((t) => t.id === tabId);
    if (existing) {
      set({ activeId: existing.id });
      return;
    }
    const ok = await ensurePermission(handle, "readwrite");
    if (!ok) return;
    const text = await readFileText(handle);
    const tab: OpenTab = {
      id: tabId,
      name: handle.name,
      handle,
      original: text,
      content: text,
    };
    set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id }));
  },

  closeTab: (id) =>
    set((s) => {
      const tabs = s.tabs.filter((t) => t.id !== id);
      let activeId = s.activeId;
      if (s.activeId === id) {
        activeId = tabs.length ? tabs[tabs.length - 1].id : null;
      }
      return { tabs, activeId };
    }),

  setActive: (id) => set({ activeId: id }),

  updateContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, content } : t)),
    })),

  saveActive: async () => {
    const s = get();
    const tab = s.tabs.find((t) => t.id === s.activeId);
    if (!tab) return;
    await writeFileText(tab.handle, tab.content);
    set((prev) => ({
      tabs: prev.tabs.map((t) =>
        t.id === tab.id ? { ...t, original: t.content } : t,
      ),
    }));
  },

  setMode: (mode) => set({ mode }),
}));

export function isDirty(tab: OpenTab): boolean {
  return tab.content !== tab.original;
}

/** Helper to walk the tree looking for a file by path. */
export function findFileByPath(
  root: MdDirNode | null,
  path: string,
): MdFileNode | null {
  if (!root) return null;
  const stack: (MdDirNode | MdFileNode)[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.kind === "file" && node.path === path) return node;
    if (node.kind === "directory") stack.push(...node.children);
  }
  return null;
}
