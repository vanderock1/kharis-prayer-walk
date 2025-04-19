// Map data caching utility

interface MapDataCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// In-memory cache for map data
const memoryCache: MapDataCache = {};

// Cache expiry time (24 hours)
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000;

/**
 * Set data in the map cache
 */
export const setMapCache = (key: string, data: any): void => {
  memoryCache[key] = {
    data,
    timestamp: Date.now()
  };
};

/**
 * Get data from the map cache
 */
export const getMapCache = (key: string): any => {
  const cachedItem = memoryCache[key];
  
  if (!cachedItem) {
    return null;
  }
  
  // Check if cache is expired
  if (Date.now() - cachedItem.timestamp > CACHE_EXPIRY_TIME) {
    delete memoryCache[key];
    return null;
  }
  
  return cachedItem.data;
};

/**
 * Clear specific cache entry
 */
export const clearMapCache = (key: string): void => {
  delete memoryCache[key];
};

/**
 * Clear all cache entries
 */
export const clearAllMapCache = (): void => {
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
};