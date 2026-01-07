import type { DataRoomState, FileItem } from "../types";
import { generateUniqueFileName } from "../utils/naming";

export function addFile(
  state: DataRoomState,
  folderId: string,
  file: File
): DataRoomState {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  const uniqueName = generateUniqueFileName(state, folderId, file.name);
  const id = crypto.randomUUID();
  const now = Date.now();

  const newFile: FileItem = {
    id,
    name: uniqueName,
    folderId,
    size: file.size,
    type: "pdf",
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...state,
    files: {
      ...state.files,
      [id]: newFile,
    },
  };
}

export function renameFile(
  state: DataRoomState,
  fileId: string,
  newName: string
): DataRoomState {
  const file = state.files[fileId];
  if (!file) return state;

  if (!newName.trim()) {
    throw new Error("File name cannot be empty");
  }

  const uniqueName = generateUniqueFileName(
    state,
    file.folderId,
    newName.trim()
  );

  return {
    ...state,
    files: {
      ...state.files,
      [fileId]: {
        ...file,
        name: uniqueName,
        updatedAt: Date.now(),
      },
    },
  };
}

export function deleteFile(
  state: DataRoomState,
  fileId: string
): DataRoomState {
  const newFiles = { ...state.files };
  delete newFiles[fileId];

  return {
    ...state,
    files: newFiles,
  };
}
