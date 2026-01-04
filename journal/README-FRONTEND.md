# Journal Frontend

React frontend for the journal section of radprk.github.io.

## Setup

1. Install dependencies:
```bash
cd journal
npm install
```

2. For development, you need to copy the data files to the public directory or serve them:
```bash
# Create symlinks or copy data files for dev server
mkdir -p public/data public/config
cp -r data/* public/data/
cp -r config/* public/config/
```

Or run the dev server with the data files accessible:
```bash
npm run dev
```

## Building for GitHub Pages

The build process outputs to `journal/dist/`. For GitHub Pages deployment:

1. Build the React app:
```bash
npm run build
```

2. Copy the built files to the root `journal/` directory (or wherever you want to serve from):
```bash
# Option 1: Copy dist contents to journal root
cp -r dist/* .

# Option 2: Use a deployment script (see below)
```

3. Ensure `data/` and `config/` directories are accessible at the same level as `index.html`

## Project Structure

```
journal/
├── src/
│   ├── components/      # React components
│   ├── App.jsx         # Main app component
│   ├── App.css         # App styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── data/               # JSON data files (entries, stats, weeks)
├── config/             # Configuration (books.json)
├── dist/               # Build output (gitignored)
├── public/             # Static assets (for dev)
├── package.json
└── vite.config.js
```

## Components

- **HeaderStats**: Overview stats (total problems, best streak, goal completion, books)
- **PracticeStreaks**: Streak counters for LeetCode, SQL, System Design, ML
- **HeatmapCalendar**: GitHub-style activity heatmap
- **ReadingProgress**: Book progress with chapters and themes
- **GoalsSection**: Weekly goals with completion tracking
- **ExploringTagCloud**: Interactive tag cloud of explored topics
- **DayCards**: Expandable daily entry cards with filtering

## Development Notes

- Data files are loaded from `./data/` and `./config/` relative to the served HTML
- For GitHub Pages, ensure these directories are at the same level as `index.html`
- The app uses the same color scheme as the main site (defined in CSS variables)

