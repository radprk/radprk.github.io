"""
Journal Parser using local Ollama (Mistral) for flexible extraction.
Processes day-by-day for faster parsing.
Now supports URL-based extraction for LeetCode problems.
"""

import json
import re
import time
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from leetcode import parse_leetcode_from_text, extract_leetcode_urls


def get_day_prompt(day_text: str, date_str: str, day_name: str) -> str:
    """Generate a compact prompt for a single day."""
    return f'''Extract JSON from this journal day. Return ONLY valid JSON, no explanation.

Date: {date_str} ({day_name})

TEXT:
{day_text}

Return this exact structure:
{{"practice": {{"leetcode": [{{"name": "...", "difficulty": "easy|medium|hard", "insight": "..."}}], "sql": [...], "system_design": [{{"name": "...", "type": "HLD|LLD", "insight": "..."}}], "ml": [...]}}, "building": [{{"project": "...", "work": "..."}}], "reading": [{{"book": "DDIA or AI_Engineering", "chapter": 1, "pages": [1, 20], "insight": "..."}}], "exploring": [{{"topic": "astronomy|philosophy|history|technology|etc", "content": "..."}}], "notes": "..." or null}}'''


def get_goals_prompt(goals_text: str) -> str:
    """Generate prompt for weekly goals."""
    return f'''Extract the weekly goals as a JSON array. Return ONLY the JSON array.

TEXT:
{goals_text}

Return like: ["goal 1", "goal 2", "goal 3"]'''


def get_review_prompt(review_text: str) -> str:
    """Generate prompt for week review."""
    return f'''Extract week review as JSON. Return ONLY JSON.

TEXT:
{review_text}

Return: {{"summary": "...", "goals_completed": ["goal1", "goal2"], "highlight": "...", "next_week": "..."}}'''


def call_ollama(prompt: str, model: str = "mistral", timeout: int = 120) -> Optional[str]:
    """Call Ollama with a shorter timeout for day-by-day processing."""
    url = "http://localhost:11434/api/generate"

    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 1024,  # Smaller limit for single day
            "temperature": 0.1
        }
    }).encode('utf-8')

    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method='POST'
        )

        start = time.time()
        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode('utf-8'))
            elapsed = time.time() - start
            return result.get("response", "").strip(), elapsed

    except urllib.error.URLError as e:
        print(f"  Connection error: {e}")
        return None, 0
    except Exception as e:
        print(f"  Error: {e}")
        return None, 0


def extract_json(response: str) -> Optional[dict]:
    """Extract JSON from response."""
    if not response:
        return None

    # Try code blocks first
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', response)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try direct parse
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # Try finding JSON object
    match = re.search(r'(\{[\s\S]*\})', response)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding JSON array
    match = re.search(r'(\[[\s\S]*\])', response)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    return None


def split_journal(markdown: str) -> dict:
    """Split journal into goals, days, and review sections."""
    sections = {
        "goals": "",
        "days": {},
        "review": ""
    }

    # Extract goals section
    goals_match = re.search(r'##\s*goals?\s*\n(.*?)(?=\n---|\n#\s+\w+day)', markdown, re.DOTALL | re.IGNORECASE)
    if goals_match:
        sections["goals"] = goals_match.group(1).strip()

    # Extract each day
    day_pattern = r'#\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(\w+)\s+(\d+)(.*?)(?=\n#\s+\w+day|\n##\s*week-review|$)'
    for match in re.finditer(day_pattern, markdown, re.DOTALL | re.IGNORECASE):
        day_name = match.group(1)
        day_text = match.group(4).strip()
        sections["days"][day_name] = day_text

    # Extract week review
    review_match = re.search(r'##\s*week-review\s*\n(.*?)(?=\n---\s*$|$)', markdown, re.DOTALL | re.IGNORECASE)
    if review_match:
        sections["review"] = review_match.group(1).strip()

    return sections


def get_date_for_day(day_name: str, year: int, week: int) -> str:
    """Get the date string for a day name in a given week."""
    days = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6}
    offset = days.get(day_name.lower(), 0)

    jan4 = datetime(year, 1, 4)
    week1_monday = jan4 - timedelta(days=jan4.weekday())
    target_monday = week1_monday + timedelta(weeks=week - 1)
    target_day = target_monday + timedelta(days=offset)

    return target_day.strftime("%Y-%m-%d")


def extract_urls_from_section(day_text: str) -> dict:
    """
    Extract structured data from URLs in the text.
    This provides instant, accurate metadata without LLM parsing.
    """
    result = {
        "leetcode": [],
        "sql": [],
        "system_design": [],
        "ml": []
    }

    # Extract LeetCode problems from URLs
    leetcode_problems = parse_leetcode_from_text(day_text)
    for problem in leetcode_problems:
        result["leetcode"].append({
            "name": problem.get("name"),
            "difficulty": problem.get("difficulty", "unknown"),
            "tags": problem.get("tags", []),
            "url": problem.get("url"),
            "insight": None  # User can add manually
        })

    return result


def extract_reading_from_text(text: str) -> list:
    """Extract reading entries from simple text format like 'DDIA 4, pages 111-130'."""
    reading = []

    # Pattern: DDIA X, pages Y-Z or DDIA chapter X pages Y-Z
    ddia_pattern = r'DDIA\s*(?:chapter\s*)?(\d+)(?:,?\s*pages?\s*(\d+)[-–](\d+))?'
    for match in re.finditer(ddia_pattern, text, re.IGNORECASE):
        entry = {
            "book": "DDIA",
            "chapter": int(match.group(1)),
            "pages": None,
            "insight": None
        }
        if match.group(2) and match.group(3):
            entry["pages"] = [int(match.group(2)), int(match.group(3))]
        reading.append(entry)

    # AI Engineering pattern
    ai_pattern = r'AI\s*Engineering\s*(?:chapter\s*)?(\d+)(?:,?\s*pages?\s*(\d+)[-–](\d+))?'
    for match in re.finditer(ai_pattern, text, re.IGNORECASE):
        entry = {
            "book": "AI_Engineering",
            "chapter": int(match.group(1)),
            "pages": None,
            "insight": None
        }
        if match.group(2) and match.group(3):
            entry["pages"] = [int(match.group(2)), int(match.group(3))]
        reading.append(entry)

    return reading


def extract_building_from_text(text: str) -> list:
    """Extract building/project entries from simple text format."""
    building = []

    # Find the Building section
    building_match = re.search(r'##\s*Building\s*\n(.*?)(?=\n##|\Z)', text, re.DOTALL | re.IGNORECASE)
    if building_match:
        section = building_match.group(1).strip()
        # Extract bullet points
        for line in section.split('\n'):
            line = line.strip()
            if line.startswith('-'):
                project = line[1:].strip()
                if project:
                    building.append({
                        "project": project,
                        "work": None
                    })

    return building


def normalize_day_data(data: dict) -> dict:
    """Normalize a single day's data structure."""
    if not isinstance(data, dict):
        return {"practice": {"leetcode": [], "sql": [], "system_design": [], "ml": []},
                "building": [], "reading": [], "exploring": [], "notes": None}

    # Handle practice
    practice_data = data.get("practice", {})
    if isinstance(practice_data, dict):
        practice = {
            "leetcode": practice_data.get("leetcode", []) or [],
            "sql": practice_data.get("sql", []) or [],
            "system_design": practice_data.get("system_design", []) or [],
            "ml": practice_data.get("ml", []) or []
        }
    else:
        practice = {"leetcode": [], "sql": [], "system_design": [], "ml": []}

    return {
        "practice": practice,
        "building": data.get("building", []) or [],
        "reading": data.get("reading", []) or [],
        "exploring": data.get("exploring", []) or [],
        "notes": data.get("notes")
    }


def parse_journal_daily(
    markdown_text: str,
    week_filename: str,
    model: str = "mistral",
    existing_entries: Optional[dict] = None,
    force_days: Optional[list] = None
) -> Optional[dict]:
    """
    Parse journal day-by-day for faster processing.

    Args:
        markdown_text: Raw journal markdown
        week_filename: e.g., "2025-W02.md"
        model: Ollama model to use
        existing_entries: Already parsed entries (for CDC - skip existing days)
        force_days: List of day names to force re-parse (e.g., ["Thursday", "Friday"])
    """
    # Parse week identifier
    match = re.match(r'(\d{4})-W(\d{2})', week_filename)
    if not match:
        print(f"Invalid week filename: {week_filename}")
        return None

    year, week = int(match.group(1)), int(match.group(2))

    print(f"Parsing {week_filename} (incremental mode)")
    print("=" * 50)

    # Split into sections
    sections = split_journal(markdown_text)

    result = {
        "weekly_goals": [],
        "days": {},
        "week_review": {}
    }

    total_time = 0
    skipped = 0

    # Parse goals (always, they might change)
    if sections["goals"]:
        print("Parsing weekly goals...", end=" ", flush=True)
        response, elapsed = call_ollama(get_goals_prompt(sections["goals"]), model, timeout=60)
        total_time += elapsed
        if response:
            goals = extract_json(response)
            if isinstance(goals, list):
                result["weekly_goals"] = goals
                print(f"OK ({elapsed:.1f}s) - {len(goals)} goals")
            else:
                print(f"OK ({elapsed:.1f}s) - couldn't parse")
        else:
            print("TIMEOUT")

    # Parse each day
    for day_name, day_text in sections["days"].items():
        if not day_text.strip():
            continue

        date_str = get_date_for_day(day_name, year, week)

        # Check if we should skip this day (CDC logic)
        force_this_day = force_days and day_name.lower() in [d.lower() for d in force_days]
        already_exists = existing_entries and date_str in existing_entries

        if already_exists and not force_this_day:
            print(f"Skipping {day_name} ({date_str}) - already parsed")
            # Copy existing data to result
            result["days"][date_str] = existing_entries[date_str]
            skipped += 1
            continue

        print(f"Parsing {day_name} ({date_str})...", end=" ", flush=True)

        # Try URL-based extraction first (faster, more accurate)
        has_leetcode_urls = bool(extract_leetcode_urls(day_text))

        if has_leetcode_urls:
            # Use URL extraction for practice section
            print("(URL mode)...", end=" ", flush=True)
            practice_data = extract_urls_from_section(day_text)
            reading_data = extract_reading_from_text(day_text)
            building_data = extract_building_from_text(day_text)

            # Extract notes section
            notes_match = re.search(r'##\s*Notes\s*\n(.*?)(?=\n##|\n---|\Z)', day_text, re.DOTALL | re.IGNORECASE)
            notes = notes_match.group(1).strip() if notes_match else None

            result["days"][date_str] = {
                "day": day_name.capitalize(),
                "practice": practice_data,
                "building": building_data,
                "reading": reading_data,
                "exploring": [],
                "notes": notes if notes else None
            }
            print(f"OK ({len(practice_data['leetcode'])} LC problems)")
        else:
            # Fall back to Ollama for complex text
            response, elapsed = call_ollama(get_day_prompt(day_text, date_str, day_name), model, timeout=90)
            total_time += elapsed

            if response:
                day_data = extract_json(response)
                if day_data:
                    result["days"][date_str] = {
                        "day": day_name.capitalize(),
                        **normalize_day_data(day_data)
                    }
                    print(f"OK ({elapsed:.1f}s)")
                else:
                    print(f"OK ({elapsed:.1f}s) - couldn't parse JSON")
            else:
                print("TIMEOUT")

    # Parse week review (always, might change)
    if sections["review"]:
        print("Parsing week review...", end=" ", flush=True)
        response, elapsed = call_ollama(get_review_prompt(sections["review"]), model, timeout=60)
        total_time += elapsed
        if response:
            review = extract_json(response)
            if isinstance(review, dict):
                result["week_review"] = review
                print(f"OK ({elapsed:.1f}s)")
            else:
                print(f"OK ({elapsed:.1f}s) - couldn't parse")
        else:
            print("TIMEOUT")

    print("=" * 50)
    parsed_count = len(result['days']) - skipped
    print(f"Total: {total_time:.1f}s | Parsed: {parsed_count} days | Skipped: {skipped} days")

    return result


def load_existing_entries(data_dir: Path) -> dict:
    """Load existing entries.json if it exists."""
    entries_file = data_dir / "entries.json"
    if entries_file.exists():
        try:
            return json.loads(entries_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
    return {}


def parse_journal_file(
    filepath: Path,
    model: str = "mistral",
    incremental: bool = True,
    force_days: Optional[list] = None
) -> Optional[dict]:
    """
    Parse a journal file from disk using day-by-day processing.

    Args:
        filepath: Path to journal markdown file
        model: Ollama model to use
        incremental: If True, skip days already in entries.json (CDC mode)
        force_days: List of day names to force re-parse even if they exist
    """
    if not filepath.exists():
        print(f"File not found: {filepath}")
        return None

    # Load existing entries for CDC mode
    existing = None
    if incremental:
        data_dir = filepath.parent.parent / "data"
        existing = load_existing_entries(data_dir)
        if existing:
            print(f"Loaded {len(existing)} existing entries (CDC mode)")

    markdown_text = filepath.read_text(encoding="utf-8")
    return parse_journal_daily(
        markdown_text,
        filepath.name,
        model,
        existing_entries=existing,
        force_days=force_days
    )


if __name__ == "__main__":
    import sys

    # Parse arguments
    args = sys.argv[1:]
    filepath = None
    force_days = []
    full_parse = False

    for arg in args:
        if arg == "--full":
            full_parse = True
        elif arg.startswith("--force="):
            # e.g., --force=Thursday,Friday
            force_days = arg.split("=")[1].split(",")
        elif not arg.startswith("-"):
            filepath = Path(arg)

    if not filepath:
        filepath = Path(__file__).parent.parent / "weeks" / "2025-W02.md"

    print(f"File: {filepath}")
    if force_days:
        print(f"Force re-parse: {force_days}")
    if full_parse:
        print("Mode: Full parse (no CDC)")
    else:
        print("Mode: Incremental (CDC)")
    print()

    result = parse_journal_file(
        filepath,
        incremental=not full_parse,
        force_days=force_days if force_days else None
    )

    if result:
        print("\n" + "=" * 50)
        print("PARSED RESULT:")
        print("=" * 50)
        print(json.dumps(result, indent=2))
    else:
        print("Failed to parse journal")
        sys.exit(1)
