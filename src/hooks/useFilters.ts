import { useMemo, useState } from "react";
import type { FileItem, Folder } from "../types";

/**
 * Custom hook for managing search and sort filters for folders and files.
 * Provides case-insensitive search and alphabetical sorting capabilities.
 *
 * @param foldersInCurrentFolder - Array of folders in the current directory
 * @param filesInCurrentFolder - Array of files in the current directory
 * @returns Object containing filter state, setters, and filtered results
 */
export function useFilters(
  foldersInCurrentFolder: Folder[],
  filesInCurrentFolder: FileItem[]
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">(
    "default"
  );

  const searchTermNormalized = searchTerm.trim().toLowerCase();

  const filteredFolders = useMemo(() => {
    const filtered = foldersInCurrentFolder.filter((folder) =>
      searchTermNormalized
        ? folder.name.toLowerCase().includes(searchTermNormalized)
        : true
    );

    if (sortOrder === "default") return filtered;

    return filtered.sort((a, b) => {
      const comparison = a.name
        .toLowerCase()
        .localeCompare(b.name.toLowerCase());
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [foldersInCurrentFolder, searchTermNormalized, sortOrder]);

  const filteredFiles = useMemo(() => {
    const filtered = filesInCurrentFolder.filter((file) =>
      searchTermNormalized
        ? file.name.toLowerCase().includes(searchTermNormalized)
        : true
    );

    if (sortOrder === "default") return filtered;

    return filtered.sort((a, b) => {
      const comparison = a.name
        .toLowerCase()
        .localeCompare(b.name.toLowerCase());
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filesInCurrentFolder, searchTermNormalized, sortOrder]);

  const visibleFolders = filteredFolders;
  const visibleFiles = filteredFiles;

  const hasActiveFilters = Boolean(searchTermNormalized);

  return {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    visibleFolders,
    visibleFiles,
    hasActiveFilters,
  };
}
