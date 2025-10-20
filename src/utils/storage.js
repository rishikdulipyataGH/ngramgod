const STORAGE_KEY = 'ngramgod_data';
const VERSION = 1.0;

/**
 * Saves data to localStorage with error handling
 * @param {Object} data - Data to save
 * @returns {boolean} True if successful, false otherwise
 */
export function saveToStorage(data) {
  try {
    const dataWithVersion = {
      version: VERSION,
      data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithVersion));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Some data may not be saved.');
    }
    return false;
  }
}

/**
 * Loads data from localStorage with error handling
 * @returns {Object|null} Loaded data or null if not found/error
 */
export function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Check version compatibility
    if (parsed.version !== VERSION) {
      console.warn('Data version mismatch. Clearing old data.');
      clearStorage();
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Clears all data from localStorage
 * @returns {boolean} True if successful
 */
export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Checks if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
