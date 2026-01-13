import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { DataRoomState } from "../types";
import { loadState, saveState } from "../data/dataService";
import { initializeState } from "../data/initializeState";
import {
  MAX_FILE_SIZE,
  TOAST_DURATION_SUCCESS,
  TOAST_DURATION_ERROR,
} from "../constants";
import {
  createFolder,
  renameFolder,
  deleteFolder,
} from "../data/folderActions";
import { addFile, renameFile, deleteFile } from "../data/fileActions";

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
  const saveErrorShownRef = useRef(false);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "loading" = "success") => {
      const duration =
        type === "success" ? TOAST_DURATION_SUCCESS : TOAST_DURATION_ERROR;
      toast[type](message, { duration });
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

  const handleUploadFile = useCallback(
    async (file: File) => {
      // Check file type
      if (file.type !== "application/pdf") {
        addToast("Only PDF files are supported", "error");
        console.error("[Upload] Invalid file type:", {
          fileName: file.name,
          fileType: file.type,
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        addToast(
          `File too large (${(file.size / 1024 / 1024).toFixed(
            1
          )}MB). Maximum size is 5MB.`,
          "error"
        );
        console.error("[Upload] File size exceeded:", {
          fileName: file.name,
          size: file.size,
          limit: MAX_FILE_SIZE,
        });
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = () => {
          let newFileId: string | undefined;
          try {
            const base64 = (reader.result as string).split(",")[1];

            // Pre-flight check: try storing temporarily
            const tempFileId = `temp-${Date.now()}-${Math.random()}`;
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
                console.error("[Upload] Storage quota exceeded:", {
                  fileName: file.name,
                  size: file.size,
                });
                return;
              }
              console.error(
                "[Upload] Storage error during pre-flight check:",
                storageErr
              );
              throw storageErr;
            }

            setState((prev) => {
              const newState = addFile(prev, currentFolderId, file);
              newFileId = Object.keys(newState.files).find(
                (id) => !prev.files[id]
              );
              if (newFileId) {
                try {
                  localStorage.setItem(`file-${newFileId}`, base64);
                } catch (storageErr) {
                  // Cleanup: Remove file from state if storage fails
                  console.error(
                    "[Upload] Failed to store file data:",
                    storageErr,
                    { fileId: newFileId }
                  );
                  throw storageErr;
                }
              }
              return newState;
            });
            addToast(`Uploaded ${file.name}`, "success");
            console.info("[Upload] Success:", {
              fileName: file.name,
              fileId: newFileId,
            });
          } catch (err) {
            // Cleanup: Remove orphaned localStorage entry if state update failed
            if (newFileId) {
              try {
                localStorage.removeItem(`file-${newFileId}`);
                console.info("[Upload] Cleaned up orphaned file:", newFileId);
              } catch (cleanupErr) {
                console.error(
                  "[Upload] Failed to cleanup orphaned file:",
                  cleanupErr
                );
              }
            }
            addToast("Failed to store file", "error");
            console.error("[Upload] Upload failed:", err, {
              fileName: file.name,
            });
          }
        };
        reader.onerror = (err) => {
          addToast("Failed to read file", "error");
          console.error("[Upload] FileReader error:", err, {
            fileName: file.name,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        addToast((error as Error).message, "error");
        console.error("[Upload] Unexpected error:", error, {
          fileName: file.name,
        });
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
      addToast("Folder deleted");
    },
    [currentFolderId, state.folders, state.files, addToast]
  );

  const handleDeleteFile = useCallback(
    (id: string) => {
      localStorage.removeItem(`file-${id}`);
      setState((prev) => deleteFile(prev, id));
      setSelectedFileId(null);
      addToast("File deleted");
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
    handleRenameStart,
    handleRenameSubmit,
    handleRenameCancel,
    handleCreateFolder,
    handleUploadFile,
    handleDeleteFolder,
    handleDeleteFile,
    handleViewFile,
    handleCloseViewer,
  };
}
