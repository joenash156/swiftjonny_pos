import React, { createContext, useContext, useState } from "react";

interface SidebarContextValue {
  isOpen: boolean;       // mobile: sidebar visible or not
  isCollapsed: boolean;  // desktop: collapsed to icons-only
  toggleOpen: () => void;
  toggleCollapsed: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{ isOpen, isCollapsed, toggleOpen, toggleCollapsed, closeSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};
