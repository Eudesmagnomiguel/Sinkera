import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sinkera_recently_viewed';
const MAX_ITEMS = 10;

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [productIds, setProductIds] = useState<string[]>(() => readFromStorage());

  const addProduct = useCallback((id: string) => {
    setProductIds(prev => {
      // Remove duplicate, add to front, trim to max
      const updated = [id, ...prev.filter(p => p !== id)].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // storage unavailable — ignore
      }
      return updated;
    });
  }, []);

  return { productIds, addProduct };
}
