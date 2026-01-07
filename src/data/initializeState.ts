import type { DataRoomState, Folder } from "../types";

export const initializeState = (): DataRoomState => {
  const rootFolderId = crypto.randomUUID();
  const now = Date.now();

  const rootFolder: Folder = {
    id: rootFolderId,
    name: "Acme Corp Data Room",
    parentId: null,
    createdAt: now,
    updatedAt: now,
  };

  return {
    folders: {
      [rootFolderId]: rootFolder,
    },
    files: {},
    rootFolderId,
  };
};
