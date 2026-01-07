# React Journal Application - Complete Architecture Summary

## Overview

This is a **single-page React application** that displays your daily journal entries, practice stats, reading progress, goals, and blog posts. It's built with React 18, Vite, React Router, and Recharts.

## Core Architecture

### Entry Point
- **`main.jsx`**: Renders the App component into `#root` with ErrorBoundary wrapper
- **`index.html`**: HTML shell that loads the React app
- **`index.css`**: Global styles and CSS variables (dark theme)

### Main App Component (`App.jsx`)

**Purpose**: Central data management and routing hub

**State Management**:
- `entries`: Daily journal entries (from `entries.json`)
- `stats`: Computed statistics (from `stats.json`)
- `weeks`: Weekly summaries (from `weeks.json`)
- `books`: Book configuration (from `books.json`)
- `loading`: Loading state while fetching data
- `error`: Error state if data fails to load
- `filterTopic`: Currently selected exploring topic for filtering

**Data Loading**:
1. On mount, fetches 4 JSON files in parallel:
   - `data/entries.json` - Daily entries
   - `data/stats.json` - Computed stats
   - `data/weeks.json` - Weekly summaries
   - `config/books.json` - Book metadata
2. Uses `import.meta.env.BASE_URL` for path resolution (works in dev and production)
3. Shows loading spinner while fetching
4. Shows error message if fetch fails

**Routing** (React Router):
- `/` - Main journal dashboard
- `/blog` - Blog post list
- `/blog/:id` - Individual blog post

**Component Hierarchy**:
```
App
├── BrowserRouter
    └── Routes
        ├── Route "/" → Main Dashboard
        │   ├── CurrentWeekGoals
        │   ├── HeaderStats
        │   ├── PracticeStreaks
        │   ├── PracticeCharts
        │   ├── HeatmapCalendar
        │   ├── ReadingProgress
        │   ├── WordCloud
        │   ├── GoalsSection
        │   ├── ExploringTagCloud
        │   └── DayCards
        ├── Route "/blog" → BlogList
        └── Route "/blog/:id" → BlogPost
```

## Component Breakdown

### 1. **CurrentWeekGoals** (`components/CurrentWeekGoals.jsx`)
**Purpose**: Prominent display of current week's goals at top of dashboard

**Features**:
- Circular progress indicator (SVG) showing completion percentage
- Goal cards with checkboxes (visual only, not interactive)
- Week review and highlight sections
- Gradient background with accent border

**Props**: `weeks`, `stats`

**Interactive**: No (display only)

---

### 2. **HeaderStats** (`components/HeaderStats.jsx`)
**Purpose**: Overview statistics bar

**Displays**:
- Total problems solved (LeetCode + SQL + System Design + ML)
- Best streak across all practice types
- Goal completion rate
- Number of books in progress

**Props**: `stats`

**Interactive**: No (display only)

---

### 3. **PracticeStreaks** (`components/PracticeStreaks.jsx`)
**Purpose**: Visual streak counters for each practice category

**Features**:
- 4 cards: LeetCode, SQL, System Design, ML
- Current streak number
- Longest streak number
- Total count
- Visual streak indicator (boxes showing streak pattern)

**Props**: `stats`

**Interactive**: No (display only)

---

### 4. **PracticeCharts** (`components/PracticeCharts.jsx`)
**Purpose**: Interactive charts showing practice trends

**Features** (using Recharts):
- **Line Chart**: Daily practice trends over time (4 lines: LeetCode, SQL, System Design, ML)
- **Bar Chart**: Total problems by category
- **Stacked Bar Chart**: LeetCode problems by difficulty (Easy/Medium/Hard)

**Props**: `entries`, `stats`

**Interactive**: Yes
- Hover tooltips on all charts
- Responsive to window size

---

### 5. **HeatmapCalendar** (`components/HeatmapCalendar.jsx`)
**Purpose**: GitHub-style activity heatmap

**Features**:
- Grid of squares representing days
- Color intensity based on activity score
- Day labels (Sun-Sat) on left
- Tooltip on hover showing date and stats
- Click to scroll to that day's entry

**Activity Score Calculation**:
- LeetCode: 2 points per problem
- SQL: 2 points per problem
- System Design: 2 points per problem
- ML: 2 points per problem
- Building: 3 points per entry
- Reading: 2 points per entry
- Exploring: 1 point per entry
- Notes: 1 point if present

**Props**: `entries`

**Interactive**: Yes
- Hover: Shows tooltip with date and activity breakdown
- Click: Scrolls to day card (if entry exists)

---

### 6. **ReadingProgress** (`components/ReadingProgress.jsx`)
**Purpose**: Book reading progress with chapters and themes

**Features**:
- Progress bars for each book
- Pages read / total pages
- Percentage complete
- Current chapter display
- Themes covered as tags

**Props**: `stats`, `books`

**Interactive**: No (display only)

---

### 7. **WordCloud** (`components/WordCloud.jsx`)
**Purpose**: Visual word frequency from journal entries

**Features**:
- Extracts words from:
  - Practice insights
  - Reading insights
  - Exploring content
  - Notes
- Word size based on frequency
- Color based on importance
- Filters out stop words
- Includes exploring topics from stats

**Props**: `entries`, `stats`

**Interactive**: No (display only, but words hover for scale effect)

---

### 8. **GoalsSection** (`components/GoalsSection.jsx`)
**Purpose**: Detailed weekly goals view

**Features**:
- Current week's goals with checkmarks
- Week review text
- Week highlight
- All-time goal statistics

**Props**: `weeks`, `stats`

**Interactive**: No (display only)

---

### 9. **ExploringTagCloud** (`components/ExploringTagCloud.jsx`)
**Purpose**: Interactive tag cloud of explored topics

**Features**:
- Tags sized by frequency
- Click to select/deselect
- Selected tag highlighted
- Calls `onTopicClick` callback to filter entries

**Props**: `stats`, `onTopicClick` (callback function)

**Interactive**: Yes
- Click tag: Filters day cards by that topic
- Click again: Clears filter

---

### 10. **DayCards** (`components/DayCards.jsx`)
**Purpose**: Expandable daily entry cards

**Features**:
- Collapsed view: Date + preview text
- Expanded view: Full entry with all sections
- Filter buttons: All / Practice / Building / Reading / Exploring
- Topic filtering: Can filter by exploring topic
- Auto-expands today's entry on load

**Sections Displayed**:
- Practice (LeetCode, SQL, System Design, ML)
- Building (projects and work)
- Reading (books, chapters, pages, insights)
- Exploring (topics and content)
- Notes

**Props**: `entries`, `filterTopic`

**Interactive**: Yes
- Click card header: Expands/collapses
- Filter buttons: Filter entries by category
- Topic filter: Shows only entries with that exploring topic

---

### 11. **BlogList** (`pages/BlogList.jsx`)
**Purpose**: Blog post listing page

**Features**:
- Grid of blog post cards
- Each card shows: date, tags, title, excerpt
- Links to individual posts
- Back link to journal

**Data Source**: `data/blog.json`

**Interactive**: Yes
- Click post card: Navigates to blog post page

---

### 12. **BlogPost** (`pages/BlogPost.jsx`)
**Purpose**: Individual blog post page

**Features**:
- Full post content (HTML)
- Date and tags
- Back navigation
- Responsive layout

**Data Source**: `data/blog.json` (finds post by ID)

**Interactive**: Yes
- Back link: Returns to blog list

## Data Flow

### Initial Load
1. App mounts → `useEffect` triggers
2. Fetches 4 JSON files in parallel
3. Sets state with data
4. Renders components (which receive data as props)

### User Interactions

**Filtering**:
1. User clicks tag in ExploringTagCloud
2. `onTopicClick` callback updates `filterTopic` state in App
3. `filterTopic` passed to DayCards
4. DayCards filters entries and re-renders

**Navigation**:
1. User clicks "Blog" link
2. React Router navigates to `/blog`
3. BlogList component renders
4. Fetches `blog.json` and displays posts

**Expanding Cards**:
1. User clicks day card header
2. `toggleDay` function updates `expandedDays` Set
3. Card re-renders with expanded content

**Heatmap Click**:
1. User clicks heatmap square
2. `scrollToDate` function called
3. Finds element with ID `day-card-{date}`
4. Scrolls to element smoothly
5. Adds highlight class (removed after 2s)

## Styling System

**CSS Variables** (in `index.css`):
- `--bg`: Background color (#0a0a0b)
- `--card-bg`: Card background (#141416)
- `--text`: Primary text (#e4e4e7)
- `--text-muted`: Secondary text (#71717a)
- `--accent`: Accent color (#5eead4)
- `--accent-dim`: Dimmed accent (#2dd4bf)
- `--border`: Border color (#27272a)

**Component Styles**:
- Each component has its own `.css` file
- Uses CSS variables for theming
- Responsive with media queries
- Dark mode by default

## Build & Deployment

**Development**:
- `npm run dev` - Starts Vite dev server on port 3000
- Hot module replacement enabled
- Data files served from `public/` directory

**Production**:
- `npm run build` - Builds to `dist/` directory
- Vite plugin copies `data/` and `config/` to `dist/`
- Static files ready for GitHub Pages

**Routing**:
- Uses BrowserRouter with base path `/journal/`
- All routes are relative to base path
- Works in both dev and production

## Key Technologies

- **React 18**: UI library
- **React Router 6**: Client-side routing
- **Recharts**: Chart library for visualizations
- **Vite**: Build tool and dev server
- **CSS Modules**: Component-scoped styles

## File Structure

```
journal/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CurrentWeekGoals.jsx
│   │   ├── HeaderStats.jsx
│   │   ├── PracticeStreaks.jsx
│   │   ├── PracticeCharts.jsx
│   │   ├── HeatmapCalendar.jsx
│   │   ├── ReadingProgress.jsx
│   │   ├── WordCloud.jsx
│   │   ├── GoalsSection.jsx
│   │   ├── ExploringTagCloud.jsx
│   │   └── DayCards.jsx
│   ├── pages/              # Page components
│   │   ├── BlogList.jsx
│   │   └── BlogPost.jsx
│   ├── App.jsx            # Main app component
│   ├── App.css            # App styles
│   ├── main.jsx           # Entry point
│   ├── index.css          # Global styles
│   └── ErrorBoundary.jsx  # Error handling
├── public/
│   └── data/              # Data files (dev)
├── data/                  # Data files (production)
├── config/                # Config files
└── package.json
```

## Interactive Elements Summary

**Actually Clickable**:
- ✅ Blog link in header → Navigates to blog
- ✅ Heatmap squares → Scroll to day entry
- ✅ Tag cloud tags → Filter entries
- ✅ Day card headers → Expand/collapse
- ✅ Filter buttons → Filter by category
- ✅ Blog post cards → Navigate to post
- ✅ Back links → Navigate back

**Not Clickable (Display Only)**:
- ❌ Goal items (look clickable but aren't)
- ❌ Stats numbers
- ❌ Reading progress bars
- ❌ Word cloud words (hover only)
- ❌ Streak cards

## Performance Considerations

- **Memoization**: `useMemo` used in HeatmapCalendar and PracticeCharts for expensive calculations
- **Lazy Loading**: Could add React.lazy() for code splitting
- **Data Fetching**: All data loaded upfront (could paginate if large)
- **Re-renders**: Components only re-render when their props change

## Future Enhancements

- Add search functionality
- Make goals actually interactive (check/uncheck)
- Add export to PDF
- Add more chart types
- Add markdown support for blog posts
- Add RAG integration for semantic search

