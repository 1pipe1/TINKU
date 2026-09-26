import { create } from "zustand";

interface DraftStore {
  draftCount: number;
  setDraftCount: (count: number) => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draftCount: 0,
  setDraftCount: (count) => set({ draftCount: count }),
}));
