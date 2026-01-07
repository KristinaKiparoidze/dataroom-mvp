import type { DataRoomState } from "../types";

export function isDuplicateFolderName(
  state: DataRoomState,
  parentId: string | null,
  name: string,
  excludeFolderId?: string
): boolean {
  return Object.values(state.folders).some(
    (folder) =>
      folder.id !== excludeFolderId &&
      folder.parentId === parentId &&
      folder.name.toLowerCase() === name.toLowerCase()
  );
}

export function generateUniqueFolderName(
  state: DataRoomState,
  parentId: string | null,
  baseName: string
): string {
  if (!isDuplicateFolderName(state, parentId, baseName)) {
    return baseName;
  }

  const match = baseName.match(/^(.+?)\s*\((\d+)\)$/);
  const base = match ? match[1].trim() : baseName;
  const startNum = match ? parseInt(match[2], 10) : 0;

  let num = startNum + 1;
  let candidate = `${base} (${num})`;

  while (isDuplicateFolderName(state, parentId, candidate)) {
    num++;
    candidate = `${base} (${num})`;
  }

  return candidate;
}

export function isDuplicateFileName(
  state: DataRoomState,
  folderId: string,
  name: string,
  excludeFileId?: string
): boolean {
  return Object.values(state.files).some(
    (file) =>
      file.id !== excludeFileId &&
      file.folderId === folderId &&
      file.name.toLowerCase() === name.toLowerCase()
  );
}

export function generateUniqueFileName(
  state: DataRoomState,
  folderId: string,
  baseName: string
): string {
  if (!isDuplicateFileName(state, folderId, baseName)) {
    return baseName;
  }

  const lastDotIndex = baseName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    const match = baseName.match(/^(.+?)\s*\((\d+)\)$/);
    const base = match ? match[1].trim() : baseName;
    const startNum = match ? parseInt(match[2], 10) : 0;

    let num = startNum + 1;
    let candidate = `${base} (${num})`;

    while (isDuplicateFileName(state, folderId, candidate)) {
      num++;
      candidate = `${base} (${num})`;
    }

    return candidate;
  }

  const extension = baseName.substring(lastDotIndex);
  const nameWithoutExt = baseName.substring(0, lastDotIndex);
  const match = nameWithoutExt.match(/^(.+?)\s*\((\d+)\)$/);
  const base = match ? match[1].trim() : nameWithoutExt;
  const startNum = match ? parseInt(match[2], 10) : 0;

  let num = startNum + 1;
  let candidate = `${base} (${num})${extension}`;

  while (isDuplicateFileName(state, folderId, candidate)) {
    num++;
    candidate = `${base} (${num})${extension}`;
  }

  return candidate;
}
