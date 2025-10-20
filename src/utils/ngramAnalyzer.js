/**
 * Extracts n-grams of a specified size from text
 * @param {string} text - Input text
 * @param {number} n - Size of n-grams (1 for unigrams, 2 for bigrams, etc.)
 * @returns {Object} Object with n-grams as keys and frequencies as values
 */
export function extractNgrams(text, n) {
  if (!text || n < 1) return {};
  
  // Clean and normalize text
  const cleanedText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (cleanedText.length < n) return {};
  
  const ngrams = {};
  
  if (n === 1) {
    // For unigrams, extract words
    const words = cleanedText.split(' ').filter(word => word.length > 0);
    words.forEach(word => {
      ngrams[word] = (ngrams[word] || 0) + 1;
    });
  } else {
    // For n-grams, extract character sequences
    // Remove spaces for character-level n-grams
    const textNoSpaces = cleanedText.replace(/\s/g, '');
    
    for (let i = 0; i <= textNoSpaces.length - n; i++) {
      const ngram = textNoSpaces.substring(i, i + n);
      ngrams[ngram] = (ngrams[ngram] || 0) + 1;
    }
  }
  
  return ngrams;
}

/**
 * Converts n-gram frequency object to sorted array
 * @param {Object} ngramFrequencies - Object with n-grams and frequencies
 * @param {number} minFrequency - Minimum frequency threshold
 * @returns {Array} Array of [ngram, frequency] tuples sorted by frequency descending
 */
export function sortNgramsByFrequency(ngramFrequencies, minFrequency = 1) {
  return Object.entries(ngramFrequencies)
    .filter(([, freq]) => freq >= minFrequency)
    .sort((a, b) => b[1] - a[1]);
}

/**
 * Generates comprehensive n-gram analysis for text
 * @param {string} text - Input text
 * @returns {Object} Object containing unigrams, bigrams, trigrams, and tetragrams
 */
export function analyzeText(text) {
  return {
    words: extractNgrams(text, 1),
    bigrams: extractNgrams(text, 2),
    trigrams: extractNgrams(text, 3),
    tetragrams: extractNgrams(text, 4),
  };
}

/**
 * Extracts top N n-grams as an array
 * @param {Object} ngramFrequencies - Object with n-grams and frequencies
 * @param {number} topN - Number of top n-grams to extract
 * @returns {Array} Array of top n-grams (just the strings, not frequencies)
 */
export function getTopNgrams(ngramFrequencies, topN = 50) {
  const sorted = sortNgramsByFrequency(ngramFrequencies);
  return sorted.slice(0, topN).map(([ngram]) => ngram);
}
