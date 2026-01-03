"""
Stats Computation Module.
Takes parsed journal entries and books config to compute comprehensive statistics.
"""

import json
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional


def load_books_config(config_path: Path) -> dict:
    """Load the books configuration file."""
    if not config_path.exists():
        return {}
    return json.loads(config_path.read_text(encoding="utf-8"))


def load_entries(entries_path: Path) -> dict:
    """Load existing entries.json or return empty dict."""
    if not entries_path.exists():
        return {}
    return json.loads(entries_path.read_text(encoding="utf-8"))


def calculate_streak(dates: list[str], reference_date: Optional[str] = None) -> tuple[int, int]:
    """
    Calculate current and longest streak from a list of date strings.

    Args:
        dates: List of date strings in YYYY-MM-DD format
        reference_date: The date to calculate current streak from (default: today)

    Returns:
        Tuple of (current_streak, longest_streak)
    """
    if not dates:
        return 0, 0

    # Convert to datetime and sort
    date_set = set()
    for d in dates:
        try:
            date_set.add(datetime.strptime(d, "%Y-%m-%d").date())
        except ValueError:
            continue

    if not date_set:
        return 0, 0

    sorted_dates = sorted(date_set)

    # Calculate longest streak
    longest = 1
    current = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i-1]).days == 1:
            current += 1
            longest = max(longest, current)
        else:
            current = 1

    # Calculate current streak (from reference date backwards)
    if reference_date:
        ref = datetime.strptime(reference_date, "%Y-%m-%d").date()
    else:
        ref = datetime.now().date()

    # Current streak: consecutive days ending at or before reference date
    current_streak = 0
    check_date = ref

    # Allow for "today or yesterday" to count as current
    while check_date in date_set or (check_date + timedelta(days=1)) in date_set:
        if check_date in date_set:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif (check_date + timedelta(days=1)) in date_set:
            # Started yesterday, adjust
            check_date = check_date + timedelta(days=1)
            while check_date in date_set:
                current_streak += 1
                check_date -= timedelta(days=1)
            break
        else:
            break

    return current_streak, longest


def compute_practice_stats(entries: dict) -> dict:
    """Compute practice statistics across all categories."""
    stats = {
        "leetcode": {"total": 0, "easy": 0, "medium": 0, "hard": 0, "dates": []},
        "sql": {"total": 0, "dates": []},
        "system_design": {"total": 0, "hld": 0, "lld": 0, "dates": []},
        "ml": {"total": 0, "dates": []}
    }

    for date, day_data in entries.items():
        practice = day_data.get("practice", {})

        # Leetcode
        lc = practice.get("leetcode", [])
        if lc:
            stats["leetcode"]["dates"].append(date)
            for problem in lc:
                stats["leetcode"]["total"] += 1
                difficulty = problem.get("difficulty", "").lower()
                if difficulty in ["easy", "medium", "hard"]:
                    stats["leetcode"][difficulty] += 1

        # SQL
        sql = practice.get("sql", [])
        if sql:
            stats["sql"]["dates"].append(date)
            stats["sql"]["total"] += len(sql)

        # System Design
        sd = practice.get("system_design", [])
        if sd:
            stats["system_design"]["dates"].append(date)
            for item in sd:
                stats["system_design"]["total"] += 1
                design_type = (item.get("type") or "").upper()
                if design_type == "HLD":
                    stats["system_design"]["hld"] += 1
                elif design_type == "LLD":
                    stats["system_design"]["lld"] += 1

        # ML
        ml = practice.get("ml", [])
        if ml:
            stats["ml"]["dates"].append(date)
            stats["ml"]["total"] += len(ml)

    # Calculate streaks
    for category in stats:
        current, longest = calculate_streak(stats[category]["dates"])
        stats[category]["current_streak"] = current
        stats[category]["longest_streak"] = longest
        del stats[category]["dates"]  # Remove dates from output

    return stats


def compute_reading_stats(entries: dict, books_config: dict) -> dict:
    """Compute reading progress statistics."""
    reading_stats = {}

    # Track pages read and chapters for each book
    book_data = defaultdict(lambda: {
        "pages_read_set": set(),
        "chapters_touched": set(),
        "themes_covered": set()
    })

    for date, day_data in entries.items():
        for reading_entry in day_data.get("reading", []):
            book_key = reading_entry.get("book", "")
            if not book_key:
                continue

            chapter = reading_entry.get("chapter")
            pages = reading_entry.get("pages")

            if pages and len(pages) == 2:
                # Add all pages in range
                for p in range(pages[0], pages[1] + 1):
                    book_data[book_key]["pages_read_set"].add(p)

            if chapter:
                book_data[book_key]["chapters_touched"].add(chapter)

                # Look up themes from config
                if book_key in books_config:
                    ch_str = str(chapter)
                    ch_config = books_config[book_key].get("chapters", {}).get(ch_str, {})
                    for theme in ch_config.get("themes", []):
                        book_data[book_key]["themes_covered"].add(theme)

    # Compute final stats per book
    for book_key, data in book_data.items():
        config = books_config.get(book_key, {})
        total_pages = config.get("total_pages", 0)

        # Calculate pages read (distinct pages)
        pages_read = len(data["pages_read_set"])

        # Determine completed chapters
        chapters_completed = []
        for ch_num, ch_config in config.get("chapters", {}).items():
            ch_pages = ch_config.get("pages", [0, 0])
            if ch_pages:
                ch_page_set = set(range(ch_pages[0], ch_pages[1] + 1))
                if ch_page_set.issubset(data["pages_read_set"]):
                    chapters_completed.append(int(ch_num))

        reading_stats[book_key] = {
            "pages_read": pages_read,
            "total_pages": total_pages,
            "percentage": round((pages_read / total_pages * 100) if total_pages > 0 else 0, 1),
            "chapters_completed": sorted(chapters_completed),
            "themes_covered": sorted(list(data["themes_covered"]))
        }

    return reading_stats


def compute_building_stats(entries: dict) -> dict:
    """Compute project building statistics."""
    projects = defaultdict(lambda: {"days_worked": 0, "dates": []})

    for date, day_data in entries.items():
        for building_entry in day_data.get("building", []):
            project = building_entry.get("project", "Unknown")
            projects[project]["days_worked"] += 1
            projects[project]["dates"].append(date)

    # Convert to final format
    result = {}
    for project, data in projects.items():
        sorted_dates = sorted(data["dates"])
        result[project] = {
            "days_worked": data["days_worked"],
            "last_active": sorted_dates[-1] if sorted_dates else None
        }

    return {"projects": result}


def compute_exploring_stats(entries: dict) -> dict:
    """Compute exploring topics statistics."""
    topics = defaultdict(int)

    for date, day_data in entries.items():
        for exploring_entry in day_data.get("exploring", []):
            topic = exploring_entry.get("topic", "misc")
            topics[topic] += 1

    return {"topics": dict(topics)}


def compute_goals_stats(weeks_data: dict) -> dict:
    """Compute goals completion statistics."""
    total_goals = 0
    completed_goals = 0
    weeks_with_goals = 0
    weeks_completed_all = 0

    for week, data in weeks_data.items():
        goals = data.get("goals", [])
        goals_completed = data.get("goals_completed", [])

        if goals:
            weeks_with_goals += 1
            total_goals += len(goals)
            completed_goals += len(goals_completed)

            if len(goals_completed) >= len(goals):
                weeks_completed_all += 1

    # Calculate current streak of weeks with 100% completion
    # (simplified: just use weeks_completed_all for now)
    return {
        "current_week": {
            "total": len(list(weeks_data.values())[-1].get("goals", [])) if weeks_data else 0,
            "completed": len(list(weeks_data.values())[-1].get("goals_completed", [])) if weeks_data else 0,
            "percentage": 0
        },
        "all_time": {
            "total": total_goals,
            "completed": completed_goals,
            "percentage": round((completed_goals / total_goals * 100) if total_goals > 0 else 0, 1)
        },
        "streak": weeks_completed_all
    }


def compute_all_stats(entries: dict, weeks: dict, books_config: dict) -> dict:
    """Compute all statistics."""

    # Update current week percentage
    goals_stats = compute_goals_stats(weeks)
    if goals_stats["current_week"]["total"] > 0:
        goals_stats["current_week"]["percentage"] = round(
            goals_stats["current_week"]["completed"] / goals_stats["current_week"]["total"] * 100, 1
        )

    return {
        "practice": compute_practice_stats(entries),
        "reading": compute_reading_stats(entries, books_config),
        "building": compute_building_stats(entries),
        "exploring": compute_exploring_stats(entries),
        "goals": goals_stats
    }


def merge_entries(existing: dict, new_parsed: dict) -> dict:
    """Merge new parsed entries into existing entries."""
    merged = existing.copy()

    for date, day_data in new_parsed.get("days", {}).items():
        merged[date] = day_data

    return merged


def update_weeks(existing_weeks: dict, new_parsed: dict, week_id: str) -> dict:
    """Update weeks data with new parsed data."""
    updated = existing_weeks.copy()

    updated[week_id] = {
        "goals": new_parsed.get("weekly_goals", []),
        "goals_completed": new_parsed.get("week_review", {}).get("goals_completed", []),
        "review": new_parsed.get("week_review", {}).get("summary", ""),
        "highlight": new_parsed.get("week_review", {}).get("highlight")
    }

    return updated


if __name__ == "__main__":
    # Test with sample data
    sample_entries = {
        "2025-01-06": {
            "day": "Monday",
            "practice": {
                "leetcode": [{"name": "Container With Most Water", "difficulty": "medium", "insight": "two pointers"}],
                "sql": [{"name": "Window functions", "insight": "RANK vs DENSE_RANK"}],
                "system_design": [{"name": "URL shortener", "type": "HLD", "insight": "base62"}],
                "ml": []
            },
            "building": [{"project": "Journal pipeline", "work": "parser working"}],
            "reading": [{"book": "DDIA", "chapter": 3, "pages": [72, 89], "insight": "LSM trees"}],
            "exploring": [{"topic": "astronomy", "content": "gravitational lensing"}],
            "notes": "Felt scattered"
        },
        "2025-01-07": {
            "day": "Tuesday",
            "practice": {
                "leetcode": [
                    {"name": "Valid Parentheses", "difficulty": "easy", "insight": "stack"},
                    {"name": "Trapping Rain Water", "difficulty": "hard", "insight": "two pointers"}
                ],
                "sql": [],
                "system_design": [],
                "ml": [{"name": "Gradient descent", "insight": "learning rate"}]
            },
            "building": [{"project": "Journal pipeline", "work": "Ollama integration"}],
            "reading": [{"book": "AI_Engineering", "chapter": 1, "pages": [1, 32], "insight": "AI vs ML eng"}],
            "exploring": [{"topic": "philosophy", "content": "stoicism"}],
            "notes": "Better day"
        }
    }

    sample_weeks = {
        "2025-W02": {
            "goals": ["Finish DDIA ch4", "5 leetcode", "Journal pipeline", "Start AI Engineering ch1"],
            "goals_completed": ["5 leetcode", "Journal pipeline", "Start AI Engineering ch1"]
        }
    }

    config_path = Path(__file__).parent.parent / "config" / "books.json"
    books = load_books_config(config_path)

    stats = compute_all_stats(sample_entries, sample_weeks, books)
    print(json.dumps(stats, indent=2))
