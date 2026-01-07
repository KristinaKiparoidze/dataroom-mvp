import { AddIcon, UploadIcon, BackIcon } from "./icons";

type ToolbarProps = {
  onCreateFolder: () => void;
  onUpload: () => void;
  canGoBack: boolean;
  onBack: () => void;
};

function Toolbar({
  onCreateFolder,
  onUpload,
  canGoBack,
  onBack,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2.5 px-5 sm:px-6 py-2.5 border-b border-gray-100 bg-white">
      <button
        onClick={onCreateFolder}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Create new folder"
      >
        <AddIcon className="w-4 h-4" />
        New folder
      </button>

      <button
        onClick={onUpload}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Upload file"
      >
        <UploadIcon className="w-4 h-4" />
        Upload
      </button>

      {canGoBack && (
        <button
          onClick={onBack}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Go back to parent folder"
        >
          <BackIcon className="w-4 h-4 inline mr-1.5" />
          Back
        </button>
      )}
    </div>
  );
}

export default Toolbar;
