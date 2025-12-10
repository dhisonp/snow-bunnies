interface CacheItem<T> {
  value: T;
  expiry: number;
}

export const Cache = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T, ttlSeconds: number): void => {
    if (typeof window === "undefined") return;
    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};
