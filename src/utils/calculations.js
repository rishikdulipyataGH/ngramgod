/**
 * Calculates Characters Per Minute (CPM)
 * @param {number} totalCharacters - Total characters typed
 * @param {number} timeInSeconds - Time taken in seconds
 * @returns {number} CPM rounded to nearest integer
 */
export function calculateCPM(totalCharacters, timeInSeconds) {
  if (timeInSeconds === 0) return 0;
  const cpm = (totalCharacters / timeInSeconds) * 60;
  return Math.round(cpm);
}

/**
 * Calculates typing accuracy percentage
 * @param {number} correctChars - Number of correct characters
 * @param {number} totalChars - Total characters typed
 * @returns {number} Accuracy percentage rounded to nearest integer
 */
export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 0;
  const accuracy = (correctChars / totalChars) * 100;
  return Math.round(accuracy);
}

/**
 * Calculates average CPM from an array of CPM values
 * @param {Array<number>} cpmArray - Array of CPM values
 * @returns {number} Average CPM rounded to nearest integer
 */
export function calculateAverageCPM(cpmArray) {
  if (!cpmArray || cpmArray.length === 0) return 0;
  const sum = cpmArray.reduce((a, b) => a + b, 0);
  const average = sum / cpmArray.length;
  return Math.round(average);
}

/**
 * Formats time in seconds to HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [hours, minutes, secs]
    .map(v => v < 10 ? '0' + v : v)
    .join(':');
}

/**
 * Checks if typing meets the minimum thresholds
 * @param {number} cpm - Characters per minute
 * @param {number} accuracy - Accuracy percentage
 * @param {number} minimumCPM - Minimum required CPM
 * @param {number} minimumAccuracy - Minimum required accuracy
 * @returns {boolean} True if thresholds are met
 */
export function meetsThreshold(cpm, accuracy, minimumCPM, minimumAccuracy) {
  return cpm >= minimumCPM && accuracy >= minimumAccuracy;
}
