import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FilterState {
  searchQuery: string;
  selectedSection: string;
  selectedPriority: string;
  selectedFramework: string;
  expandedId: string | null;
}

export interface ProgramStoreState extends FilterState {
  // Checklist State
  checkedMap: Record<string, boolean>;
  toggleItem: (id: string) => void;
  setCheckedMap: (map: Record<string, boolean>) => void;
  selectAll: (itemIds: string[]) => void;
  clearAll: () => void;

  // Filter Actions
  setSearchQuery: (query: string) => void;
  setSelectedSection: (section: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSelectedFramework: (framework: string) => void;
  setExpandedId: (id: string | null) => void;
  resetFilters: () => void;

  // Theme State
  theme: "dark" | "light" | "system";
  setTheme: (theme: "dark" | "light" | "system") => void;
}

const initialFilters: FilterState = {
  searchQuery: "",
  selectedSection: "All",
  selectedPriority: "All",
  selectedFramework: "All",
  expandedId: null,
};

export const useProgramStore = create<ProgramStoreState>()(
  persist(
    (set) => ({
      ...initialFilters,
      checkedMap: {},
      theme: "dark",

      toggleItem: (id: string) =>
        set((state) => ({
          checkedMap: {
            ...state.checkedMap,
            [id]: !state.checkedMap[id],
          },
        })),

      setCheckedMap: (checkedMap: Record<string, boolean>) =>
        set({ checkedMap }),

      selectAll: (itemIds: string[]) =>
        set(() => {
          const all: Record<string, boolean> = {};
          for (const id of itemIds) {
            all[id] = true;
          }
          return { checkedMap: all };
        }),

      clearAll: () => set({ checkedMap: {} }),

      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
      setSelectedSection: (selectedSection: string) => set({ selectedSection }),
      setSelectedPriority: (selectedPriority: string) => set({ selectedPriority }),
      setSelectedFramework: (selectedFramework: string) => set({ selectedFramework }),
      setExpandedId: (expandedId: string | null) => set({ expandedId }),
      resetFilters: () => set(initialFilters),

      setTheme: (theme: "dark" | "light" | "system") => set({ theme }),
    }),
    {
      name: "ipp_blueprint_unified_state_v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : dummyStorage)),
      partialize: (state) => ({
        checkedMap: state.checkedMap,
        theme: state.theme,
        selectedSection: state.selectedSection,
        selectedPriority: state.selectedPriority,
        selectedFramework: state.selectedFramework,
      }),
    }
  )
);

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
