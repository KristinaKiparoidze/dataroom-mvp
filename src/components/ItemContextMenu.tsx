import { MoreIcon } from "./icons";
type ItemContextMenuProps = {
  isOpen: boolean;
  isLastRow: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: (e: React.MouseEvent) => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
};

function ItemContextMenu({
  isOpen,
  isLastRow,
  buttonRef,
  onToggle,
  onRename,
  onDelete,
  onClose,
}: ItemContextMenuProps) {
  const menuPositionClass = isLastRow ? "bottom-8" : "top-8";
  return (
    <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-all duration-150"
        aria-label="More actions for this item"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              onClose();
            }}
            role="presentation"
          />
          <div
            role="menu"
            className={`absolute right-0 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 ${menuPositionClass}`}
          >
            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onRename();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
            >
              Rename
            </button>
            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ItemContextMenu;
