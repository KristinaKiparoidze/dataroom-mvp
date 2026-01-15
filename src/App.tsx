import { useCallback, useEffect, useMemo, useState } from "react";
import type { Folder } from "./types";
import { useDataRoom } from "./hooks/useDataRoom";
import { useFilters } from "./hooks/useFilters";
import { ToastContainer } from "./components/ToastStack";
import DragDropUpload from "./components/DragDropUpload";
import Breadcrumbs from "./components/Breadcrumbs";
import Toolbar from "./components/Toolbar";
import ItemList from "./components/ItemList";
import FileViewerDialog from "./components/FileViewerDialog";
import ErrorBoundary from "./components/ErrorBoundary";
import CreateFolderDialog from "./components/CreateFolderDialog";
import { SearchIcon } from "./components/Icons";

function App() {
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);

  const {
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
  } = useDataRoom();

  useEffect(() => {
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
  }, []);

  const breadcrumbPath = useMemo(() => {
    const path: Folder[] = [];
    let cursor = state.folders[currentFolderId];

    // Defensive check: ensure current folder exists in state
    if (!cursor) {
      // Fall back to root if current folder is invalid
      cursor = state.folders[state.rootFolderId];
    }

    while (cursor) {
      path.unshift(cursor);
      if (!cursor.parentId) break;
      cursor = state.folders[cursor.parentId];
      // Prevent infinite loops from circular references
      if (!cursor) break;
    }

    return path;
  }, [currentFolderId, state.folders, state.rootFolderId]);

  const foldersInCurrentFolder = useMemo(
    () =>
      Object.values(state.folders).filter(
        (folder) => folder.parentId === currentFolderId
      ),
    [state.folders, currentFolderId]
  );

  const filesInCurrentFolder = useMemo(
    () =>
      Object.values(state.files).filter(
        (file) => file.folderId === currentFolderId
      ),
    [state.files, currentFolderId]
  );

  const {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    visibleFolders,
    visibleFiles,
  } = useFilters(foldersInCurrentFolder, filesInCurrentFolder);

  const canGoBack = currentFolderId !== state.rootFolderId;

  // Memoize event handlers to prevent unnecessary re-renders
  const handleNavigate = useCallback(
    (id: string) => {
      setCurrentFolderId(id);
      setSelectedFileId(null);
      setSelectedFolderId(null);
    },
    [setCurrentFolderId, setSelectedFileId, setSelectedFolderId]
  );

  const handleBack = useCallback(() => {
    const parentId = state.folders[currentFolderId].parentId;
    if (parentId) {
      setCurrentFolderId(parentId);
      setSelectedFolderId(null);
      setSelectedFileId(null);
    }
  }, [
    currentFolderId,
    state.folders,
    setCurrentFolderId,
    setSelectedFolderId,
    setSelectedFileId,
  ]);

  const handleSelectFolder = useCallback(
    (id: string) => {
      setSelectedFolderId(id);
      setSelectedFileId(null);
    },
    [setSelectedFolderId, setSelectedFileId]
  );

  const handleSelectFile = useCallback(
    (id: string) => {
      setSelectedFileId(id);
      setSelectedFolderId(null);
    },
    [setSelectedFileId, setSelectedFolderId]
  );

  const handleOpenFolder = useCallback(
    (id: string) => {
      setCurrentFolderId(id);
      setSelectedFolderId(null);
      setSelectedFileId(null);
    },
    [setCurrentFolderId, setSelectedFolderId, setSelectedFileId]
  );

  const folderViews = useMemo(
    () =>
      visibleFolders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        isOpen: folder.id === currentFolderId,
        isSelected: folder.id === selectedFolderId,
        isRenaming: folder.id === renamingFolder,
      })),
    [visibleFolders, currentFolderId, selectedFolderId, renamingFolder]
  );

  const fileViews = useMemo(
    () =>
      visibleFiles.map((file) => ({
        id: file.id,
        name: file.name,
        isSelected: file.id === selectedFileId,
        isRenaming: file.id === renamingFile,
        size: file.size,
      })),
    [visibleFiles, selectedFileId, renamingFile]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 overflow-y-scroll">
      <ToastContainer />

      <div className="flex-1 py-4 sm:py-6">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-white">
            <div className="px-6 sm:px-8 py-3 border-b border-gray-200">
              <Breadcrumbs
                path={breadcrumbPath.map((folder) => ({
                  id: folder.id,
                  name: folder.name,
                }))}
                onNavigate={handleNavigate}
              />
            </div>

            <Toolbar
              onCreateFolder={() => setShowCreateFolderDialog(true)}
              canGoBack={canGoBack}
              onBack={handleBack}
            />

            <div className="px-6 sm:px-8 py-3 border-b border-gray-200">
              <h1 className="text-lg font-medium text-gray-900">
                {state.folders[currentFolderId]?.name}
              </h1>
            </div>

            <div className="px-6 sm:px-8 py-4 border-b border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <label htmlFor="search-input" className="sr-only">
                    Search files and folders
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search files and folders..."
                    aria-label="Search by name"
                    className="w-full sm:w-72 rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>

                {/* Sort Controls */}
                <div className="relative">
                  <label htmlFor="sort-select" className="sr-only">
                    Sort items
                  </label>
                  <select
                    id="sort-select"
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc" | "default")
                    }
                    className="appearance-none text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="asc">Sort by: Name (A–Z)</option>
                    <option value="desc">Sort by: Name (Z–A)</option>
                  </select>
                  <svg
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-6 border-b border-gray-200">
              <DragDropUpload onUpload={handleUploadFile} />
            </div>

            <div className="overflow-visible">
              <ItemList
                folders={folderViews}
                files={fileViews}
                searchTerm={searchTerm}
                sortOrder={sortOrder}
                currentFolderId={currentFolderId}
                onSelectFolder={handleSelectFolder}
                onSelectFile={handleSelectFile}
                onOpenFolder={handleOpenFolder}
                onRenameStart={handleRenameStart}
                onRenameSubmit={handleRenameSubmit}
                onRenameCancel={handleRenameCancel}
                onDeleteFolder={handleDeleteFolder}
                onDeleteFile={handleDeleteFile}
                onViewFile={handleViewFile}
              />
            </div>
          </div>
        </div>
      </div>

      <ErrorBoundary
        fallback={
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Failed to load file
              </h3>
              <p className="text-gray-600 mb-4">
                There was an error displaying this file. Please try again.
              </p>
              <button
                onClick={handleCloseViewer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <FileViewerDialog
          fileId={viewingFileId}
          fileName={viewingFileName}
          onClose={handleCloseViewer}
        />
      </ErrorBoundary>

      <CreateFolderDialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
        onConfirm={(name) => handleCreateFolder(name)}
      />
    </div>
  );
}

export default App;
