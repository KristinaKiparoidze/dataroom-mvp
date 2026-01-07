import { useCallback, useEffect, useRef, useState } from "react";
import type { DataRoomState } from "../types";
import { loadState, saveState } from "../data/dataService";
import { initializeState } from "../data/initializeState";
import {
  createFolder,
  renameFolder,
  deleteFolder,
} from "../data/folderActions";
import { addFile, renameFile, deleteFile } from "../data/fileActions";
import type { Toast } from "../components/ToastStack";

export function useDataRoom() {
  const [state, setState] = useState<DataRoomState>(() => {
    return loadState() ?? initializeState();
  });

  const [currentFolderId, setCurrentFolderId] = useState(state.rootFolderId);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);
  const [viewingFileName, setViewingFileName] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const saveErrorShownRef = useRef(false);

  const addToast = useCallback(
    (message: string, tone: Toast["tone"] = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3800);
    },
    []
  );

  useEffect(() => {
    try {
      saveState(state);
    } catch {
      if (!saveErrorShownRef.current) {
        addToast(
          "Unable to save changes locally. Storage may be blocked.",
          "error"
        );
        saveErrorShownRef.current = true;
      }
    }
  }, [state, addToast]);

  useEffect(() => {
    if (!state.folders[currentFolderId]) {
      setCurrentFolderId(state.rootFolderId);
      setSelectedFolderId(null);
      setSelectedFileId(null);
    }
  }, [state, currentFolderId]);

  const handleRenameStart = useCallback(
    (type: "folder" | "file", id: string) => {
      if (type === "folder") {
        setRenamingFolder(id);
        setRenamingFile(null);
      } else {
        setRenamingFile(id);
        setRenamingFolder(null);
      }
    },
    []
  );

  const handleRenameSubmit = useCallback(
    (type: "folder" | "file", id: string, newName: string) => {
      if (!newName.trim()) {
        addToast("Name cannot be empty", "error");
        return;
      }

      try {
        const currentName =
          type === "folder" ? state.folders[id]?.name : state.files[id]?.name;

        if (currentName === newName.trim()) {
          setRenamingFolder(null);
          setRenamingFile(null);
          return;
        }

        if (type === "folder") {
          setState((prev) => renameFolder(prev, id, newName));
        } else {
          setState((prev) => renameFile(prev, id, newName));
        }
        addToast("Renamed successfully", "success");
        setRenamingFolder(null);
        setRenamingFile(null);
      } catch (err) {
        addToast((err as Error).message, "error");
      }
    },
    [state.folders, state.files, addToast]
  );

  const handleRenameCancel = useCallback(() => {
    setRenamingFolder(null);
    setRenamingFile(null);
  }, []);

  const handleCreateFolder = useCallback(() => {
    try {
      setState((prev) => createFolder(prev, currentFolderId, "New Folder"));
      addToast("Folder created", "success");
    } catch (err) {
      addToast((err as Error).message, "error");
    }
  }, [currentFolderId, addToast]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUploadFile = useCallback(
    async (file: File) => {
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        addToast(
          `File too large (${(file.size / 1024 / 1024).toFixed(
            1
          )}MB). Maximum size is 5MB.`,
          "error"
        );
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64 = (reader.result as string).split(",")[1];

            const tempFileId = `temp-${Date.now()}`;
            try {
              localStorage.setItem(`file-${tempFileId}`, base64);
              localStorage.removeItem(`file-${tempFileId}`);
            } catch (storageErr) {
              if (
                storageErr instanceof DOMException &&
                storageErr.name === "QuotaExceededError"
              ) {
                addToast(
                  "Storage quota exceeded. Please delete some files and try again.",
                  "error"
                );
                return;
              }
              throw storageErr;
            }

            setState((prev) => {
              const newState = addFile(prev, currentFolderId, file);
              const newFileId = Object.keys(newState.files).find(
                (id) => !prev.files[id]
              );
              if (newFileId) {
                localStorage.setItem(`file-${newFileId}`, base64);
              }
              return newState;
            });
            addToast(`Uploaded ${file.name}`, "success");
          } catch {
            addToast("Failed to store file", "error");
          }
        };
        reader.onerror = () => {
          addToast("Failed to read file", "error");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        addToast((error as Error).message, "error");
      }
    },
    [currentFolderId, addToast]
  );

  const handleDeleteFolder = useCallback(
    (id: string) => {
      if (id === currentFolderId) {
        const parentId = state.folders[currentFolderId].parentId;
        if (parentId) {
          setCurrentFolderId(parentId);
        }
      }
      const filesToDelete = Object.values(state.files).filter((file) => {
        let folderId: string | null = file.folderId;
        while (folderId) {
          if (folderId === id) return true;
          folderId = state.folders[folderId]?.parentId || null;
        }
        return false;
      });
      filesToDelete.forEach((file) =>
        localStorage.removeItem(`file-${file.id}`)
      );

      setState((prev) => deleteFolder(prev, id));
      setSelectedFolderId(null);
      addToast("Folder deleted", "info");
    },
    [currentFolderId, state.folders, state.files, addToast]
  );

  const handleDeleteFile = useCallback(
    (id: string) => {
      localStorage.removeItem(`file-${id}`);
      setState((prev) => deleteFile(prev, id));
      setSelectedFileId(null);
      addToast("File deleted", "info");
    },
    [addToast]
  );

  const handleViewFile = useCallback(
    (id: string) => {
      const file = state.files[id];
      if (file) {
        setViewingFileId(id);
        setViewingFileName(file.name);
      }
    },
    [state.files]
  );

  const handleCloseViewer = useCallback(() => {
    setViewingFileId(null);
    setViewingFileName(null);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    state,
    currentFolderId,
    setCurrentFolderId,
    selectedFolderId,
    setSelectedFolderId,
    selectedFileId,
    setSelectedFileId,
    renamingFolder,
    renamingFile,
    viewingFileId,
    viewingFileName,
    toasts,
    fileInputRef,
    handleRenameStart,
    handleRenameSubmit,
    handleRenameCancel,
    handleCreateFolder,
    handleUploadClick,
    handleUploadFile,
    handleDeleteFolder,
    handleDeleteFile,
    handleViewFile,
    handleCloseViewer,
    dismissToast,
  };
}
