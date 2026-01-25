"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type HeaderState = {
  title?: string;
  subtitle?: string;
};

type HeaderContextValue = {
  header: HeaderState;
  setHeader: (next: HeaderState) => void;
  clearHeader: () => void;
};

const HeaderContext = createContext<HeaderContextValue | null>(null);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeaderState] = useState<HeaderState>({});

  const setHeader = useCallback((next: HeaderState) => {
    setHeaderState(next);
  }, []);

  const clearHeader = useCallback(() => {
    setHeaderState({});
  }, []);

  const value = useMemo(
    () => ({
      header,
      setHeader,
      clearHeader,
    }),
    [header, setHeader, clearHeader]
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}
