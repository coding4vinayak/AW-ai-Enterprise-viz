import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FilterEntry {
  field: string;
  value: any;
}

interface CrossFilterContextValue {
  activeFilters: Record<string, FilterEntry>;
  applyFilter: (chartId: string, field: string, value: any) => void;
  clearFilter: (chartId: string) => void;
  clearAll: () => void;
}

const CrossFilterContext = createContext<CrossFilterContextValue | null>(null);

interface CrossFilterProviderProps {
  children: ReactNode;
}

export function CrossFilterProvider({ children }: CrossFilterProviderProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterEntry>>({});

  const applyFilter = useCallback((chartId: string, field: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [chartId]: { field, value },
    }));
  }, []);

  const clearFilter = useCallback((chartId: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[chartId];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setActiveFilters({});
  }, []);

  return (
    <CrossFilterContext.Provider value={{ activeFilters, applyFilter, clearFilter, clearAll }}>
      {children}
    </CrossFilterContext.Provider>
  );
}

export function useCrossFilter(): CrossFilterContextValue {
  const context = useContext(CrossFilterContext);
  if (!context) {
    throw new Error('useCrossFilter must be used within a CrossFilterProvider');
  }
  return context;
}
