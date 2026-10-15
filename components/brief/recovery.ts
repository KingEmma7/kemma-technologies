type FileEntry = { id: string; scope: string; role: string; file: File };
type Draft = { files: FileEntry[] };

export class FileRecoveryError extends Error {
  constructor(message: string) { super(message); this.name = "FileRecoveryError"; }
}

/** Replace fresh browser File handles without changing the server's existing allocation. */
export function replaceOriginalFiles<T extends Draft>(draft: T, originals: File[], failedFileId?: string | null): { draft: T; replacedIds: string[] } {
  const replacements = new Map<string, File>();
  const selected = new Set<string>();
  for (const file of originals) {
    const identity = JSON.stringify([file.name, file.size]);
    if (selected.has(identity)) throw new FileRecoveryError("Choose each original file once.");
    selected.add(identity);
    if (file.size <= 0 || file.size > 25 * 1024 * 1024) throw new FileRecoveryError("Choose the original files, with matching names and sizes.");
    const matches = draft.files.filter(entry => entry.file.name === file.name && entry.file.size === file.size);
    const match = matches.length === 1 ? matches[0] : matches.find(entry => entry.id === failedFileId);
    if (!matches.length) throw new FileRecoveryError("Choose the original files, with matching names and sizes.");
    if (!match) throw new FileRecoveryError("These files match more than one upload. Choose the failed file on its own.");
    replacements.set(match.id, file);
  }
  if (!replacements.size) return { draft, replacedIds: [] };
  return {
    draft: { ...draft, files: draft.files.map(entry => replacements.has(entry.id) ? { ...entry, file: replacements.get(entry.id)! } : entry) },
    replacedIds: [...replacements.keys()],
  };
}
