import { useState, useMemo, useEffect } from "react";
import ReactPaginate from "react-paginate";
import ItemRow from "./ItemRow";
import { ITEMS_PER_PAGE } from "../constants";

type FolderView = {
  id: string;
  name: string;
  isOpen: boolean;
  isSelected: boolean;
  isRenaming: boolean;
};

type FileView = {
  id: string;
  name: string;
  isSelected: boolean;
  isRenaming: boolean;
};

type ItemListProps = {
  folders: FolderView[];
  files: FileView[];
  searchTerm: string;
  sortOrder: "asc" | "desc" | "default";
  onSelectFolder: (id: string) => void;
  onSelectFile: (id: string) => void;
  onOpenFolder: (id: string) => void;
  onRenameStart: (type: "folder" | "file", id: string) => void;
  onRenameSubmit: (
    type: "folder" | "file",
    id: string,
    newName: string
  ) => void;
  onRenameCancel: () => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onViewFile: (id: string) => void;
};

function ItemList({
  folders,
  files,
  searchTerm,
  sortOrder,
  onSelectFolder,
  onSelectFile,
  onOpenFolder,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onDeleteFolder,
  onDeleteFile,
  onViewFile,
}: ItemListProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const allItems = useMemo(() => {
    return [
      ...folders.map((folder) => ({ ...folder, kind: "folder" as const })),
      ...files.map((file) => ({ ...file, kind: "file" as const })),
    ];
  }, [folders, files]);

  // Reset to page 1 when search or sort order change (not when item content changes like rename)
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, sortOrder]);

  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedItems = allItems.slice(startIdx, endIdx);
  const hasItems = totalItems > 0;

  if (!hasItems) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No items yet.
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-gray-100">
        {paginatedItems.map((item) =>
          item.kind === "folder" ? (
            <ItemRow
              key={item.id}
              name={item.name}
              kind="folder"
              isSelected={item.isSelected}
              isRenaming={item.isRenaming}
              onSelect={() => onSelectFolder(item.id)}
              onOpenFolder={() => onOpenFolder(item.id)}
              onRenameStart={() => onRenameStart("folder", item.id)}
              onRenameSubmit={(name) => onRenameSubmit("folder", item.id, name)}
              onRenameCancel={onRenameCancel}
              onDelete={() => onDeleteFolder(item.id)}
            />
          ) : (
            <ItemRow
              key={item.id}
              name={item.name}
              kind="file"
              isSelected={item.isSelected}
              isRenaming={item.isRenaming}
              onSelect={() => onSelectFile(item.id)}
              onView={() => onViewFile(item.id)}
              onRenameStart={() => onRenameStart("file", item.id)}
              onRenameSubmit={(name) => onRenameSubmit("file", item.id, name)}
              onRenameCancel={onRenameCancel}
              onDelete={() => onDeleteFile(item.id)}
            />
          )
        )}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50/50">
          <div
            className="text-sm text-gray-600"
            role="status"
            aria-live="polite"
          >
            Showing {startIdx + 1}–{Math.min(endIdx, totalItems)} of{" "}
            {totalItems} items
          </div>

          <ReactPaginate
            forcePage={currentPage}
            pageCount={totalPages}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={(e) => setCurrentPage(e.selected)}
            containerClassName="flex items-center justify-center gap-2 flex-wrap"
            pageClassName=""
            pageLinkClassName="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            activeClassName=""
            activeLinkClassName="px-3 py-2 rounded-lg bg-blue-600 text-white border border-blue-600 text-sm font-medium cursor-pointer"
            previousClassName=""
            previousLinkClassName="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            nextClassName=""
            nextLinkClassName="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            disabledClassName=""
            disabledLinkClassName="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-400 cursor-not-allowed opacity-50"
            breakClassName=""
            breakLinkClassName="px-2 py-2 text-gray-500"
            previousLabel="← Previous"
            nextLabel="Next →"
            ariaLabelBuilder={(pageIndex) => `Go to page ${pageIndex}`}
            previousAriaLabel="Go to previous page"
            nextAriaLabel="Go to next page"
          />
        </div>
      )}
    </>
  );
}

export default ItemList;
