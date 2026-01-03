# Journal Sync Pipeline

Syncs daily journal entries from Google Docs to structured JSON for the portfolio site.

## Quick Start

```powershell
# 1. Install Python dependencies
pip install google-api-python-client google-auth-oauthlib

# 2. Test with local sample data (no Google/Ollama needed)
python journal/pipeline/test_pipeline.py

# 3. Test sync with local files
python journal/pipeline/sync.py --local --fallback

# 4. Set up Google Drive (see below)
# 5. Set up daily scheduling
```

## Architecture

```
Google Docs (weekly journal)
         │
         ▼
    Google Drive API
         │
         ▼
    Ollama (Mistral) ──or──► Fallback Regex Parser
         │
         ▼
    Stats Computation
         │
         ▼
    JSON Data Files
         │
         ▼
    Git Commit & Push
         │
         ▼
    GitHub Pages (auto-rebuild)
```

## Directory Structure

```
journal/
├── config/
│   ├── books.json              # Book chapter/page configs
│   ├── oauth_credentials.json  # Google OAuth (you create)
│   └── token.json              # OAuth token (auto-created)
├── data/
│   ├── entries.json            # Structured daily entries
│   ├── stats.json              # Computed statistics
│   └── weeks.json              # Weekly summaries
├── weeks/
│   └── 2025-W02.md             # Raw markdown backup
├── logs/
│   └── sync.log                # Sync logs
└── pipeline/
    ├── sync.py                 # Main orchestrator
    ├── parser.py               # Ollama parser
    ├── fallback_parser.py      # Regex parser
    ├── stats.py                # Stats computation
    ├── google_drive.py         # Drive API
    ├── github_sync.py          # Git operations
    ├── run_sync.bat            # Windows batch script
    └── setup_scheduler.ps1     # Task Scheduler setup
```

## Setup

### 1. Python Dependencies

```powershell
pip install google-api-python-client google-auth-oauthlib
```

### 2. Ollama Setup (Windows)

1. Download Ollama from: https://ollama.ai
2. Install and run:
   ```powershell
   ollama pull mistral
   ollama serve
   ```

### 3. Google Drive API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Drive API**
4. Go to **APIs & Services > Credentials**
5. Create **OAuth 2.0 Client ID** (Desktop application)
6. Download the JSON file
7. Save as `journal/config/oauth_credentials.json`

First run will open a browser for authentication. After that, it's automatic.

### 4. Windows Task Scheduler

```powershell
# Edit run_sync.bat first - update REPO_PATH

# Then run as Administrator:
.\journal\pipeline\setup_scheduler.ps1 -RepoPath "C:\path\to\radprk.github.io" -Time "23:00"
```

## Usage

### Manual Sync

```powershell
# Sync current week
python journal/pipeline/sync.py

# Sync specific week
python journal/pipeline/sync.py 2025-W02

# Sync all available weeks
python journal/pipeline/sync.py --all

# Use local files instead of Google Drive
python journal/pipeline/sync.py --local

# Use regex parser instead of Ollama
python journal/pipeline/sync.py --fallback

# Dry run (show what would happen)
python journal/pipeline/sync.py --dry-run

# Don't push to GitHub
python journal/pipeline/sync.py --no-push

# List available docs in Google Drive
python journal/pipeline/sync.py --list
```

### Test the Pipeline

```powershell
# Full test suite
python journal/pipeline/test_pipeline.py

# Test parser directly
python journal/pipeline/parser.py journal/weeks/2025-W02.md

# Test Google Drive connection
python journal/pipeline/google_drive.py list
```

## Journal Format

Weekly doc named: `Journal - 2025-W02`

```markdown
# Week of Jan 6, 2025

## goals
- Finish DDIA chapter 4
- 5 leetcode problems
- Build journal pipeline

---

# Monday, Jan 6

## practice
- leetcode: Container With Most Water, medium - two pointers approach
- sql: Window functions - RANK vs DENSE_RANK
- system design: URL shortener HLD - base62 encoding

## building
Journal pipeline - got parser working

## reading
DDIA ch3 (pages 72-89) - LSM trees vs B-trees

## exploring
Watched a video on gravitational lensing. Wild stuff.

## notes
Good day, need more focus tomorrow.

---

# Tuesday, Jan 7
...

---

## week-review
Goals hit: 3/4 - didn't finish DDIA ch4
Highlight: Pipeline works!
Next week: Finish DDIA ch4
```

## Troubleshooting

### "Ollama not found"
Make sure Ollama is installed and `ollama serve` is running.

### "Google API not available"
```powershell
pip install google-api-python-client google-auth-oauthlib
```

### "No journal document found"
Check document name format: `Journal - 2025-W02`

### "Authentication error"
Delete `journal/config/token.json` and re-authenticate.

### Task not running on wake
Check Task Scheduler settings: "Start task if missed"

## Adding New Books

Edit `journal/config/books.json`:

```json
{
  "NewBook": {
    "full_title": "Full Book Title",
    "author": "Author Name",
    "total_pages": 300,
    "chapters": {
      "1": {
        "title": "Chapter Title",
        "pages": [1, 30],
        "themes": ["theme1", "theme2"]
      }
    }
  }
}
```
