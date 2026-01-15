import { useEffect } from "react";
import { AddIcon, BackIcon } from "./Icons";

type ToolbarProps = {
  onCreateFolder: () => void;
  canGoBack: boolean;
  onBack: () => void;
};

function Toolbar({ onCreateFolder, canGoBack, onBack }: ToolbarProps) {
  // Keyboard shortcut: Ctrl/Cmd + Shift + N to create new folder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        onCreateFolder();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCreateFolder]);

  return (
    <div className="flex items-center gap-3 px-6 sm:px-8 py-4 border-b border-gray-100 bg-white">
      {canGoBack && (
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 cursor-pointer"
          aria-label="Go back to parent folder"
        >
          <BackIcon className="w-4 h-4 inline mr-1.5 cursor-pointer" />
          Back
        </button>
      )}

      <button
        onClick={onCreateFolder}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ml-auto"
        aria-label="Create new folder (Ctrl+Shift+N)"
        title="Create new folder (Ctrl+Shift+N)"
      >
        <AddIcon className="w-4 h-4" />
        New folder
      </button>
    </div>
  );
}

export default Toolbar;
