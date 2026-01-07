import ItemRow from "./ItemRow";

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
  hasAnyItems: boolean;
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
  isFiltered: boolean;
};

function ItemList({
  folders,
  files,
  hasAnyItems,
  onSelectFolder,
  onSelectFile,
  onOpenFolder,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onDeleteFolder,
  onDeleteFile,
  onViewFile,
  isFiltered,
}: ItemListProps) {
  const hasItems = folders.length + files.length > 0;

  if (!hasItems) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        {isFiltered && hasAnyItems
          ? "No items match your filters."
          : "No items yet."}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {folders.map((folder, index) => (
        <ItemRow
          key={folder.id}
          id={folder.id}
          name={folder.name}
          kind="folder"
          isSelected={folder.isSelected}
          isOpen={folder.isOpen}
          isRenaming={folder.isRenaming}
          isLastRow={index === folders.length - 1 && files.length === 0}
          onSelect={() => onSelectFolder(folder.id)}
          onOpenFolder={() => onOpenFolder(folder.id)}
          onRenameStart={() => onRenameStart("folder", folder.id)}
          onRenameSubmit={(name) => onRenameSubmit("folder", folder.id, name)}
          onRenameCancel={onRenameCancel}
          onDelete={() => onDeleteFolder(folder.id)}
        />
      ))}

      {files.map((file, index) => (
        <ItemRow
          key={file.id}
          id={file.id}
          name={file.name}
          kind="file"
          isSelected={file.isSelected}
          isRenaming={file.isRenaming}
          isLastRow={index === files.length - 1}
          onSelect={() => onSelectFile(file.id)}
          onRenameStart={() => onRenameStart("file", file.id)}
          onRenameSubmit={(name) => onRenameSubmit("file", file.id, name)}
          onRenameCancel={onRenameCancel}
          onDelete={() => onDeleteFile(file.id)}
          onView={() => onViewFile(file.id)}
        />
      ))}
    </ul>
  );
}

export default ItemList;
