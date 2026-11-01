interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private hits = 0;
  private misses = 0;

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return item.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    let activeEntries = 0;
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now <= item.expiresAt) {
        activeEntries++;
      } else {
        this.cache.delete(key);
      }
    }
    return {
      activeEntries,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + '%' 
        : '0%',
    };
  }
}

export const globalCache = new MemoryCache();
