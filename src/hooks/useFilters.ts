import { useCallback, useMemo, useState } from "react";
import { ONE_DAY_MS, SEVEN_DAYS_MS, THIRTY_DAYS_MS } from "../utils/dates";
import type { FileItem, Folder } from "../types";

export function useFilters(
  foldersInCurrentFolder: Folder[],
  filesInCurrentFolder: FileItem[]
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "folders" | "files">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<"any" | "24h" | "7d" | "30d">(
    "any"
  );

  const searchTermNormalized = searchTerm.trim().toLowerCase();

  const applyDateFilter = useCallback(
    (updatedAt: number) => {
      if (dateFilter === "any") return true;
      const now = Date.now();
      const ageMs = now - updatedAt;
      if (dateFilter === "24h") return ageMs <= ONE_DAY_MS;
      if (dateFilter === "7d") return ageMs <= SEVEN_DAYS_MS;
      return ageMs <= THIRTY_DAYS_MS; // "30d"
    },
    [dateFilter]
  );

  const filteredFolders = useMemo(
    () =>
      foldersInCurrentFolder.filter((folder) => {
        const matchesSearch = searchTermNormalized
          ? folder.name.toLowerCase().includes(searchTermNormalized)
          : true;
        const matchesDate = applyDateFilter(folder.updatedAt);
        return matchesSearch && matchesDate;
      }),
    [foldersInCurrentFolder, searchTermNormalized, applyDateFilter]
  );

  const filteredFiles = useMemo(
    () =>
      filesInCurrentFolder.filter((file) => {
        const matchesSearch = searchTermNormalized
          ? file.name.toLowerCase().includes(searchTermNormalized)
          : true;
        const matchesDate = applyDateFilter(file.updatedAt);
        return matchesSearch && matchesDate;
      }),
    [filesInCurrentFolder, searchTermNormalized, applyDateFilter]
  );

  const visibleFolders = filterType === "files" ? [] : filteredFolders;
  const visibleFiles = filterType === "folders" ? [] : filteredFiles;

  const hasActiveFilters =
    Boolean(searchTermNormalized) ||
    filterType !== "all" ||
    dateFilter !== "any";

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterType("all");
    setDateFilter("any");
  }, []);

  return {
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
  };
}
