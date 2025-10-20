import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import { words } from './data/words';
import { bigrams } from './data/bigrams';
import { trigrams } from './data/trigrams';
import { tetragrams } from './data/tetragrams';
import { generatePhrases, getSource } from './utils/phraseGenerator';
import { calculateCPM, calculateAccuracy, calculateAverageCPM, formatTime, meetsThreshold } from './utils/calculations';
import { analyzeText, sortNgramsByFrequency } from './utils/ngramAnalyzer';
import { exportNgramsToCSV, exportSessionHistoryToCSV, exportStatsToCSV } from './utils/csvExporter';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTimer } from './hooks/useTimer';
import { playSuccessSound, playErrorSound, playIncorrectSound, playCelebrationSound } from './utils/soundEffects';

const DEFAULT_STATE = {
  source: 'bigrams',
  customWords: null,
  practiceMode: false,
  soundEnabled: true,
  theme: 'dark',
  settings: {
    bigrams: { scope: 50, combination: 2, repetition: 3, minimumCPM: 200, minimumAccuracy: 100, CPMs: [], phrases: [], currentIndex: 0 },
    trigrams: { scope: 50, combination: 2, repetition: 3, minimumCPM: 200, minimumAccuracy: 100, CPMs: [], phrases: [], currentIndex: 0 },
    tetragrams: { scope: 50, combination: 2, repetition: 3, minimumCPM: 200, minimumAccuracy: 100, CPMs: [], phrases: [], currentIndex: 0 },
    words: { scope: 50, combination: 2, repetition: 3, minimumCPM: 200, minimumAccuracy: 100, CPMs: [], phrases: [], currentIndex: 0 },
    custom_words: { scope: null, combination: 2, repetition: 3, minimumCPM: 200, minimumAccuracy: 100, CPMs: [], phrases: [], currentIndex: 0 },
  },
  sessionHistory: [],
  totalStats: {
    totalSessions: 0,
    totalCharacters: 0,
    totalTime: 0,
    bestCPM: 0,
    lessonsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
};

function App() {
  const [appState, setAppState] = useLocalStorage('ngramgod', DEFAULT_STATE);
  const [source, setSource] = useState(appState.source);
  const [customWords, setCustomWords] = useState(appState.customWords);
  const [settings, setSettings] = useState(appState.settings);
  
  // Typing state
  const [expectedPhrase, setExpectedPhrase] = useState('');
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isInputCorrect, setIsInputCorrect] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [currentCPM, setCurrentCPM] = useState(0);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  
  // Modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showNgramGenerator, setShowNgramGenerator] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [generatorInput, setGeneratorInput] = useState('');
  const [generatedNgrams, setGeneratedNgrams] = useState(null);
  const [practiceMode, setPracticeMode] = useState(appState.practiceMode || false);
  const [soundEnabled, setSoundEnabled] = useState(appState.soundEnabled !== undefined ? appState.soundEnabled : true);
  const [showLiveStats, setShowLiveStats] = useState(true);
  const [theme, setTheme] = useState(appState.theme || 'dark');
  
  // Timer
  const timer = useTimer();
  
  // Refs
  const inputRef = useRef(null);
  
  // Get current settings for active source
  const currentSettings = settings[source];
  
  // N-gram sources
  const ngramSources = { bigrams, trigrams, tetragrams, words };
  
  // Calculate average CPM
  const averageCPM = useMemo(() => 
    calculateAverageCPM(currentSettings.CPMs),
    [currentSettings.CPMs]
  );
  
  // Generate phrases when source or settings change
  useEffect(() => {
    if (currentSettings.phrases.length === 0 || currentSettings.currentIndex === 0) {
      refreshPhrases();
    } else {
      setExpectedPhrase(currentSettings.phrases[currentSettings.currentIndex]);
    }
  }, [source]);
  
  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Save app state
  useEffect(() => {
    setAppState({
      ...appState,
      source,
      customWords,
      settings,
      practiceMode,
      soundEnabled,
      theme,
    });
  }, [source, customWords, settings, practiceMode, soundEnabled, theme]);
  
  // Auto-focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        // If help modal is open, close it
        if (showHelpModal) {
          setShowHelpModal(false);
        }
        // If no modals are open, open help modal
        else if (!showCustomModal && !showNgramGenerator && !showExportModal) {
          setShowHelpModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showHelpModal, showCustomModal, showNgramGenerator, showExportModal]);

  // Update live stats continuously while typing
  useEffect(() => {
    if (!startTime || !timer.isRunning) return;

    const interval = setInterval(() => {
      const trimmedValue = typedPhrase.trimStart();
      if (trimmedValue.length > 0) {
        const currentTime = Date.now();
        const timeInSeconds = (currentTime - startTime) / 1000;
        
        const charsTyped = trimmedValue.length;
        const liveCPM = calculateCPM(charsTyped, timeInSeconds);
        setCurrentCPM(liveCPM);
        
        let correctChars = 0;
        for (let i = 0; i < trimmedValue.length; i++) {
          if (trimmedValue[i] === expectedPhrase[i]) {
            correctChars++;
          }
        }
        const liveAccuracy = calculateAccuracy(correctChars, charsTyped);
        setCurrentAccuracy(liveAccuracy);
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [startTime, timer.isRunning, typedPhrase, expectedPhrase]);
  
  const refreshPhrases = (overrideSettings = {}) => {
    let sourceData;
    
    // For custom words, just use the array directly
    if (source === 'custom_words' && customWords) {
      sourceData = customWords;
    } else {
      sourceData = getSource(source, ngramSources, customWords);
    }
    
    // Use override settings if provided, otherwise use current settings
    const effectiveScope = overrideSettings.scope ?? currentSettings.scope;
    const effectiveCombination = overrideSettings.combination ?? currentSettings.combination;
    const effectiveRepetition = overrideSettings.repetition ?? currentSettings.repetition;
    
    const newPhrases = generatePhrases(
      sourceData,
      effectiveScope,
      effectiveCombination,
      effectiveRepetition
    );
    
    setSettings(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        phrases: newPhrases,
        currentIndex: 0,
      },
    }));
    
    setExpectedPhrase(newPhrases[0] || '');
    resetCurrentPhraseMetrics();
  };
  
  const resetCurrentPhraseMetrics = () => {
    setTypedPhrase('');
    setIsInputCorrect(true);
    setCurrentCPM(0);
    setCurrentAccuracy(0);
    setStartTime(null);
    // Keep timer running - don't reset
  };
  
  const resetPhraseOnly = () => {
    setTypedPhrase('');
    setIsInputCorrect(true);
    setCurrentCPM(0);
    setCurrentAccuracy(0);
    setStartTime(null);
    // Don't reset timer - keep it running
  };
  
  const handleTyping = (e) => {
    const value = e.target.value;
    const trimmedValue = value.trimStart();
    
    // Start timer on first character
    if (trimmedValue.length === 1 && !startTime) {
      setStartTime(Date.now());
      timer.start();
    }
    
    // If we have a start time, calculate live stats
    if (startTime && trimmedValue.length > 0) {
      const currentTime = Date.now();
      const timeInSeconds = (currentTime - startTime) / 1000;
      
      // Calculate live CPM based on characters typed so far
      const charsTyped = trimmedValue.length;
      const liveCPM = calculateCPM(charsTyped, timeInSeconds);
      setCurrentCPM(liveCPM);
      
      // Calculate live accuracy
      let correctChars = 0;
      for (let i = 0; i < trimmedValue.length; i++) {
        if (trimmedValue[i] === expectedPhrase[i]) {
          correctChars++;
        }
      }
      const liveAccuracy = calculateAccuracy(correctChars, charsTyped);
      setCurrentAccuracy(liveAccuracy);
    }
    
    // Check if typing is correct
    const isCorrect = expectedPhrase.startsWith(trimmedValue);
    const wasCorrect = isInputCorrect;
    
    if (isCorrect) {
      setIsInputCorrect(true);
    } else {
      setIsInputCorrect(false);
      // Play incorrect sound only on first wrong character
      if (soundEnabled && wasCorrect && trimmedValue.length > 0) {
        playIncorrectSound();
      }
    }
    
    setTypedPhrase(value);
    
    // Check if phrase is completed
    if (trimmedValue.trimEnd() === expectedPhrase) {
      const endTime = Date.now();
      const timeInSeconds = (endTime - startTime) / 1000;
      
      // Calculate final stats
      let correctChars = 0;
      for (let i = 0; i < expectedPhrase.length; i++) {
        if (trimmedValue[i] === expectedPhrase[i]) {
          correctChars++;
        }
      }
      
      const totalChars = trimmedValue.trimEnd().length;
      const cpm = calculateCPM(totalChars, timeInSeconds);
      const accuracy = calculateAccuracy(correctChars, totalChars);
      
      setCurrentCPM(cpm);
      setCurrentAccuracy(accuracy);
      
      // Don't pause timer - keep it running across lessons
      
      // In practice mode, always advance regardless of thresholds
      const shouldAdvance = practiceMode || meetsThreshold(cpm, accuracy, currentSettings.minimumCPM, currentSettings.minimumAccuracy);
      
      if (shouldAdvance) {
        // Play success sound
        if (soundEnabled) {
          playSuccessSound();
        }
        
        // Record CPM
        const newCPMs = [...currentSettings.CPMs];
        if (currentSettings.currentIndex === 0) {
          // New round, reset CPMs
          newCPMs.length = 0;
        }
        newCPMs.push(cpm);
        
        // Save session history
        const session = {
          timestamp: new Date().toISOString(),
          source,
          lesson: `${currentSettings.currentIndex + 1}/${currentSettings.phrases.length}`,
          cpm,
          accuracy,
          charactersTyped: totalChars,
          duration: timeInSeconds,
        };
        
        const newHistory = [...appState.sessionHistory, session];
        
        // Update streak
        const meetsThresholdsForStreak = meetsThreshold(cpm, accuracy, currentSettings.minimumCPM, currentSettings.minimumAccuracy);
        const newStreak = meetsThresholdsForStreak ? appState.totalStats.currentStreak + 1 : 0;
        
        // Play celebration sound on milestone streaks
        if (soundEnabled && newStreak > 0 && newStreak % 10 === 0) {
          playCelebrationSound();
        }
        
        // Update total stats
        const newTotalStats = {
          totalSessions: appState.totalStats.totalSessions + 1,
          totalCharacters: appState.totalStats.totalCharacters + totalChars,
          totalTime: appState.totalStats.totalTime + timeInSeconds,
          bestCPM: Math.max(appState.totalStats.bestCPM, cpm),
          lessonsCompleted: appState.totalStats.lessonsCompleted + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(appState.totalStats.longestStreak || 0, newStreak),
        };
        
        setAppState(prev => ({
          ...prev,
          sessionHistory: newHistory,
          totalStats: newTotalStats,
        }));
        
        // Move to next phrase
        setTimeout(() => {
          nextPhrase(newCPMs);
        }, 500);
      } else {
        // Failed threshold, play error sound and reset streak
        if (soundEnabled) {
          playErrorSound();
        }
        
        // Reset streak
        const newTotalStats = {
          ...appState.totalStats,
          currentStreak: 0,
        };
        setAppState(prev => ({
          ...prev,
          totalStats: newTotalStats,
        }));
        
        // Reset current phrase only, keep timer running
        setTimeout(() => {
          resetPhraseOnly();
        }, 1000);
      }
    }
  };
  
  const nextPhrase = (newCPMs) => {
    const nextIndex = currentSettings.currentIndex + 1;
    
    if (nextIndex < currentSettings.phrases.length) {
      setSettings(prev => ({
        ...prev,
        [source]: {
          ...prev[source],
          CPMs: newCPMs,
          currentIndex: nextIndex,
        },
      }));
      setExpectedPhrase(currentSettings.phrases[nextIndex]);
    } else {
      // Completed all phrases, generate new set
      setSettings(prev => ({
        ...prev,
        [source]: {
          ...prev[source],
          CPMs: newCPMs,
        },
      }));
      refreshPhrases();
      return; // Don't reset after refresh, it's already done in refreshPhrases
    }
    
    // Reset only phrase, keep timer running
    resetPhraseOnly();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      resetCurrentPhraseMetrics();
      // Generate new phrases
      refreshPhrases();
    }
  };
  
  const handleCustomWordsSubmit = () => {
    if (!customInput.trim()) {
      alert('Please enter some words');
      return;
    }
    
    const words = customInput.split(/\s+/).filter(w => w.length > 0);
    setCustomWords(words);
    setSource('custom_words');
    setShowCustomModal(false);
    setCustomInput('');
  };
  
  const handleGenerateNgrams = () => {
    if (!generatorInput.trim()) {
      alert('Please enter some text');
      return;
    }
    
    const analysis = analyzeText(generatorInput);
    setGeneratedNgrams(analysis);
  };
  
  const handleSourceChange = (newSource) => {
    if (newSource === 'custom_words' && !customWords) {
      setShowCustomModal(true);
    } else {
      setSource(newSource);
    }
  };
  
  const handleSettingChange = (field, value) => {
    const parsedValue = parseInt(value) || value;
    setSettings(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        [field]: parsedValue,
      },
    }));
    
    // If changing scope, combination, or repetition, refresh phrases with the new value
    if (field === 'scope' || field === 'combination' || field === 'repetition') {
      setTimeout(() => {
        refreshPhrases({ [field]: parsedValue });
      }, 0);
    }
  };
  
  const handleExportNgrams = (type) => {
    if (type === 'all') {
      exportNgramsToCSV(bigrams, 'bigrams');
      exportNgramsToCSV(trigrams, 'trigrams');
      exportNgramsToCSV(tetragrams, 'tetragrams');
      exportNgramsToCSV(words, 'words');
    } else {
      const data = ngramSources[type];
      exportNgramsToCSV(data, type);
    }
  };
  
  const handleExportHistory = () => {
    if (appState.sessionHistory.length === 0) {
      alert('No session history to export');
      return;
    }
    exportSessionHistoryToCSV(appState.sessionHistory);
  };
  
  const handleExportStats = () => {
    const stats = {
      ...appState.totalStats,
      averageCPM,
      averageAccuracy: appState.sessionHistory.length > 0
        ? Math.round(appState.sessionHistory.reduce((sum, s) => sum + s.accuracy, 0) / appState.sessionHistory.length)
        : 0,
    };
    exportStatsToCSV(stats);
  };
  
  const handleExportGeneratedNgrams = (type) => {
    if (!generatedNgrams || !generatedNgrams[type]) {
      alert('No generated n-grams to export');
      return;
    }
    exportNgramsToCSV(generatedNgrams[type], `generated_${type}`);
  };
  
  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setAppState(DEFAULT_STATE);
      setSource(DEFAULT_STATE.source);
      setCustomWords(DEFAULT_STATE.customWords);
      setSettings(DEFAULT_STATE.settings);
      setTheme(DEFAULT_STATE.theme);
      refreshPhrases();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-left">
            <h1 className="app-title">ngramgod</h1>
          </div>
          <div className="header-stats">
            <div className="stat-compact">
              <span className="stat-label">CPM</span>
              <span className="stat-value">{currentCPM}</span>
            </div>
            <div className="stat-compact">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{currentAccuracy}%</span>
            </div>
            <div className="stat-compact">
              <span className="stat-label">Avg CPM</span>
              <span className="stat-value">{averageCPM}</span>
            </div>
            <div className="stat-compact">
              <span className="stat-label">🔥 Streak</span>
              <span className="stat-value">{appState.totalStats.currentStreak}</span>
            </div>
            <div className="stat-compact">
              <span className="stat-label">⏱️ Time</span>
              <span className="stat-value">{formatTime(timer.seconds)}</span>
            </div>
            <button onClick={() => setShowHelpModal(true)} className="help-button" title="Press ESC to open help">
              ❓ Help (ESC)
            </button>
          </div>
        </div>
      </header>

      <main className="app-main container">
        <div className="settings-panel">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="theme-toggle-sidebar"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <div className="settings-group">
            <h3>Source</h3>
            <div className="radio-group">
              {['bigrams', 'trigrams', 'tetragrams', 'words'].map((src) => (
                <label key={src} className="radio-label">
                  <input
                    type="radio"
                    name="source"
                    value={src}
                    checked={source === src}
                    onChange={(e) => handleSourceChange(e.target.value)}
                  />
                  <span>{src.charAt(0).toUpperCase() + src.slice(1)}</span>
                </label>
              ))}
              <label className="radio-label">
                <input
                  type="radio"
                  name="source"
                  value="custom_words"
                  checked={source === 'custom_words'}
                  onChange={(e) => handleSourceChange(e.target.value)}
                />
                <span>
                  <button onClick={() => setShowCustomModal(true)} className="link-button">
                    Custom
                  </button>
                </span>
              </label>
            </div>
          </div>

          {source !== 'custom_words' && (
            <div className="settings-group">
              <h3>Scope</h3>
              <div className="radio-group">
                {[50, 100, 150, 200].map((scopeValue) => (
                  <label key={scopeValue} className="radio-label">
                    <input
                      type="radio"
                      name="scope"
                      value={scopeValue}
                      checked={currentSettings.scope === scopeValue}
                      onChange={(e) => handleSettingChange('scope', e.target.value)}
                    />
                    <span>Top {scopeValue}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="settings-group">
            <h3>Generator</h3>
            <div className="input-row">
              <label>
                Combination
                <input
                  type="number"
                  min="1"
                  value={currentSettings.combination}
                  onChange={(e) => handleSettingChange('combination', e.target.value)}
                  className="number-input"
                />
              </label>
              <label>
                Repetition
                <input
                  type="number"
                  min="1"
                  value={currentSettings.repetition}
                  onChange={(e) => handleSettingChange('repetition', e.target.value)}
                  className="number-input"
                />
              </label>
            </div>
          </div>

          <div className="settings-group">
            <h3>Thresholds</h3>
            <div className="input-row">
              <label>
                Min CPM
                <input
                  type="number"
                  min="1"
                  value={currentSettings.minimumCPM}
                  onChange={(e) => handleSettingChange('minimumCPM', e.target.value)}
                  className="number-input"
                />
              </label>
              <label>
                Min Accuracy %
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={currentSettings.minimumAccuracy}
                  onChange={(e) => handleSettingChange('minimumAccuracy', e.target.value)}
                  className="number-input"
                />
              </label>
            </div>
          </div>

          <div className="settings-group">
            <h3>Mode</h3>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => setPracticeMode(e.target.checked)}
                className="toggle-checkbox"
              />
              <span>Practice Mode (No thresholds)</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="toggle-checkbox"
              />
              <span>Sound Effects</span>
            </label>
          </div>

        </div>

        <div className="typing-area">
          <div className="lesson-info">
            {currentSettings.phrases.length > 0 ? (
              <h2>
                Lesson {currentSettings.currentIndex + 1} / {currentSettings.phrases.length}
              </h2>
            ) : (
              <h2>Click "New Phrases" or select a source to begin</h2>
            )}
          </div>

          <div className="expected-phrase">
            {expectedPhrase || 'No phrase loaded'}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={typedPhrase}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            className={`typing-input ${!isInputCorrect ? 'incorrect' : ''}`}
            placeholder="Click here and start typing (Press ENTER to restart)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          {showLiveStats && (
            <div className="live-stats">
              <button 
                onClick={() => setShowLiveStats(false)} 
                className="live-stats-toggle"
                title="Hide live stats"
              >
                ✕
              </button>
              <div className="live-stats-center">
                <div className="live-stat-item">
                  <span className="live-stat-label">CPM</span>
                  <span className="live-stat-value">{currentCPM}</span>
                </div>
                <div className="live-stat-separator"></div>
                <div className="live-stat-item">
                  <span className="live-stat-label">Accuracy</span>
                  <span className="live-stat-value">{currentAccuracy}%</span>
                </div>
              </div>
              {practiceMode && (
                <div className="practice-mode-badge">
                  Practice
                </div>
              )}
            </div>
          )}

          {!showLiveStats && (
            <button 
              onClick={() => setShowLiveStats(true)} 
              className="show-live-stats-btn"
              title="Show live stats"
            >
              Show Live Stats
            </button>
          )}

          <div className="actions-row">
            <button onClick={() => setShowNgramGenerator(true)} className="btn btn-secondary">
              📊 N-gram Generator
            </button>
            <button onClick={() => setShowExportModal(true)} className="btn btn-secondary">
              💾 Export Data
            </button>
            <button onClick={handleResetProgress} className="btn btn-danger">
              🔄 Reset Progress
            </button>
          </div>
        </div>
      </main>

      {/* Custom Words Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Custom Words</h2>
              <button onClick={() => setShowCustomModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Enter custom words separated by spaces or newlines:</p>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="custom-input"
                rows="10"
                placeholder="word1 word2 word3..."
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCustomModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCustomWordsSubmit} className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* N-gram Generator Modal */}
      {showNgramGenerator && (
        <div className="modal-overlay" onClick={() => setShowNgramGenerator(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>N-gram Generator</h2>
              <button onClick={() => setShowNgramGenerator(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Paste text to analyze and generate n-grams:</p>
              <textarea
                value={generatorInput}
                onChange={(e) => setGeneratorInput(e.target.value)}
                className="custom-input"
                rows="8"
                placeholder="Paste your text here..."
              />
              <button onClick={handleGenerateNgrams} className="btn btn-primary mt-2">
                Generate N-grams
              </button>

              {generatedNgrams && (
                <div className="ngram-results">
                  {['words', 'bigrams', 'trigrams', 'tetragrams'].map((type) => {
                    const sorted = sortNgramsByFrequency(generatedNgrams[type]);
                    const top20 = sorted.slice(0, 20);
                    
                    return (
                      <div key={type} className="ngram-result-section">
                        <div className="result-header">
                          <h3>{type.charAt(0).toUpperCase() + type.slice(1)} ({sorted.length} unique)</h3>
                          <button
                            onClick={() => handleExportGeneratedNgrams(type)}
                            className="btn btn-small"
                          >
                            Export CSV
                          </button>
                        </div>
                        <div className="ngram-list">
                          {top20.map(([ngram, freq]) => (
                            <div key={ngram} className="ngram-item">
                              <span className="ngram-text">{ngram}</span>
                              <span className="ngram-freq">{freq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowNgramGenerator(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Export Data</h2>
              <button onClick={() => setShowExportModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <h3>Export N-grams</h3>
              <div className="button-group vertical">
                <button onClick={() => handleExportNgrams('bigrams')} className="btn btn-secondary">
                  Export Bigrams
                </button>
                <button onClick={() => handleExportNgrams('trigrams')} className="btn btn-secondary">
                  Export Trigrams
                </button>
                <button onClick={() => handleExportNgrams('tetragrams')} className="btn btn-secondary">
                  Export Tetragrams
                </button>
                <button onClick={() => handleExportNgrams('words')} className="btn btn-secondary">
                  Export Words
                </button>
                <button onClick={() => handleExportNgrams('all')} className="btn btn-primary">
                  Export All N-grams
                </button>
              </div>

              <h3 className="mt-3">Export Session Data</h3>
              <div className="button-group vertical">
                <button onClick={handleExportHistory} className="btn btn-secondary">
                  Export Session History
                </button>
                <button onClick={handleExportStats} className="btn btn-secondary">
                  Export Statistics Summary
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowExportModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⌨️ Help & Keyboard Shortcuts</h2>
              <button onClick={() => setShowHelpModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <h3>How to Use</h3>
              <ol className="help-list">
                <li><strong>Select a Source:</strong> Choose Bigrams, Trigrams, Tetragrams, Words, or Custom</li>
                <li><strong>Configure Settings:</strong> Adjust scope, combination, repetition, and thresholds</li>
                <li><strong>Start Typing:</strong> Type the displayed phrase exactly as shown</li>
                <li><strong>Complete Lessons:</strong> Meet CPM and accuracy thresholds to advance (or use Practice Mode)</li>
              </ol>

              <h3 className="mt-3">Keyboard Shortcuts</h3>
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <kbd>Escape</kbd>
                  <span>Open/Close help modal</span>
                </div>
                <div className="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>Reset phrase and generate new ones</span>
                </div>
              </div>

              <h3 className="mt-3">Features</h3>
              <ul className="help-list">
                <li><strong>Live Stats:</strong> Real-time CPM and accuracy tracking as you type</li>
                <li><strong>Practice Mode:</strong> Disable thresholds to practice without restrictions</li>
                <li><strong>Streak Tracking:</strong> Build streaks by meeting thresholds consistently</li>
                <li><strong>Sound Effects:</strong> Toggle audio feedback for keystrokes and achievements</li>
                <li><strong>N-gram Generator:</strong> Analyze custom text to create personalized n-grams</li>
                <li><strong>Data Export:</strong> Export your progress, stats, and n-grams as CSV files</li>
                <li><strong>Persistent Progress:</strong> All settings and stats saved automatically</li>
              </ul>

              <h3 className="mt-3">Performance Metrics</h3>
              <ul className="help-list">
                <li><strong>CPM (Characters Per Minute):</strong> Total characters typed divided by time in minutes</li>
                <li><strong>Accuracy:</strong> Percentage of correctly typed characters</li>
                <li><strong>Streak:</strong> Consecutive lessons completed while meeting thresholds</li>
                <li><strong>Average CPM:</strong> Mean CPM across all completed lessons</li>
              </ul>

              <h3 className="mt-3">Tips for Improvement</h3>
              <ul className="help-list">
                <li>Start with a lower scope (Top 50) and gradually increase</li>
                <li>Focus on accuracy first, then speed will naturally follow</li>
                <li>Practice regularly with short sessions for better retention</li>
                <li>Use custom words to practice specific problem areas</li>
                <li>Enable sound effects for immediate feedback</li>
                <li>Track your streak to stay motivated!</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowHelpModal(false)} className="btn btn-primary">
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <p>
                <strong>ngramgod</strong> - Advanced typing practice with n-grams
              </p>
              <div className="social-links">
                <a href="https://linkedin.com/in/rishikdulipyata" target="_blank" rel="noopener noreferrer" className="social-link">
                  🔗 LinkedIn
                </a>
                <span className="separator">|</span>
                <a href="https://github.com/rishikdulipyataGH" target="_blank" rel="noopener noreferrer" className="social-link">
                  💙 GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
