import { useCallback, useEffect, useRef, useState } from "react";
import { FolderIcon, FileIcon, EyeIcon } from "./icons";
import ItemContextMenu from "./ItemContextMenu";

type ItemRowProps = {
  id: string;
  name: string;
  kind: "folder" | "file";
  isSelected: boolean;
  isOpen?: boolean;
  isRenaming: boolean;
  isLastRow?: boolean;
  size?: number;
  createdAt?: number;
  updatedAt?: number;
  onSelect: () => void;
  onOpenFolder?: () => void;
  onRenameStart: () => void;
  onRenameSubmit: (newName: string) => void;
  onRenameCancel: () => void;
  onDelete: () => void;
  onView?: () => void;
};

function ItemRow({
  name,
  kind,
  isSelected,
  isRenaming,
  isLastRow = false,
  onSelect,
  onOpenFolder,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
  onView,
}: ItemRowProps) {
  const isFolder = kind === "folder";
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState(name);

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

  return (
    <li
      onClick={() => !isRenaming && onSelect()}
      onDoubleClick={() => {
        if (isRenaming) return;
        if (isFolder && onOpenFolder) {
          onOpenFolder();
        } else if (!isFolder && onView) {
          onView();
        }
      }}
      onKeyDown={(e) => {
        if (isRenaming) return;
        if (e.key === "Enter") {
          if (isFolder && onOpenFolder) {
            onOpenFolder();
          } else if (!isFolder && onView) {
            onView();
          }
        }
      }}
      tabIndex={isRenaming ? -1 : 0}
      className={`group flex items-center gap-3 h-14 px-4 cursor-pointer ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-5 h-5 text-gray-600">
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
          />
        ) : (
          <p className="truncate text-sm text-left" title={name}>
            {name}
          </p>
        )}
      </div>

      {!isRenaming && (
        <div className="relative flex items-center gap-1">
          {!isFolder && onView && (
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
            isOpen={menuOpen}
            isLastRow={isLastRow}
            buttonRef={menuButtonRef}
            onToggle={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            onRename={() => {
              setMenuOpen(false);
              onRenameStart();
            }}
            onDelete={() => {
              setMenuOpen(false);
              onDelete();
            }}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}
    </li>
  );
}

export default ItemRow;
