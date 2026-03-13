// Utility for managing dropdown options cache on client side
const CACHE_KEY_PREFIX = 'dropdown_cache_';
const MAX_CACHED_OPTIONS = 10;

export const getCachedOptions = (dropdownName) => {
  if (typeof window === 'undefined') return [];

  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${dropdownName}`);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error reading dropdown cache:', error);
    return [];
  }
};

export const addToCache = (dropdownName, value) => {
  if (typeof window === 'undefined' || !value || value.trim() === '') return;

  try {
    const cached = getCachedOptions(dropdownName);
    const trimmedValue = value.trim();

    // Remove if already exists (to move to front)
    const filtered = cached.filter(item => item !== trimmedValue);

    // Add to front and limit size
    const updated = [trimmedValue, ...filtered].slice(0, MAX_CACHED_OPTIONS);

    localStorage.setItem(`${CACHE_KEY_PREFIX}${dropdownName}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating dropdown cache:', error);
  }
};

export const combineOptions = (defaultOptions, cachedOptions) => {
  // Create a set of default options for quick lookup
  const defaultSet = new Set(defaultOptions);

  // Filter cached options to exclude defaults and duplicates
  const uniqueCached = cachedOptions.filter(option => !defaultSet.has(option));

  // Return defaults first, then cached options
  return [...defaultOptions, ...uniqueCached];
};

export const clearCache = (dropdownName = null) => {
  if (typeof window === 'undefined') return;

  try {
    if (dropdownName) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${dropdownName}`);
    } else {
      // Clear all dropdown caches
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_KEY_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error clearing dropdown cache:', error);
  }
};