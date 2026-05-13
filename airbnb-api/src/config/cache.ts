// Simple in-memory cache for performance optimization
// In production, you'd use Redis, but this works for development

interface CacheItem {
  data: any;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheItem>();

  /**
   * Get cached data by key
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`🎯 Cache HIT: ${key}`);
    return item.data;
  }

  /**
   * Set data in cache with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttlSeconds - Time to live in seconds
   */
  set(key: string, data: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Delete specific cache key
   * @param key - Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cache DELETE: ${key}`);
  }

  /**
   * Delete all cache keys matching a pattern
   * @param pattern - Pattern to match (simple string contains)
   */
  deletePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`🗑️ Cache DELETE (pattern): ${key}`);
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log("🧹 Cache CLEARED");
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const cache = new InMemoryCache();

// Helper functions for common cache operations
export const getCache = (key: string) => cache.get(key);
export const setCache = (key: string, data: any, ttlSeconds: number) => cache.set(key, data, ttlSeconds);
export const deleteCache = (key: string) => cache.delete(key);
export const deleteCachePattern = (pattern: string) => cache.deletePattern(pattern);

// Cache key generators for consistency
export const cacheKeys = {
  listings: (page: number, limit: number, filters?: string) => 
    `listings:${page}:${limit}:${filters || 'all'}`,
  
  listingReviews: (listingId: string, page: number, limit: number) => 
    `listing:${listingId}:reviews:${page}:${limit}`,
  
  listingStats: () => 'stats:listings',
  
  userStats: () => 'stats:users',
  
  searchListings: (query: string) => `search:listings:${query}`,
};