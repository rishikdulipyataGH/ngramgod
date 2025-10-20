/**
 * Shuffles an array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates typing practice phrases from n-grams
 * @param {Array} source - Array of n-grams to use
 * @param {number} scope - Number of n-grams to use from the source (Top 50, 100, etc.)
 * @param {number} combination - Number of n-grams to combine into each phrase
 * @param {number} repetition - Number of times to repeat each combination
 * @returns {Array} Array of generated phrases
 */
export function generatePhrases(source, scope, combination = 2, repetition = 3) {
  if (!source || source.length === 0) {
    return [];
  }

  // Limit scope if specified (Top 50/100/150/200)
  const scopedSource = scope ? source.slice(0, scope) : source;
  
  // Create a copy and shuffle
  const ngrams = [...scopedSource];
  shuffle(ngrams);
  
  const phrases = [];
  let index = 0;
  
  // Generate phrases by combining n-grams
  while (index < ngrams.length) {
    const ngramsSublist = ngrams.slice(index, index + combination);
    
    if (ngramsSublist.length === 0) break;
    
    const subPhrase = ngramsSublist.join(' ');
    
    // Repeat the combination
    const repeatedPhrase = Array(repetition).fill(subPhrase).join(' ');
    phrases.push(repeatedPhrase);
    
    index += combination;
  }
  
  return phrases;
}

/**
 * Gets the appropriate n-gram source based on the source name
 * @param {string} sourceName - Name of the source (bigrams, trigrams, etc.)
 * @param {Object} sources - Object containing all n-gram sources
 * @param {Array} customWords - Custom words array if source is custom
 * @returns {Array} The requested n-gram source
 */
export function getSource(sourceName, sources, customWords = null) {
  if (sourceName === 'custom_words') {
    return customWords || [];
  }
  return sources[sourceName] || [];
}
