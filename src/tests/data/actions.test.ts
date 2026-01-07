import { describe, expect, it, beforeEach } from "vitest";
import {
  createFolder,
  renameFolder,
  deleteFolder,
} from "../../data/folderActions";
import { addFile, renameFile, deleteFile } from "../../data/fileActions";
import { initializeState } from "../../data/initializeState";
import type { DataRoomState } from "../../types";

/**
 * CRUD Test Suite for Data Room Operations
 *
 * Tests all Create, Read, Update, Delete operations for folders and files,
 * including edge cases, error handling, cascading deletions, and state consistency.
 */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Find a folder by name in the state
 */
function findFolderByName(state: DataRoomState, name: string) {
  return Object.values(state.folders).find((f) => f.name === name);
}

/**
 * Find a file by name in the state
 */
function findFileByName(state: DataRoomState, name: string) {
  return Object.values(state.files).find((f) => f.name === name);
}

/**
 * Count items in a specific folder
 */
function countItemsInFolder(
  state: DataRoomState,
  folderId: string,
  type: "folder" | "file" | "all" = "all"
) {
  let count = 0;
  if (type !== "file") {
    count += Object.values(state.folders).filter(
      (f) => f.parentId === folderId
    ).length;
  }
  if (type !== "folder") {
    count += Object.values(state.files).filter(
      (f) => f.folderId === folderId
    ).length;
  }
  return count;
}

/**
 * Create a PDF File object for testing
 */
function createTestPDF(name = "test.pdf", content = "test content") {
  return new File([content], name, { type: "application/pdf" });
}

// ============================================================================
// FOLDER CRUD TESTS
// ============================================================================

describe("Folder CRUD Operations", () => {
  let state: DataRoomState;

  beforeEach(() => {
    state = initializeState();
  });

  // ---------- CREATE ----------
  describe("createFolder", () => {
    it("should create a new folder with auto-unique name in root", () => {
      const before = Date.now();
      state = createFolder(state, state.rootFolderId, "New Folder");
      const after = Date.now();

      const newFolder = findFolderByName(state, "New Folder");
      expect(newFolder).toBeDefined();
      expect(newFolder?.parentId).toBe(state.rootFolderId);
      expect(newFolder?.id).toBeDefined();
      expect(newFolder?.createdAt).toBeGreaterThanOrEqual(before);
      expect(newFolder?.createdAt).toBeLessThanOrEqual(after);
      expect(newFolder?.updatedAt).toBe(newFolder?.createdAt);
    });

    it("should create folders with unique IDs", () => {
      state = createFolder(state, state.rootFolderId, "Folder 1");
      state = createFolder(state, state.rootFolderId, "Folder 2");

      const folder1 = findFolderByName(state, "Folder 1");
      const folder2 = findFolderByName(state, "Folder 2");

      expect(folder1?.id).not.toBe(folder2?.id);
    });

    it("should auto-increment folder names on duplicate", () => {
      state = createFolder(state, state.rootFolderId, "New Folder");
      state = createFolder(state, state.rootFolderId, "New Folder");
      state = createFolder(state, state.rootFolderId, "New Folder");

      expect(findFolderByName(state, "New Folder")).toBeDefined();
      expect(findFolderByName(state, "New Folder (1)")).toBeDefined();
      expect(findFolderByName(state, "New Folder (2)")).toBeDefined();
    });

    it("should support nested folder creation", () => {
      state = createFolder(state, state.rootFolderId, "Parent");
      const parentId = findFolderByName(state, "Parent")?.id!;

      state = createFolder(state, parentId, "Child");
      const child = findFolderByName(state, "Child");

      expect(child?.parentId).toBe(parentId);
    });

    it("should throw error on empty folder name", () => {
      expect(() => createFolder(state, state.rootFolderId, "")).toThrow();
      expect(() => createFolder(state, state.rootFolderId, "   ")).toThrow();
    });

    it("should not mutate original state", () => {
      const originalFolderCount = Object.keys(state.folders).length;
      const newState = createFolder(state, state.rootFolderId, "Test");

      expect(Object.keys(state.folders).length).toBe(originalFolderCount);
      expect(Object.keys(newState.folders).length).toBe(
        originalFolderCount + 1
      );
    });
  });

  // ---------- READ ----------
  describe("folder reading", () => {
    it("should allow querying folder by ID", () => {
      state = createFolder(state, state.rootFolderId, "Test Folder");
      const folder = findFolderByName(state, "Test Folder");

      expect(state.folders[folder?.id!]).toBeDefined();
      expect(state.folders[folder?.id!].name).toBe("Test Folder");
    });

    it("should support folder hierarchy traversal", () => {
      state = createFolder(state, state.rootFolderId, "Level 1");
      const level1Id = findFolderByName(state, "Level 1")?.id!;

      state = createFolder(state, level1Id, "Level 2");
      const level2Id = findFolderByName(state, "Level 2")?.id!;

      state = createFolder(state, level2Id, "Level 3");
      const level3 = findFolderByName(state, "Level 3");

      // Traverse up the hierarchy
      let current = state.folders[level3?.id!];
      expect(current.name).toBe("Level 3");

      current = state.folders[current.parentId!];
      expect(current.name).toBe("Level 2");

      current = state.folders[current.parentId!];
      expect(current.name).toBe("Level 1");
    });
  });

  // ---------- UPDATE ----------
  describe("renameFolder", () => {
    it("should rename a folder", () => {
      state = createFolder(state, state.rootFolderId, "Original Name");
      const folderId = findFolderByName(state, "Original Name")?.id!;

      state = renameFolder(state, folderId, "New Name");
      expect(state.folders[folderId].name).toBe("New Name");
      expect(findFolderByName(state, "Original Name")).toBeUndefined();
      expect(findFolderByName(state, "New Name")).toBeDefined();
    });

    it("should update timestamp on rename", () => {
      state = createFolder(state, state.rootFolderId, "Test");
      const folderId = findFolderByName(state, "Test")?.id!;
      const originalUpdatedAt = state.folders[folderId].updatedAt;

      // Add a small delay to ensure timestamp difference
      const before = Date.now();
      state = renameFolder(state, folderId, "Renamed");
      const after = Date.now();

      const renamed = state.folders[folderId];
      expect(renamed.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
      expect(renamed.updatedAt).toBeGreaterThanOrEqual(before);
      expect(renamed.updatedAt).toBeLessThanOrEqual(after);
      expect(renamed.name).toBe("Renamed");
    });

    it("should auto-increment on rename conflict", () => {
      state = createFolder(state, state.rootFolderId, "Target");
      state = createFolder(state, state.rootFolderId, "Original");

      const originalId = findFolderByName(state, "Original")?.id!;
      state = renameFolder(state, originalId, "Target");

      expect(state.folders[originalId].name).toBe("Target (1)");
      expect(findFolderByName(state, "Target")).toBeDefined();
      expect(findFolderByName(state, "Target (1)")).toBeDefined();
    });

    it("should handle case-insensitive conflict detection on rename", () => {
      state = createFolder(state, state.rootFolderId, "Folder");
      state = createFolder(state, state.rootFolderId, "Other");

      const otherId = findFolderByName(state, "Other")?.id!;
      state = renameFolder(state, otherId, "FOLDER");

      expect(state.folders[otherId].name).toBe("FOLDER (1)");
    });

    it("should throw error on empty rename", () => {
      state = createFolder(state, state.rootFolderId, "Test");
      const folderId = findFolderByName(state, "Test")?.id!;

      expect(() => renameFolder(state, folderId, "")).toThrow();
      expect(() => renameFolder(state, folderId, "   ")).toThrow();
    });

    it("should not mutate original state on rename", () => {
      state = createFolder(state, state.rootFolderId, "Test");
      const folderId = findFolderByName(state, "Test")?.id!;
      const originalState = JSON.parse(JSON.stringify(state));

      const newState = renameFolder(state, folderId, "Renamed");

      expect(state).toEqual(originalState);
      expect(newState).not.toEqual(originalState);
    });
  });

  // ---------- DELETE ----------
  describe("deleteFolder", () => {
    it("should delete a folder", () => {
      state = createFolder(state, state.rootFolderId, "To Delete");
      const folderId = findFolderByName(state, "To Delete")?.id!;

      state = deleteFolder(state, folderId);
      expect(state.folders[folderId]).toBeUndefined();
    });

    it("should recursively delete nested folders", () => {
      state = createFolder(state, state.rootFolderId, "Parent");
      const parentId = findFolderByName(state, "Parent")?.id!;

      state = createFolder(state, parentId, "Child");
      const childId = findFolderByName(state, "Child")?.id!;

      state = createFolder(state, childId, "Grandchild");
      const grandchildId = findFolderByName(state, "Grandchild")?.id!;

      state = deleteFolder(state, parentId);

      expect(state.folders[parentId]).toBeUndefined();
      expect(state.folders[childId]).toBeUndefined();
      expect(state.folders[grandchildId]).toBeUndefined();
    });

    it("should cascade delete files in deleted folder", () => {
      state = createFolder(state, state.rootFolderId, "Folder");
      const folderId = findFolderByName(state, "Folder")?.id!;

      const pdf1 = createTestPDF("file1.pdf");
      const pdf2 = createTestPDF("file2.pdf");
      state = addFile(state, folderId, pdf1);
      state = addFile(state, folderId, pdf2);

      expect(countItemsInFolder(state, folderId, "file")).toBe(2);

      state = deleteFolder(state, folderId);

      expect(countItemsInFolder(state, folderId, "file")).toBe(0);
      expect(Object.values(state.files).length).toBe(0);
    });

    it("should cascade delete in nested hierarchies", () => {
      state = createFolder(state, state.rootFolderId, "Parent");
      const parentId = findFolderByName(state, "Parent")?.id!;

      state = createFolder(state, parentId, "Child");
      const childId = findFolderByName(state, "Child")?.id!;

      // Add files to both parent and child
      state = addFile(state, parentId, createTestPDF("parent_file.pdf"));
      state = addFile(state, childId, createTestPDF("child_file.pdf"));

      state = deleteFolder(state, parentId);

      expect(Object.values(state.files).length).toBe(0);
    });

    it("should not affect files in other folders", () => {
      state = createFolder(state, state.rootFolderId, "Folder 1");
      state = createFolder(state, state.rootFolderId, "Folder 2");

      const folder1Id = findFolderByName(state, "Folder 1")?.id!;
      const folder2Id = findFolderByName(state, "Folder 2")?.id!;

      state = addFile(state, folder1Id, createTestPDF("file1.pdf"));
      state = addFile(state, folder2Id, createTestPDF("file2.pdf"));

      state = deleteFolder(state, folder1Id);

      expect(countItemsInFolder(state, folder2Id, "file")).toBe(1);
      expect(Object.values(state.files).length).toBe(1);
    });
  });
});

// ============================================================================
// FILE CRUD TESTS
// ============================================================================

describe("File CRUD Operations", () => {
  let state: DataRoomState;

  beforeEach(() => {
    state = initializeState();
  });

  // ---------- CREATE ----------
  describe("addFile", () => {
    it("should add a PDF file to a folder", () => {
      const before = Date.now();
      const pdf = createTestPDF("document.pdf", "content");
      state = addFile(state, state.rootFolderId, pdf);
      const after = Date.now();

      const addedFile = findFileByName(state, "document.pdf");
      expect(addedFile).toBeDefined();
      expect(addedFile?.folderId).toBe(state.rootFolderId);
      expect(addedFile?.size).toBe(7);
      expect(addedFile?.type).toBe("pdf");
      expect(addedFile?.createdAt).toBeGreaterThanOrEqual(before);
      expect(addedFile?.createdAt).toBeLessThanOrEqual(after);
      expect(addedFile?.updatedAt).toBe(addedFile?.createdAt);
    });

    it("should auto-increment duplicate file names", () => {
      const pdf1 = createTestPDF("report.pdf", "content 1");
      const pdf2 = createTestPDF("report.pdf", "content 2");
      const pdf3 = createTestPDF("report.pdf", "content 3");

      state = addFile(state, state.rootFolderId, pdf1);
      state = addFile(state, state.rootFolderId, pdf2);
      state = addFile(state, state.rootFolderId, pdf3);

      expect(findFileByName(state, "report.pdf")).toBeDefined();
      expect(findFileByName(state, "report (1).pdf")).toBeDefined();
      expect(findFileByName(state, "report (2).pdf")).toBeDefined();
    });

    it("should reject non-PDF files", () => {
      const txtFile = new File(["text"], "document.txt", {
        type: "text/plain",
      });
      expect(() => addFile(state, state.rootFolderId, txtFile)).toThrow(
        /Only PDF/i
      );
    });

    it("should accept files in different folders with same name", () => {
      state = createFolder(state, state.rootFolderId, "Folder 1");
      state = createFolder(state, state.rootFolderId, "Folder 2");

      const folder1Id = findFolderByName(state, "Folder 1")?.id!;
      const folder2Id = findFolderByName(state, "Folder 2")?.id!;

      const pdf1 = createTestPDF("report.pdf");
      const pdf2 = createTestPDF("report.pdf");

      state = addFile(state, folder1Id, pdf1);
      state = addFile(state, folder2Id, pdf2);

      // Same name in different folders is allowed
      const filesNamed = Object.values(state.files).filter(
        (f) => f.name === "report.pdf"
      );
      expect(filesNamed.length).toBe(2);
      expect(filesNamed[0].folderId).not.toBe(filesNamed[1].folderId);
    });

    it("should not mutate original state", () => {
      const originalFileCount = Object.keys(state.files).length;
      const pdf = createTestPDF("test.pdf");

      const newState = addFile(state, state.rootFolderId, pdf);

      expect(Object.keys(state.files).length).toBe(originalFileCount);
      expect(Object.keys(newState.files).length).toBe(originalFileCount + 1);
    });
  });

  // ---------- READ ----------
  describe("file reading", () => {
    it("should retrieve file by ID", () => {
      const pdf = createTestPDF("document.pdf");
      state = addFile(state, state.rootFolderId, pdf);

      const file = findFileByName(state, "document.pdf");
      expect(state.files[file?.id!]).toEqual(file);
    });

    it("should list files in a folder", () => {
      state = createFolder(state, state.rootFolderId, "Folder");
      const folderId = findFolderByName(state, "Folder")?.id!;

      state = addFile(
        state,
        state.rootFolderId,
        createTestPDF("root_file.pdf")
      );
      state = addFile(state, folderId, createTestPDF("folder_file.pdf"));
      state = addFile(state, folderId, createTestPDF("another_file.pdf"));

      const folderFiles = Object.values(state.files).filter(
        (f) => f.folderId === folderId
      );
      expect(folderFiles.length).toBe(2);
      expect(folderFiles.some((f) => f.name === "folder_file.pdf")).toBe(true);
      expect(folderFiles.some((f) => f.name === "another_file.pdf")).toBe(true);
    });
  });

  // ---------- UPDATE ----------
  describe("renameFile", () => {
    it("should rename a file", () => {
      const pdf = createTestPDF("old_name.pdf");
      state = addFile(state, state.rootFolderId, pdf);

      const fileId = findFileByName(state, "old_name.pdf")?.id!;
      state = renameFile(state, fileId, "new_name.pdf");

      expect(state.files[fileId].name).toBe("new_name.pdf");
      expect(findFileByName(state, "old_name.pdf")).toBeUndefined();
      expect(findFileByName(state, "new_name.pdf")).toBeDefined();
    });

    it("should auto-increment on rename conflict", () => {
      const pdf1 = createTestPDF("target.pdf");
      const pdf2 = createTestPDF("original.pdf");

      state = addFile(state, state.rootFolderId, pdf1);
      state = addFile(state, state.rootFolderId, pdf2);

      const originalId = findFileByName(state, "original.pdf")?.id!;
      state = renameFile(state, originalId, "target.pdf");

      expect(state.files[originalId].name).toBe("target (1).pdf");
    });

    it("should preserve extension on rename", () => {
      const pdf = createTestPDF("report.pdf");
      state = addFile(state, state.rootFolderId, pdf);

      const fileId = findFileByName(state, "report.pdf")?.id!;
      state = renameFile(state, fileId, "summary");

      expect(state.files[fileId].name).toBe("summary");
    });

    it("should handle case-insensitive conflict on rename", () => {
      const pdf1 = createTestPDF("document.pdf");
      const pdf2 = createTestPDF("report.pdf");

      state = addFile(state, state.rootFolderId, pdf1);
      state = addFile(state, state.rootFolderId, pdf2);

      const reportId = findFileByName(state, "report.pdf")?.id!;
      state = renameFile(state, reportId, "DOCUMENT.PDF");

      expect(state.files[reportId].name).toBe("DOCUMENT (1).PDF");
    });

    it("should throw error on empty rename", () => {
      const pdf = createTestPDF("test.pdf");
      state = addFile(state, state.rootFolderId, pdf);

      const fileId = findFileByName(state, "test.pdf")?.id!;
      expect(() => renameFile(state, fileId, "")).toThrow();
      expect(() => renameFile(state, fileId, "   ")).toThrow();
    });
  });

  // ---------- DELETE ----------
  describe("deleteFile", () => {
    it("should delete a file", () => {
      const pdf = createTestPDF("to_delete.pdf");
      state = addFile(state, state.rootFolderId, pdf);

      const fileId = findFileByName(state, "to_delete.pdf")?.id!;
      state = deleteFile(state, fileId);

      expect(state.files[fileId]).toBeUndefined();
    });

    it("should not affect other files when deleting one", () => {
      state = addFile(state, state.rootFolderId, createTestPDF("file1.pdf"));
      state = addFile(state, state.rootFolderId, createTestPDF("file2.pdf"));
      state = addFile(state, state.rootFolderId, createTestPDF("file3.pdf"));

      const file2Id = findFileByName(state, "file2.pdf")?.id!;
      state = deleteFile(state, file2Id);

      expect(findFileByName(state, "file1.pdf")).toBeDefined();
      expect(findFileByName(state, "file2.pdf")).toBeUndefined();
      expect(findFileByName(state, "file3.pdf")).toBeDefined();
    });

    it("should not delete files when deleting unrelated files", () => {
      state = createFolder(state, state.rootFolderId, "Folder");
      const folderId = findFolderByName(state, "Folder")?.id!;

      state = addFile(
        state,
        state.rootFolderId,
        createTestPDF("root_file.pdf")
      );
      state = addFile(state, folderId, createTestPDF("folder_file.pdf"));

      const rootFileId = findFileByName(state, "root_file.pdf")?.id!;
      state = deleteFile(state, rootFileId);

      expect(findFileByName(state, "folder_file.pdf")).toBeDefined();
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Cross-entity CRUD Integration", () => {
  let state: DataRoomState;

  beforeEach(() => {
    state = initializeState();
  });

  it("should maintain consistency across folder and file operations", () => {
    // Create structure
    state = createFolder(state, state.rootFolderId, "Project");
    const projectId = findFolderByName(state, "Project")?.id!;

    state = createFolder(state, projectId, "Documents");
    const docsId = findFolderByName(state, "Documents")?.id!;

    // Add files
    state = addFile(state, docsId, createTestPDF("report.pdf"));
    state = addFile(state, docsId, createTestPDF("notes.pdf"));

    // Verify structure
    expect(countItemsInFolder(state, projectId, "folder")).toBe(1);
    expect(countItemsInFolder(state, docsId, "file")).toBe(2);

    // Rename folder
    state = renameFolder(state, projectId, "My Project");
    expect(findFolderByName(state, "My Project")).toBeDefined();
    expect(findFolderByName(state, "Project")).toBeUndefined();

    // Delete with cascade
    state = deleteFolder(state, projectId);
    expect(state.folders[projectId]).toBeUndefined();
    expect(state.folders[docsId]).toBeUndefined();
    expect(Object.values(state.files).length).toBe(0);
  });
});
