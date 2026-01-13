import type { DataRoomState } from "../types";
import { STORAGE_KEY } from "../constants";

export const saveState = (state: DataRoomState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): DataRoomState | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as DataRoomState;
  } catch {
    return null;
  }
};
