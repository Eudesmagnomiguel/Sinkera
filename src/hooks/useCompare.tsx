import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sinkera_compare';
const MAX_COMPARE = 3;

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
  }, [compareIds]);

  const addToCompare = (id: string): boolean => {
    if (compareIds.includes(id)) return true;
    if (compareIds.length >= MAX_COMPARE) return false;
    setCompareIds((prev) => [...prev, id]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setCompareIds((prev) => prev.filter((cid) => cid !== id));
  };

  const clearCompare = () => {
    setCompareIds([]);
  };

  const isInCompare = (id: string): boolean => {
    return compareIds.includes(id);
  };

  return { compareIds, addToCompare, removeFromCompare, clearCompare, isInCompare };
}
