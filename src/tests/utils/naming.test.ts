import { describe, expect, it, beforeEach } from "vitest";
import {
  generateUniqueFolderName,
  generateUniqueFileName,
} from "../../utils/naming";
import type { DataRoomState } from "../../types";

const createBaseState = (): DataRoomState => ({
  folders: {
    root: {
      id: "root",
      name: "Root",
      parentId: null,
      createdAt: 0,
      updatedAt: 0,
    },
    folder_a: {
      id: "folder_a",
      name: "New Folder",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    },
    folder_b: {
      id: "folder_b",
      name: "New Folder (1)",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    },
  },
  files: {
    file_1: {
      id: "file_1",
      name: "file.pdf",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    },
    file_2: {
      id: "file_2",
      name: "file (1).pdf",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    },
  },
  rootFolderId: "root",
});

// ============================================================================
// FOLDER NAMING TESTS
// ============================================================================

describe("generateUniqueFolderName", () => {
  let state: DataRoomState;

  beforeEach(() => {
    state = createBaseState();
  });

  it("returns base name for unique inputs", () => {
    expect(generateUniqueFolderName(state, "root", "Unique")).toBe("Unique");
  });

  it("increments numbered suffix for duplicates", () => {
    expect(generateUniqueFolderName(state, "root", "New Folder")).toBe(
      "New Folder (2)"
    );
  });

  it("preserves case when incrementing", () => {
    expect(generateUniqueFolderName(state, "root", "new folder")).toBe(
      "new folder (2)"
    );
  });

  it("handles multiple existing increments", () => {
    state.folders.folder_c = {
      id: "folder_c",
      name: "New Folder (2)",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    };
    state.folders.folder_d = {
      id: "folder_d",
      name: "New Folder (3)",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    };
    expect(generateUniqueFolderName(state, "root", "New Folder")).toBe(
      "New Folder (4)"
    );
  });

  it("generates unique names for inputs already containing numbers", () => {
    state.folders.folder_c = {
      id: "folder_c",
      name: "Project (1)",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    };
    expect(generateUniqueFolderName(state, "root", "Project (1)")).toBe(
      "Project (2)"
    );
  });

  it("scopes uniqueness to parent folder", () => {
    state.folders.other_parent = {
      id: "other_parent",
      name: "Other Parent",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    };
    state.folders.other_child = {
      id: "other_child",
      name: "New Folder",
      parentId: "other_parent",
      createdAt: 0,
      updatedAt: 0,
    };

    // In different parent, same name gets (1)
    expect(generateUniqueFolderName(state, "other_parent", "New Folder")).toBe(
      "New Folder (1)"
    );
    // In root, conflicts with existing duplicates
    expect(generateUniqueFolderName(state, "root", "New Folder")).toBe(
      "New Folder (2)"
    );
  });
});

// ============================================================================
// FILE NAMING TESTS
// ============================================================================

describe("generateUniqueFileName", () => {
  let state: DataRoomState;

  beforeEach(() => {
    state = createBaseState();
  });

  it("returns base name for unique file names", () => {
    expect(generateUniqueFileName(state, "root", "unique.pdf")).toBe(
      "unique.pdf"
    );
  });

  it("increments numbered suffix for duplicates with extension", () => {
    expect(generateUniqueFileName(state, "root", "file.pdf")).toBe(
      "file (2).pdf"
    );
  });

  it("increments for duplicates without extension", () => {
    state.files.file_3 = {
      id: "file_3",
      name: "notes",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    };
    expect(generateUniqueFileName(state, "root", "notes")).toBe("notes (1)");
  });

  it("preserves case when incrementing", () => {
    expect(generateUniqueFileName(state, "root", "FILE.PDF")).toBe(
      "FILE (2).PDF"
    );
  });

  it("handles files with multiple dots correctly", () => {
    state.files.file_3 = {
      id: "file_3",
      name: "report.final.pdf",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    };
    expect(generateUniqueFileName(state, "root", "report.final.pdf")).toBe(
      "report.final (1).pdf"
    );
  });

  it("handles multiple existing conflicts", () => {
    state.files.file_3 = {
      id: "file_3",
      name: "file (1).pdf",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    };
    state.files.file_4 = {
      id: "file_4",
      name: "file (2).pdf",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    };
    expect(generateUniqueFileName(state, "root", "file.pdf")).toBe(
      "file (3).pdf"
    );
  });

  it("scopes uniqueness to folder", () => {
    state.folders.other_folder = {
      id: "other_folder",
      name: "Other",
      parentId: "root",
      createdAt: 0,
      updatedAt: 0,
    };
    state.files.file_3 = {
      id: "file_3",
      name: "file.pdf",
      folderId: "other_folder",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    };

    // Different folder, same name gets (1)
    expect(generateUniqueFileName(state, "other_folder", "file.pdf")).toBe(
      "file (1).pdf"
    );
    // Root folder still conflicts with existing file_1
    expect(generateUniqueFileName(state, "root", "file.pdf")).toBe(
      "file (2).pdf"
    );
  });

  it("handles edge case: file named with existing number suffix", () => {
    state.files.file_3 = {
      id: "file_3",
      name: "document (2).pdf",
      folderId: "root",
      size: 100,
      type: "pdf",
      createdAt: 0,
      updatedAt: 0,
    };
    expect(generateUniqueFileName(state, "root", "document (2).pdf")).toBe(
      "document (3).pdf"
    );
  });
});
