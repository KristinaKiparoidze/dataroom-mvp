import { useCallback, useEffect, useRef, useState } from "react";
import { FolderIcon, FileIcon, EyeIcon } from "./Icons";
import ItemContextMenu from "./ItemContextMenu";
import ConfirmDialog from "./ConfirmDialog";

// Base props shared by both folder and file rows
type BaseItemRowProps = {
  name: string;
  isSelected: boolean;
  isRenaming: boolean;
  onSelect: () => void;
  onRenameStart: () => void;
  onRenameSubmit: (newName: string) => void;
  onRenameCancel: () => void;
  onDelete: () => void;
};

// Discriminated union: Folder rows MUST have onOpenFolder, File rows MUST have onView
type FolderRowProps = BaseItemRowProps & {
  kind: "folder";
  onOpenFolder: () => void;
  onView?: never;
};

type FileRowProps = BaseItemRowProps & {
  kind: "file";
  onView: () => void;
  onOpenFolder?: never;
};

type ItemRowProps = FolderRowProps | FileRowProps;

function ItemRow({
  name,
  kind,
  isSelected,
  isRenaming,
  onSelect,
  onOpenFolder,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
  onView,
}: ItemRowProps) {
  const isFolder = kind === "folder";
  const [draft, setDraft] = useState(name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => {
        setDraft(name);
        inputRef.current?.select();
      }, 0);
    }
  }, [isRenaming, name]);

  const submitRename = useCallback(() => {
    const next = draft.trim();
    if (next) {
      onRenameSubmit(next);
    } else {
      onRenameCancel();
    }
  }, [draft, onRenameSubmit, onRenameCancel]);

  const handleActivate = useCallback(() => {
    if (isRenaming) return;
    if (kind === "folder") {
      onOpenFolder();
    } else {
      onView();
    }
  }, [isRenaming, kind, onOpenFolder, onView]);

  return (
    <li
      onClick={() => !isRenaming && onSelect()}
      onDoubleClick={handleActivate}
      onKeyDown={(e) => {
        if (isRenaming) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      tabIndex={isRenaming ? -1 : 0}
      role="button"
      aria-label={`${isFolder ? "Folder" : "File"}: ${name}${
        isSelected ? " (selected)" : ""
      }`}
      className={`group flex items-center gap-4 h-16 px-6 sm:px-8 cursor-pointer transition-colors select-none ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-5 h-5 text-gray-600 flex-shrink-0">
        {isFolder ? <FolderIcon /> : <FileIcon />}
      </div>

      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") onRenameCancel();
            }}
            onBlur={submitRename}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label={`Rename ${isFolder ? "folder" : "file"}`}
            aria-describedby="rename-instructions"
          />
        ) : (
          <p className="truncate text-sm text-left" title={name}>
            {name}
          </p>
        )}
      </div>
      <span id="rename-instructions" className="sr-only">
        Press Enter to save, Escape to cancel
      </span>

      {!isRenaming && (
        <div className="relative flex items-center gap-1">
          {kind === "file" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-150 opacity-0 group-hover:opacity-100"
              aria-label="View file"
              title="View file"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          <ItemContextMenu
            buttonRef={menuButtonRef}
            onRename={onRenameStart}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete ${isFolder ? "Folder" : "File"}?`}
        description={
          isFolder
            ? `Are you sure you want to delete "${name}" and all its contents? This action cannot be undone.`
            : `Are you sure you want to delete "${name}"? This action cannot be undone.`
        }
        onConfirm={onDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </li>
  );
}

export default ItemRow;
