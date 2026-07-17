/* File System Access API helpers with graceful fallbacks. */
import { get, set, del } from "idb-keyval";

export type MdFileNode = {
  kind: "file";
  name: string;
  path: string;
  handle: FileSystemFileHandle;
};

export type MdDirNode = {
  kind: "directory";
  name: string;
  path: string;
  handle: FileSystemDirectoryHandle;
  children: MdNode[];
};

export type MdNode = MdFileNode | MdDirNode;

const DIR_KEY = "muse.rootDirHandle";

export function hasFsAccess(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!hasFsAccess()) return null;
  try {
    const w = window as unknown as {
      showDirectoryPicker: (o?: { mode?: string }) => Promise<FileSystemDirectoryHandle>;
    };
    const handle = await w.showDirectoryPicker({ mode: "readwrite" });
    await set(DIR_KEY, handle);
    return handle;
  } catch {
    return null;
  }
}

export async function loadSavedDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const handle = (await get(DIR_KEY)) as FileSystemDirectoryHandle | undefined;
  return handle ?? null;
}

export async function clearSavedDirectory() {
  await del(DIR_KEY);
}

export async function ensurePermission(
  handle: FileSystemHandle,
  mode: "read" | "readwrite" = "readwrite",
): Promise<boolean> {
  const opts = { mode };
  const anyHandle = handle as unknown as {
    queryPermission?: (o: { mode: string }) => Promise<PermissionState>;
    requestPermission?: (o: { mode: string }) => Promise<PermissionState>;
  };
  const current = await anyHandle.queryPermission?.(opts);
  if (current === "granted") return true;
  const requested = await anyHandle.requestPermission?.(opts);
  return requested === "granted";
}

const MD_EXT = /\.(md|markdown|mdx)$/i;

export async function readDirectoryTree(
  handle: FileSystemDirectoryHandle,
  path = "",
): Promise<MdDirNode> {
  const children: MdNode[] = [];
  const iter = (handle as unknown as {
    entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
  }).entries();
  for await (const [name, child] of iter) {
    const childPath = path ? `${path}/${name}` : name;
    if (child.kind === "file") {
      if (!MD_EXT.test(name)) continue;
      children.push({
        kind: "file",
        name,
        path: childPath,
        handle: child as FileSystemFileHandle,
      });
    } else if (child.kind === "directory") {
      if (name.startsWith(".") || name === "node_modules") continue;
      const sub = await readDirectoryTree(child as FileSystemDirectoryHandle, childPath);
      if (sub.children.length > 0) children.push(sub);
    }
  }
  children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return {
    kind: "directory",
    name: handle.name,
    path,
    handle,
    children,
  };
}

export async function readFileText(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return await file.text();
}

export async function writeFileText(
  handle: FileSystemFileHandle,
  content: string,
): Promise<void> {
  const anyHandle = handle as unknown as {
    createWritable: () => Promise<{
      write: (data: string) => Promise<void>;
      close: () => Promise<void>;
    }>;
  };
  const writable = await anyHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/** Extract writable file handles from a drop event, when the browser supports it. */
export async function extractDroppedMdFiles(
  event: DragEvent,
): Promise<{ handle: FileSystemFileHandle; name: string }[]> {
  const out: { handle: FileSystemFileHandle; name: string }[] = [];
  const items = event.dataTransfer?.items;
  if (!items) return out;
  for (const item of Array.from(items)) {
    if (item.kind !== "file") continue;
    const anyItem = item as unknown as {
      getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
    };
    if (typeof anyItem.getAsFileSystemHandle === "function") {
      const handle = await anyItem.getAsFileSystemHandle();
      if (handle && handle.kind === "file" && MD_EXT.test(handle.name)) {
        out.push({ handle: handle as FileSystemFileHandle, name: handle.name });
      }
    }
  }
  return out;
}
