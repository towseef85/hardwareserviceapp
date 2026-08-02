import {create} from "zustand"

type SidebarState={
    isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,

  toggleCollapsed: () =>
    set((state) => ({
      isCollapsed: !state.isCollapsed,
    })),

  openMobileSidebar: () =>
    set({
      isMobileOpen: true,
    }),

  closeMobileSidebar: () =>
    set({
      isMobileOpen: false,
    }),
}));