import type { DataRoomState } from "../types";

/**
 * Checks if a folder name already exists in the specified parent folder.
 * Case-insensitive comparison to prevent duplicates like "Folder" and "folder".
 *
 * @param state - Current application state
 * @param parentId - ID of the parent folder to check within (null for root)
 * @param name - Folder name to check for duplicates
 * @param excludeFolderId - Optional folder ID to exclude from the check (useful for rename operations)
 * @returns true if a duplicate exists, false otherwise
 */
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

/**
 * Generates a unique folder name by appending numbered suffixes when conflicts occur.
 * Examples: "Folder" → "Folder (1)" → "Folder (2)"
 * Intelligently increments existing numbers: "Report (5)" conflict → "Report (6)"
 *
 * @param state - Current application state
 * @param parentId - ID of the parent folder (null for root)
 * @param baseName - Desired folder name
 * @returns Unique folder name guaranteed not to conflict with existing folders
 */
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

/**
 * Checks if a file name already exists in the specified folder.
 * Case-insensitive comparison to prevent duplicates.
 *
 * @param state - Current application state
 * @param folderId - ID of the folder to check within
 * @param name - File name to check for duplicates
 * @param excludeFileId - Optional file ID to exclude from the check (useful for rename operations)
 * @returns true if a duplicate exists, false otherwise
 */
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

/**
 * Generates a unique file name by appending numbered suffixes before the extension when conflicts occur.
 * Preserves file extensions: "file.pdf" → "file (1).pdf" → "file (2).pdf"
 * Handles files without extensions: "notes" → "notes (1)"
 * Handles multiple dots: "report.final.pdf" → "report.final (1).pdf"
 *
 * @param state - Current application state
 * @param folderId - ID of the folder containing the file
 * @param baseName - Desired file name (with or without extension)
 * @returns Unique file name guaranteed not to conflict with existing files in the folder
 */
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
