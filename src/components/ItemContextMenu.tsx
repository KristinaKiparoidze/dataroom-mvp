import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreIcon } from "./Icons";

type ItemContextMenuProps = {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onRename: () => void;
  onDelete: () => void;
};

function ItemContextMenu({
  buttonRef,
  onRename,
  onDelete,
}: ItemContextMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        ref={buttonRef}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-all duration-150 cursor-pointer"
        aria-label="More actions for this item"
      >
        <MoreIcon className="w-4 h-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
        align="end"
      >
        <DropdownMenu.Item
          onClick={onRename}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 cursor-pointer"
        >
          Rename
        </DropdownMenu.Item>

        <DropdownMenu.Item
          onClick={onDelete}
          className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 transition-colors focus:outline-none focus:bg-red-50 cursor-pointer"
        >
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default ItemContextMenu;
