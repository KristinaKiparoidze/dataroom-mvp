import { useEffect, useMemo } from "react";
import type { Folder } from "./types";
import { useDataRoom } from "./hooks/useDataRoom";
import { useFilters } from "./hooks/useFilters";
import Breadcrumbs from "./components/Breadcrumbs";
import Toolbar from "./components/Toolbar";
import ItemList from "./components/ItemList";
import FileViewer from "./components/FileViewer";
import ToastStack from "./components/ToastStack";
import { SearchIcon, CloseIcon } from "./components/icons";

function App() {
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
  } = useDataRoom();

  useEffect(() => {
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
  }, []);

  const breadcrumbPath = useMemo(() => {
    const path: Folder[] = [];
    let cursor = state.folders[currentFolderId];

    while (cursor) {
      path.unshift(cursor);
      if (!cursor.parentId) break;
      cursor = state.folders[cursor.parentId];
    }

    return path;
  }, [currentFolderId, state.folders]);

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
    filterType,
    setFilterType,
    dateFilter,
    setDateFilter,
    visibleFolders,
    visibleFiles,
    hasActiveFilters,
    clearFilters,
  } = useFilters(foldersInCurrentFolder, filesInCurrentFolder);

  const hasAnyItems =
    foldersInCurrentFolder.length + filesInCurrentFolder.length > 0;

  const canGoBack = currentFolderId !== state.rootFolderId;

  const folderViews = visibleFolders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    isOpen: folder.id === currentFolderId,
    isSelected: folder.id === selectedFolderId,
    isRenaming: folder.id === renamingFolder,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  }));

  const fileViews = visibleFiles.map((file) => ({
    id: file.id,
    name: file.name,
    isSelected: file.id === selectedFileId,
    isRenaming: file.id === renamingFile,
    size: file.size,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 overflow-y-scroll">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadFile(file);
          e.target.value = "";
        }}
      />

      <div className="flex-1 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-5 sm:px-6 py-3 border-b border-gray-200">
              <Breadcrumbs
                path={breadcrumbPath.map((folder) => ({
                  id: folder.id,
                  name: folder.name,
                }))}
                onNavigate={(id) => {
                  setCurrentFolderId(id);
                  setSelectedFileId(null);
                  setSelectedFolderId(null);
                }}
              />
            </div>

            <Toolbar
              onCreateFolder={handleCreateFolder}
              onUpload={handleUploadClick}
              canGoBack={canGoBack}
              onBack={() => {
                const parentId = state.folders[currentFolderId].parentId;
                if (parentId) {
                  setCurrentFolderId(parentId);
                  setSelectedFolderId(null);
                  setSelectedFileId(null);
                }
              }}
            />

            <div className="px-5 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <h1 className="text-lg font-semibold text-gray-900">
                {state.folders[currentFolderId]?.name}
              </h1>
            </div>

            <div className="px-5 sm:px-6 py-3 border-b border-gray-200 bg-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    aria-label="Search by name"
                    className="w-full sm:w-64 rounded-full border border-gray-300 bg-gray-50 pl-9 pr-3 py-1.5 text-sm text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(
                        e.target.value as "all" | "folders" | "files"
                      )
                    }
                    aria-label="Filter by item type"
                    className="flex-1 sm:flex-none px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-500 cursor-pointer transition-all"
                  >
                    <option value="all">All</option>
                    <option value="folders">Folders</option>
                    <option value="files">Files</option>
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(
                        e.target.value as "any" | "24h" | "7d" | "30d"
                      )
                    }
                    aria-label="Filter by last updated"
                    className="flex-1 sm:flex-none px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-500 cursor-pointer transition-all"
                  >
                    <option value="any">Any time</option>
                    <option value="24h">Last 24h</option>
                    <option value="7d">Last 7d</option>
                    <option value="30d">Last 30d</option>
                  </select>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300 ${
                      hasActiveFilters
                        ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        : "text-transparent pointer-events-none"
                    }`}
                    aria-label="Clear all filters"
                    title="Clear filters"
                    disabled={!hasActiveFilters}
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-visible">
              <ItemList
                folders={folderViews}
                files={fileViews}
                hasAnyItems={hasAnyItems}
                onSelectFolder={(id) => {
                  setSelectedFolderId(id);
                  setSelectedFileId(null);
                }}
                onSelectFile={(id) => {
                  setSelectedFileId(id);
                  setSelectedFolderId(null);
                }}
                onOpenFolder={(id) => {
                  setCurrentFolderId(id);
                  setSelectedFolderId(null);
                  setSelectedFileId(null);
                }}
                onRenameStart={handleRenameStart}
                onRenameSubmit={handleRenameSubmit}
                onRenameCancel={handleRenameCancel}
                onDeleteFolder={handleDeleteFolder}
                onDeleteFile={handleDeleteFile}
                onViewFile={handleViewFile}
                isFiltered={hasActiveFilters}
              />
            </div>
          </div>
        </div>
      </div>

      <FileViewer
        fileId={viewingFileId}
        fileName={viewingFileName}
        onClose={handleCloseViewer}
      />
    </div>
  );
}

export default App;
