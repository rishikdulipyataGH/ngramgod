import { useState, useEffect } from 'react';
import { saveToStorage, loadFromStorage } from '../utils/storage';

/**
 * Custom hook for managing state with localStorage persistence
 * @param {string} key - Storage key (not used with current storage util, but kept for future flexibility)
 * @param {*} defaultValue - Default value if nothing in storage
 * @returns {[value, setValue]} Stateful value and setter function
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stored = loadFromStorage();
    return stored !== null ? stored : defaultValue;
  });

  useEffect(() => {
    saveToStorage(value);
  }, [value]);

  return [value, setValue];
}
