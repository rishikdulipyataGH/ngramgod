import Papa from 'papaparse';

/**
 * Downloads a CSV file
 * @param {string} csvContent - CSV content as string
 * @param {string} filename - Filename for the download
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exports n-gram data to CSV
 * @param {Object} ngramData - Object containing n-gram arrays or frequency objects
 * @param {string} type - Type of n-grams (bigrams, trigrams, etc.)
 */
export function exportNgramsToCSV(ngramData, type = 'ngrams') {
  const data = [];
  
  if (Array.isArray(ngramData)) {
    // Simple array of n-grams
    ngramData.forEach((ngram, index) => {
      data.push({ rank: index + 1, ngram });
    });
  } else {
    // Object with frequencies
    Object.entries(ngramData).forEach(([ngram, frequency], index) => {
      data.push({ rank: index + 1, ngram, frequency });
    });
  }
  
  const csv = Papa.unparse(data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadCSV(csv, `${type}_${timestamp}.csv`);
}

/**
 * Exports typing session history to CSV
 * @param {Array} sessions - Array of session objects
 */
export function exportSessionHistoryToCSV(sessions) {
  if (!sessions || sessions.length === 0) {
    alert('No session history to export');
    return;
  }
  
  const data = sessions.map((session, index) => ({
    session: index + 1,
    timestamp: session.timestamp || new Date(session.date).toLocaleString(),
    source: session.source || 'unknown',
    lesson: session.lesson || '',
    cpm: session.cpm || 0,
    accuracy: session.accuracy || 0,
    charactersTyped: session.charactersTyped || 0,
    duration: session.duration || 0,
  }));
  
  const csv = Papa.unparse(data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadCSV(csv, `typing_history_${timestamp}.csv`);
}

/**
 * Exports typing statistics summary to CSV
 * @param {Object} stats - Statistics object
 */
export function exportStatsToCSV(stats) {
  const data = [
    { metric: 'Total Sessions', value: stats.totalSessions || 0 },
    { metric: 'Total Characters Typed', value: stats.totalCharacters || 0 },
    { metric: 'Total Time (seconds)', value: stats.totalTime || 0 },
    { metric: 'Average CPM', value: stats.averageCPM || 0 },
    { metric: 'Best CPM', value: stats.bestCPM || 0 },
    { metric: 'Average Accuracy (%)', value: stats.averageAccuracy || 0 },
    { metric: 'Total Lessons Completed', value: stats.lessonsCompleted || 0 },
  ];
  
  const csv = Papa.unparse(data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  downloadCSV(csv, `typing_stats_${timestamp}.csv`);
}

/**
 * Exports all data (n-grams, history, stats) in one go
 * @param {Object} allData - Object containing ngrams, sessions, and stats
 */
export function exportAllData(allData) {
  const { ngrams, sessions, stats } = allData;
  
  // Export each type of data
  if (ngrams) {
    Object.keys(ngrams).forEach(type => {
      if (ngrams[type] && ngrams[type].length > 0) {
        exportNgramsToCSV(ngrams[type], type);
      }
    });
  }
  
  if (sessions && sessions.length > 0) {
    exportSessionHistoryToCSV(sessions);
  }
  
  if (stats) {
    exportStatsToCSV(stats);
  }
}
