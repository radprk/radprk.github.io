#!/usr/bin/env python3
"""
Main sync script for the journal pipeline.
Orchestrates: Google Drive -> Ollama Parser -> Stats -> GitHub

Usage:
    python sync.py                    # Sync current week
    python sync.py 2025-W02           # Sync specific week
    python sync.py --all              # Sync all available weeks
    python sync.py --dry-run          # Show what would happen without changes
    python sync.py --no-push          # Commit but don't push
    python sync.py --fallback         # Use regex parser instead of Ollama
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Import pipeline modules
from fallback_parser import parse_journal_fallback
from stats import (
    compute_all_stats,
    load_books_config,
    load_entries,
    merge_entries,
    update_weeks,
)

# Try to import optional modules
try:
    from parser import parse_journal
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

try:
    from google_drive import fetch_weekly_journal, list_journal_documents, GOOGLE_API_AVAILABLE
except ImportError:
    GOOGLE_API_AVAILABLE = False

try:
    from github_sync import sync_journal_data, pull_latest
    GIT_AVAILABLE = True
except ImportError:
    GIT_AVAILABLE = False


def get_paths():
    """Get all relevant paths."""
    base = Path(__file__).parent.parent
    return {
        "base": base,
        "config": base / "config",
        "data": base / "data",
        "weeks": base / "weeks",
        "books_config": base / "config" / "books.json",
        "entries": base / "data" / "entries.json",
        "stats": base / "data" / "stats.json",
        "weeks_data": base / "data" / "weeks.json",
        "log": base / "logs" / "sync.log",
    }


def setup_file_logging(log_path: Path):
    """Add file logging handler."""
    log_path.parent.mkdir(exist_ok=True)
    file_handler = logging.FileHandler(log_path, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    ))
    logger.addHandler(file_handler)


def load_existing_data(paths: dict) -> tuple[dict, dict]:
    """Load existing entries and weeks data."""
    entries = {}
    weeks = {}

    if paths["entries"].exists():
        entries = json.loads(paths["entries"].read_text(encoding="utf-8"))

    if paths["weeks_data"].exists():
        weeks = json.loads(paths["weeks_data"].read_text(encoding="utf-8"))

    return entries, weeks


def save_data(paths: dict, entries: dict, weeks: dict, stats: dict):
    """Save all data files."""
    paths["data"].mkdir(exist_ok=True)

    paths["entries"].write_text(
        json.dumps(entries, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    paths["stats"].write_text(
        json.dumps(stats, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    paths["weeks_data"].write_text(
        json.dumps(weeks, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    logger.info(f"Saved {len(entries)} entries, {len(weeks)} weeks")


def save_raw_markdown(paths: dict, week_id: str, content: str):
    """Save raw markdown for future RAG use."""
    paths["weeks"].mkdir(exist_ok=True)
    md_path = paths["weeks"] / f"{week_id}.md"
    md_path.write_text(content, encoding="utf-8")
    logger.info(f"Saved raw markdown: {md_path.name}")


def parse_content(content: str, week_id: str, use_fallback: bool = False) -> dict:
    """Parse journal content using Ollama or fallback parser."""
    filename = f"{week_id}.md"

    if use_fallback or not OLLAMA_AVAILABLE:
        if not use_fallback:
            logger.warning("Ollama parser not available, using fallback")
        logger.info("Parsing with regex fallback parser")
        return parse_journal_fallback(content, filename)
    else:
        logger.info("Parsing with Ollama (Mistral)")
        result = parse_journal(content, filename)
        if result is None:
            logger.warning("Ollama parsing failed, falling back to regex")
            return parse_journal_fallback(content, filename)
        return result


def sync_week(
    week_id: str,
    paths: dict,
    existing_entries: dict,
    existing_weeks: dict,
    books_config: dict,
    use_fallback: bool = False,
    from_file: bool = False
) -> tuple[dict, dict, dict]:
    """
    Sync a single week's journal.

    Args:
        week_id: Week identifier (e.g., '2025-W02')
        paths: Path dictionary
        existing_entries: Existing entries data
        existing_weeks: Existing weeks data
        books_config: Books configuration
        use_fallback: Force use of regex parser
        from_file: Load from local file instead of Google Drive

    Returns:
        Updated (entries, weeks, stats) tuple
    """
    logger.info(f"Syncing week: {week_id}")

    # Get content
    if from_file:
        md_path = paths["weeks"] / f"{week_id}.md"
        if not md_path.exists():
            raise FileNotFoundError(f"Local file not found: {md_path}")
        content = md_path.read_text(encoding="utf-8")
        logger.info(f"Loaded from local file: {md_path}")
    else:
        if not GOOGLE_API_AVAILABLE:
            raise RuntimeError(
                "Google API not available. Install with:\n"
                "pip install google-api-python-client google-auth-oauthlib"
            )

        result = fetch_weekly_journal(week_id=week_id)
        if result is None:
            raise RuntimeError(f"Failed to fetch journal for {week_id}")

        content, _, modified_time = result
        logger.info(f"Fetched from Google Drive (modified: {modified_time})")

        # Save raw markdown
        save_raw_markdown(paths, week_id, content)

    # Parse content
    parsed = parse_content(content, week_id, use_fallback)

    # Merge data
    entries = merge_entries(existing_entries, parsed)
    weeks = update_weeks(existing_weeks, parsed, week_id)

    # Compute stats
    stats = compute_all_stats(entries, weeks, books_config)

    return entries, weeks, stats


def main():
    parser = argparse.ArgumentParser(
        description="Sync journal from Google Docs to GitHub Pages"
    )
    parser.add_argument(
        "week",
        nargs="?",
        help="Week to sync (e.g., 2025-W02). Defaults to current week."
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Sync all available weeks from Google Drive"
    )
    parser.add_argument(
        "--local",
        action="store_true",
        help="Use local markdown files instead of Google Drive"
    )
    parser.add_argument(
        "--fallback",
        action="store_true",
        help="Use regex parser instead of Ollama"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would happen without making changes"
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Commit but don't push to GitHub"
    )
    parser.add_argument(
        "--no-commit",
        action="store_true",
        help="Update local files but don't commit"
    )
    parser.add_argument(
        "--pull",
        action="store_true",
        help="Pull latest changes before syncing"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available journal documents in Google Drive"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    paths = get_paths()
    setup_file_logging(paths["log"])

    logger.info("=" * 50)
    logger.info("Journal Sync Pipeline")
    logger.info("=" * 50)

    # List mode
    if args.list:
        if not GOOGLE_API_AVAILABLE:
            print("Google API not available")
            sys.exit(1)
        print("\nJournal documents in Google Drive:")
        docs = list_journal_documents()
        for doc in docs:
            print(f"  - {doc['name']} (modified: {doc['modifiedTime'][:10]})")
        return

    # Pull latest if requested
    if args.pull and GIT_AVAILABLE:
        logger.info("Pulling latest changes...")
        success, output = pull_latest()
        if not success:
            logger.warning(f"Pull failed: {output}")

    # Load existing data
    existing_entries, existing_weeks = load_existing_data(paths)
    books_config = load_books_config(paths["books_config"])

    logger.info(f"Loaded {len(existing_entries)} existing entries")

    # Determine weeks to sync
    weeks_to_sync = []

    if args.all:
        if args.local:
            # Get all local markdown files
            weeks_to_sync = [f.stem for f in paths["weeks"].glob("*.md")]
        else:
            # Get all from Google Drive
            if GOOGLE_API_AVAILABLE:
                docs = list_journal_documents()
                import re
                for doc in docs:
                    match = re.search(r'(\d{4}-W\d{2})', doc['name'])
                    if match:
                        weeks_to_sync.append(match.group(1))
    elif args.week:
        weeks_to_sync = [args.week]
    else:
        # Current week
        weeks_to_sync = [datetime.now().strftime("%Y-W%V")]

    if not weeks_to_sync:
        logger.error("No weeks to sync")
        sys.exit(1)

    logger.info(f"Weeks to sync: {weeks_to_sync}")

    if args.dry_run:
        logger.info("[DRY RUN MODE - No changes will be made]")
        for week_id in weeks_to_sync:
            logger.info(f"Would sync: {week_id}")
        return

    # Sync each week
    entries = existing_entries
    weeks = existing_weeks
    stats = {}

    for week_id in sorted(weeks_to_sync):
        try:
            entries, weeks, stats = sync_week(
                week_id=week_id,
                paths=paths,
                existing_entries=entries,
                existing_weeks=weeks,
                books_config=books_config,
                use_fallback=args.fallback,
                from_file=args.local
            )
        except Exception as e:
            logger.error(f"Failed to sync {week_id}: {e}")
            if len(weeks_to_sync) == 1:
                sys.exit(1)
            continue

    # Save data
    save_data(paths, entries, weeks, stats)

    # Git operations
    if not args.no_commit and GIT_AVAILABLE:
        logger.info("Committing changes...")
        week_label = weeks_to_sync[0] if len(weeks_to_sync) == 1 else f"{len(weeks_to_sync)} weeks"
        success, message = sync_journal_data(
            week_id=week_label,
            push=not args.no_push
        )
        if success:
            logger.info(f"Git: {message}")
        else:
            logger.error(f"Git failed: {message}")
    elif args.no_commit:
        logger.info("Skipping git commit (--no-commit)")

    logger.info("Sync complete!")


if __name__ == "__main__":
    main()
