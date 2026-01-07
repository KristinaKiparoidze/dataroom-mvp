import type { DataRoomState, Folder } from "../types";
import { generateUniqueFolderName } from "../utils/naming";

export function createFolder(
  state: DataRoomState,
  parentId: string | null,
  name: string
): DataRoomState {
  if (!name.trim()) {
    throw new Error("Folder name cannot be empty");
  }

  const uniqueName = generateUniqueFolderName(state, parentId, name.trim());
  const id = crypto.randomUUID();
  const now = Date.now();

  const newFolder: Folder = {
    id,
    name: uniqueName,
    parentId,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...state,
    folders: {
      ...state.folders,
      [id]: newFolder,
    },
  };
}

export function renameFolder(
  state: DataRoomState,
  folderId: string,
  newName: string
): DataRoomState {
  const folder = state.folders[folderId];
  if (!folder) return state;

  if (!newName.trim()) {
    throw new Error("Folder name cannot be empty");
  }

  const uniqueName = generateUniqueFolderName(
    state,
    folder.parentId,
    newName.trim()
  );

  return {
    ...state,
    folders: {
      ...state.folders,
      [folderId]: {
        ...folder,
        name: uniqueName,
        updatedAt: Date.now(),
      },
    },
  };
}

export function deleteFolder(
  state: DataRoomState,
  folderId: string
): DataRoomState {
  const foldersToDelete = new Set<string>();

  function collect(id: string) {
    foldersToDelete.add(id);
    Object.values(state.folders).forEach((folder) => {
      if (folder.parentId === id) {
        collect(folder.id);
      }
    });
  }

  collect(folderId);

  const newFolders = { ...state.folders };
  const newFiles = { ...state.files };

  foldersToDelete.forEach((id) => {
    delete newFolders[id];
    Object.keys(newFiles).forEach((fileId) => {
      if (newFiles[fileId].folderId === id) {
        delete newFiles[fileId];
      }
    });
  });

  return {
    ...state,
    folders: newFolders,
    files: newFiles,
  };
}
