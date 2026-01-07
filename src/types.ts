export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type FileItem = {
  id: string;
  name: string;
  folderId: string;
  size: number;
  type: "pdf";
  createdAt: number;
  updatedAt: number;
};

export type DataRoomState = {
  folders: Record<string, Folder>;
  files: Record<string, FileItem>;
  rootFolderId: string;
};
