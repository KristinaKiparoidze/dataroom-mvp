import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

const mockUUIDs = [
  "test-id-1",
  "test-id-2",
  "test-id-3",
  "test-id-4",
  "test-id-5",
];

let uuidIndex = 0;

beforeEach(() => {
  uuidIndex = 0;
});

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => {
      const id = mockUUIDs[uuidIndex % mockUUIDs.length];
      uuidIndex++;
      return id;
    }),
  },
});
