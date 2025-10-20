# ⌨️ ngramgod

An advanced typing practice web application designed to improve typing speed and accuracy through n-gram training. Built with React 19 and Vite, featuring real-time performance tracking, customizable practice sessions, and comprehensive data analytics.

> **Note**: This project was developed with the assistance of Claude Sonnet 4.5

## 🌟 Features

### Core Typing Practice
- **Multiple N-gram Sources**: Practice with bigrams, trigrams, tetragrams, common words, or your own custom text
- **Real-time Metrics**: Live CPM (Characters Per Minute) and accuracy tracking as you type
- **Smart Progression**: Automatically advance through lessons when meeting performance thresholds
- **Practice Mode**: Bypass thresholds for relaxed, unrestricted practice
- **Session Timer**: Track elapsed time across your entire practice session
- **Streak System**: Build and maintain streaks by consistently meeting thresholds
- **Sound Effects**: Audio feedback for correct/incorrect typing and achievements (Web Audio API)

### Customization
- **Scope Control**: Choose from Top 50, 100, 150, or 200 most common n-grams
- **Phrase Generation**: Configure:
  - **Combination**: Number of n-grams per phrase
  - **Repetition**: Number of times each combination repeats
- **Performance Thresholds**: Set custom minimum CPM and accuracy requirements
- **Custom Words**: Input your own text for personalized practice sessions
- **Theme Toggle**: Switch between dark mode (default) and light mode

### N-gram Analysis Tool
- **Text Analysis**: Paste any text to generate frequency analysis
- **Multiple Types**: Automatically extracts words, bigrams, trigrams, and tetragrams
- **Frequency Display**: View the top 20 most common n-grams with occurrence counts
- **CSV Export**: Export generated n-grams for external use

### Data & Progress
- **Persistent Storage**: All settings, progress, and stats saved automatically to localStorage
- **Session History**: Complete log of every typing session with timestamp, source, CPM, accuracy, characters typed, and duration
- **Lifetime Statistics**: Track total sessions, characters typed, total time, best CPM, lessons completed, current streak, and longest streak
- **CSV Export**: Export n-gram data, session history, and statistics summary
- **Progress Reset**: Option to clear all data and start fresh

### UI/UX
- **Modern Black & Purple Theme**: Sleek dark mode with vibrant purple accents and smooth gradients
- **Light Mode**: Clean, bright alternative theme
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Compact Settings Panel**: All controls accessible without scrolling, perfectly aligned with typing area
- **Live Stats Display**: Toggle-able real-time CPM and accuracy display with hide/show functionality
- **Keyboard Shortcuts**: ESC to open help modal, Enter to reset and generate new phrases
- **Visual Feedback**: Color changes for incorrect typing, practice mode badge
- **Help Modal**: Comprehensive guide with keyboard shortcuts, features, tips, and usage instructions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rishikdulipyataGH/ngramgod.git
cd ngramgod
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### Basic Workflow

1. **Select a Source**: Choose from Bigrams, Trigrams, Tetragrams, Words, or Custom in the left settings panel
2. **Configure Settings**:
   - **Scope**: Select how many top n-grams to practice (50, 100, 150, or 200)
   - **Combination**: Number of n-grams to combine in each phrase
   - **Repetition**: Number of times to repeat each combination
   - **Thresholds**: Set minimum CPM and accuracy percentage requirements
3. **Start Typing**: Click into the input field and type the displayed phrase exactly
4. **Progress Through Lessons**: 
   - Meet the threshold requirements to advance automatically
   - Current lesson and total lessons shown at the top
   - Session timer runs continuously across all lessons
5. **Complete Rounds**: After completing all phrases, new ones are generated automatically

### Keyboard Shortcuts

- **ESC**: Open/close help modal
- **Enter**: Reset current phrase and generate new set

### Using Custom Words

1. Select "Custom" in the Source section
2. Enter your words in the modal (separated by spaces or newlines)
3. Click "Submit" to generate practice phrases

### Generating N-grams from Text

1. Click "📊 N-gram Generator" button
2. Paste your text into the textarea
3. Click "Generate N-grams"
4. View frequency analysis for all n-gram types
5. Export any category as CSV

### Exporting Data

1. Click "💾 Export Data" button
2. Choose what to export:
   - Individual n-gram sets (bigrams, trigrams, etc.)
   - All n-grams at once
   - Session history with all completed lessons
   - Statistics summary

### Practice Mode

Enable "Practice Mode" in the Mode section to:
- Remove threshold requirements
- Practice without restrictions
- Still track statistics and history
- Indicated by a "Practice" badge in live stats

### Theme Switching

Click the sun (☀️) or moon (🌙) icon at the top of the settings panel to toggle between light and dark modes.
## 📁 Project Structure

```
ngram god/
├── public/
│   └── vite.svg                 # Vite logo (unused)
├── src/
│   ├── data/                    # N-gram data files
│   │   ├── bigrams.js          # Top 200 English bigrams
│   │   ├── trigrams.js         # Top 200 English trigrams
│   │   ├── tetragrams.js       # Top 200 English tetragrams
│   │   └── words.js            # Top 200 common English words
│   ├── hooks/                   # Custom React hooks
│   │   ├── useLocalStorage.js  # Persistent state management
│   │   └── useTimer.js         # Session timer functionality
│   ├── utils/                   # Utility functions
│   │   ├── calculations.js     # CPM, accuracy, time formatting
│   │   ├── csvExporter.js      # CSV generation and download
│   │   ├── ngramAnalyzer.js    # Text analysis and n-gram extraction
│   │   ├── phraseGenerator.js  # Phrase generation and shuffling
│   │   ├── soundEffects.js     # Web Audio API sound generation
│   │   └── storage.js          # localStorage helpers with versioning
│   ├── App.jsx                  # Main application component (960 lines)
│   ├── App.css                  # Application-specific styles
│   ├── index.css                # Global styles and theme variables
│   └── main.jsx                 # Application entry point
├── index.html                   # HTML template with keyboard favicon
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.1.1**: Modern React with hooks and concurrent features
- **Vite 7.1.7**: Fast build tool and development server with HMR

### Libraries
- **PapaParse 5.5.3**: CSV parsing and generation for data exports
- **Web Audio API**: Native browser API for sound effect generation

### Development Tools
- **ESLint 9.36.0**: Code linting with React-specific rules
- **@vitejs/plugin-react 5.0.4**: React Fast Refresh and JSX support

### Storage
- **localStorage**: Client-side persistence for all app state and user data

### Styling
- **CSS Variables**: Dynamic theming system for light/dark modes
- **Custom CSS**: Hand-crafted responsive styles
- **CSS Variables**: Theming system

## 🎨 Theming

### Dark Mode (Default)
- Deep black backgrounds (#0a0a0a, #1a1a1a, #2a2a2a)
- Vibrant purple accents (#9333ea, #a855f7, #c084fc)
- White/gray text for contrast

### Light Mode
- White/light gray backgrounds (#ffffff, #f9fafb, #f3f4f6)
- Same purple accent colors for brand consistency
- Dark text for readability

All theme colors are defined as CSS variables in `src/index.css` and can be easily customized.

## 🔧 Configuration

### Default Settings
Defined in `src/App.jsx` as `DEFAULT_STATE`:

```javascript
{
  source: 'bigrams',           // Starting n-gram type
  customWords: null,           // No custom words initially
  practiceMode: false,         // Thresholds enabled by default
  soundEnabled: true,          // Sound effects on
  theme: 'dark',              // Dark mode by default
  settings: {
    scope: 50,                // Top 50 n-grams
    combination: 2,           // 2 n-grams per phrase
    repetition: 3,            // Repeat 3 times
    minimumCPM: 200,          // 200 CPM threshold
    minimumAccuracy: 100      // 100% accuracy threshold
  }
}
```

### Lesson Count Formula
- **Top 50**: 25 lessons (50 ÷ 2 combination)
- **Top 100**: 50 lessons (100 ÷ 2)
- **Top 150**: 75 lessons (150 ÷ 2)
- **Top 200**: 100 lessons (200 ÷ 2)

Formula: `lessons = scope / combination`

## 📊 Performance Metrics

### CPM (Characters Per Minute)
- **Calculation**: `(totalCharacters / timeInSeconds) * 60`
- **Includes**: All characters typed (both correct and incorrect)
- **Updates**: Live as you type, final calculation on phrase completion

### Accuracy
- **Calculation**: `(correctCharacters / totalCharacters) * 100`
- **Range**: 0-100%
- **Updates**: Live as you type, final calculation on phrase completion

### Streak
- **Increment**: +1 for each lesson completed while meeting both CPM and accuracy thresholds
- **Reset**: Drops to 0 when failing to meet thresholds
- **Milestone Celebration**: Special sound effect every 10 lessons

## 💾 Data Persistence

All data is stored in localStorage under the key `ngramgod_data`:

### Stored Data
- Current source and custom words
- All settings for each n-gram type (scope, combination, repetition, thresholds, phrases, current index, CPMs)
- Complete session history with timestamps
- Total lifetime statistics (sessions, characters, time, best CPM, lessons completed, streaks)
- Practice mode preference
- Sound enabled preference
- Theme preference (dark/light)

### Data Versioning
The storage system includes version tracking (currently v1.0) to handle future updates gracefully.

### Reset Progress
Click "🔄 Reset Progress" in the actions section to clear all data and return to default state.

## 🎵 Sound Effects

Generated using the Web Audio API (no external files):

- **Success Sound**: Ascending notes (C-E-G) for completed lessons
- **Error Sound**: Descending notes for failed threshold attempts
- **Incorrect Sound**: Low beep for typing mistakes
- **Celebration Sound**: Full ascending scale (C-E-G-C) for streak milestones (every 10 lessons)

All sounds can be toggled on/off in the Mode section.

## 🚫 Running Locally

This project is designed to run locally on your machine. **No hosting, deployment, or server required!**

### Why Local?
- **Zero Cost**: No hosting fees or domain costs
- **Privacy**: All data stays on your machine
- **Performance**: No network latency
- **Flexibility**: Easy to modify and customize
- **Portability**: Share the code, not a hosted site

### Sharing with Others
1. Share the GitHub repository link
2. Others can clone and run locally following the installation steps
3. Each user maintains their own data and settings

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires:
- Modern browser with ES6+ support
- localStorage support
- Web Audio API support (for sound effects)

## 👨‍💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

### Code Style
- React functional components with hooks
- CSS variables for theming
- Modular utility functions
- JSDoc comments for function documentation
- Component-based architecture

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

### Areas for Enhancement
- Additional n-gram data sets (other languages, technical terms)
- Graphical progress charts
- Mistake pattern analysis
- Keyboard heatmaps
- More sound themes
- Import/export settings profiles
- Dark mode variants (different color schemes)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Claude Sonnet 4.5**: Assisted in development, code refinement, and feature implementation
- **N-gram Data**: Sourced from frequency analysis of common English text
- **Inspiration**: Typing practice tools like Monkeytype, Keybr, and traditional n-gram trainers
- **React & Vite Teams**: For excellent development tools and documentation

## 👤 Author

**Rishik Dulipyata**
- LinkedIn: [rishikdulipyata](https://linkedin.com/in/rishikdulipyata)
- GitHub: [rishikdulipyataGH](https://github.com/rishikdulipyataGH)

---

**Built with ❤️ and ⌨️ for typing enthusiasts**

*Practice makes perfect. One n-gram at a time.*
