"""
Fallback regex-based parser for testing without Ollama.
This provides a deterministic parser that works offline.
"""

import re
from datetime import datetime, timedelta
from typing import Optional


def parse_week_identifier(filename: str) -> tuple[int, int]:
    """Extract year and week number from filename like '2025-W02.md'."""
    match = re.match(r'(\d{4})-W(\d{2})', filename)
    if match:
        return int(match.group(1)), int(match.group(2))
    raise ValueError(f"Invalid week filename format: {filename}")


def get_week_start_date(year: int, week: int) -> datetime:
    """Get the Monday date for a given ISO week."""
    jan4 = datetime(year, 1, 4)
    week1_monday = jan4 - timedelta(days=jan4.weekday())
    target_monday = week1_monday + timedelta(weeks=week - 1)
    return target_monday


def day_name_to_offset(day_name: str) -> int:
    """Convert day name to offset from Monday."""
    days = {
        "monday": 0, "tuesday": 1, "wednesday": 2,
        "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6
    }
    return days.get(day_name.lower(), 0)


def parse_leetcode(line: str) -> Optional[dict]:
    """Parse a leetcode practice line."""
    line_lower = line.lower()
    if "leetcode" not in line_lower:
        return None

    # Extract problem name - usually after "leetcode:"
    name_match = re.search(r'leetcode[:\s]+([^,\-]+)', line, re.IGNORECASE)
    name = name_match.group(1).strip() if name_match else "Unknown"

    # Extract difficulty
    difficulty = None
    for d in ["easy", "medium", "hard"]:
        if d in line_lower:
            difficulty = d
            break

    # Extract insight - usually after difficulty or after dash
    insight = ""
    dash_match = re.search(r'\s[-–]\s(.+)$', line)
    if dash_match:
        insight = dash_match.group(1).strip()

    return {"name": name, "difficulty": difficulty, "insight": insight}


def parse_sql(line: str) -> Optional[dict]:
    """Parse a SQL practice line."""
    line_lower = line.lower()
    if "sql" not in line_lower:
        return None

    # Extract topic - usually after "sql:"
    name_match = re.search(r'sql[:\s]+([^-–]+)', line, re.IGNORECASE)
    name = name_match.group(1).strip() if name_match else line

    insight = ""
    dash_match = re.search(r'\s[-–]\s(.+)$', line)
    if dash_match:
        insight = dash_match.group(1).strip()

    return {"name": name, "insight": insight}


def parse_system_design(line: str) -> Optional[dict]:
    """Parse a system design practice line."""
    line_lower = line.lower()
    if "system design" not in line_lower and "design:" not in line_lower:
        return None

    name_match = re.search(r'(?:system\s+)?design[:\s]+([^-–]+)', line, re.IGNORECASE)
    name = name_match.group(1).strip() if name_match else "Unknown"

    design_type = "HLD" if "hld" in line_lower else ("LLD" if "lld" in line_lower else None)

    insight = ""
    dash_match = re.search(r'\s[-–]\s(.+)$', line)
    if dash_match:
        insight = dash_match.group(1).strip()

    return {"name": name, "type": design_type, "insight": insight}


def parse_ml(line: str) -> Optional[dict]:
    """Parse an ML practice line."""
    line_lower = line.lower()
    if "ml:" not in line_lower and "machine learning" not in line_lower:
        return None

    name_match = re.search(r'ml[:\s]+([^-–]+)', line, re.IGNORECASE)
    name = name_match.group(1).strip() if name_match else line

    insight = ""
    dash_match = re.search(r'\s[-–]\s(.+)$', line)
    if dash_match:
        insight = dash_match.group(1).strip()

    return {"name": name, "insight": insight}


def parse_reading(line: str) -> Optional[dict]:
    """Parse a reading entry line."""
    result = {"book": None, "chapter": None, "pages": None, "insight": ""}

    # Look for book abbreviations
    if "ddia" in line.lower():
        result["book"] = "DDIA"
    elif "ai engineering" in line.lower() or "ai eng" in line.lower():
        result["book"] = "AI_Engineering"

    if not result["book"]:
        return None

    # Extract chapter
    ch_match = re.search(r'ch(?:apter)?\.?\s*(\d+)', line, re.IGNORECASE)
    if ch_match:
        result["chapter"] = int(ch_match.group(1))

    # Extract pages
    pages_match = re.search(r'pages?\s+(\d+)\s*[-–to]+\s*(\d+)', line, re.IGNORECASE)
    if pages_match:
        result["pages"] = [int(pages_match.group(1)), int(pages_match.group(2))]

    # Extract insight
    dash_match = re.search(r'\s[-–]\s(.+)$', line)
    if dash_match:
        result["insight"] = dash_match.group(1).strip()

    return result


def parse_building(text: str) -> list[dict]:
    """Parse building section text."""
    results = []
    lines = text.strip().split('\n')

    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue

        # Remove list marker
        line = re.sub(r'^[-*]\s*', '', line)

        # Try to split on dash to get project name and work
        parts = re.split(r'\s[-–]\s', line, maxsplit=1)
        if len(parts) == 2:
            results.append({"project": parts[0].strip(), "work": parts[1].strip()})
        else:
            results.append({"project": line, "work": ""})

    return results


def parse_exploring(text: str) -> list[dict]:
    """Parse exploring section text."""
    results = []

    # Topic detection keywords
    topic_keywords = {
        "astronomy": ["space", "star", "planet", "galaxy", "telescope", "gravitational", "cosmos", "universe", "moon", "sun"],
        "philosophy": ["stoic", "philosophy", "ethics", "meaning", "existence", "consciousness", "moral"],
        "history": ["history", "ancient", "war", "civilization", "century", "era"],
        "music": ["music", "song", "band", "album", "concert", "instrument"],
        "technology": ["computer", "tech", "software", "hardware", "programming", "ai", "robot"],
        "science": ["physics", "chemistry", "biology", "experiment", "research", "scientific"],
        "art": ["art", "painting", "sculpture", "museum", "artist"],
        "psychology": ["psychology", "mind", "behavior", "cognitive", "mental"]
    }

    content = text.strip()
    text_lower = content.lower()

    # Detect topic
    detected_topic = "misc"
    for topic, keywords in topic_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                detected_topic = topic
                break
        if detected_topic != "misc":
            break

    if content:
        results.append({"topic": detected_topic, "content": content})

    return results


def parse_journal_fallback(markdown_text: str, week_filename: str) -> dict:
    """
    Parse journal markdown using regex patterns.
    This is a fallback when Ollama is not available.
    """
    year, week = parse_week_identifier(week_filename)
    week_start = get_week_start_date(year, week)

    result = {
        "weekly_goals": [],
        "days": {},
        "week_review": {}
    }

    # Split into sections by day headers
    sections = re.split(r'^#\s+', markdown_text, flags=re.MULTILINE)

    for section in sections:
        section = section.strip()
        if not section:
            continue

        # Check if this is the week header with goals
        if section.startswith("Week of"):
            goals_match = re.search(r'##\s*goals?\s*\n(.*?)(?=\n---|\n##|$)', section, re.DOTALL | re.IGNORECASE)
            if goals_match:
                goals_text = goals_match.group(1)
                for line in goals_text.strip().split('\n'):
                    line = line.strip()
                    if line and line.startswith('-'):
                        result["weekly_goals"].append(line[1:].strip())

        # Check if this is a day section
        day_match = re.match(r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(\w+)\s+(\d+)', section, re.IGNORECASE)
        if day_match:
            day_name = day_match.group(1)
            offset = day_name_to_offset(day_name)
            day_date = week_start + timedelta(days=offset)
            date_str = day_date.strftime("%Y-%m-%d")

            day_data = {
                "day": day_name.capitalize(),
                "practice": {"leetcode": [], "sql": [], "system_design": [], "ml": []},
                "building": [],
                "reading": [],
                "exploring": [],
                "notes": None
            }

            # Parse practice section
            practice_match = re.search(r'##\s*practice\s*\n(.*?)(?=\n##|$)', section, re.DOTALL | re.IGNORECASE)
            if practice_match:
                practice_text = practice_match.group(1)
                for line in practice_text.strip().split('\n'):
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    line = re.sub(r'^[-*]\s*', '', line)

                    lc = parse_leetcode(line)
                    if lc:
                        day_data["practice"]["leetcode"].append(lc)
                        continue

                    sql = parse_sql(line)
                    if sql:
                        day_data["practice"]["sql"].append(sql)
                        continue

                    sd = parse_system_design(line)
                    if sd:
                        day_data["practice"]["system_design"].append(sd)
                        continue

                    ml = parse_ml(line)
                    if ml:
                        day_data["practice"]["ml"].append(ml)

            # Parse building section
            building_match = re.search(r'##\s*building\s*\n(.*?)(?=\n##|$)', section, re.DOTALL | re.IGNORECASE)
            if building_match:
                day_data["building"] = parse_building(building_match.group(1))

            # Parse reading section
            reading_match = re.search(r'##\s*reading\s*\n(.*?)(?=\n##|$)', section, re.DOTALL | re.IGNORECASE)
            if reading_match:
                reading_text = reading_match.group(1)
                for line in reading_text.strip().split('\n'):
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    line = re.sub(r'^[-*]\s*', '', line)
                    reading = parse_reading(line)
                    if reading:
                        day_data["reading"].append(reading)

            # Parse exploring section
            exploring_match = re.search(r'##\s*exploring\s*\n(.*?)(?=\n##|$)', section, re.DOTALL | re.IGNORECASE)
            if exploring_match:
                day_data["exploring"] = parse_exploring(exploring_match.group(1))

            # Parse notes section
            notes_match = re.search(r'##\s*notes\s*\n(.*?)(?=\n##|$)', section, re.DOTALL | re.IGNORECASE)
            if notes_match:
                notes_text = notes_match.group(1).strip()
                # Remove trailing separators
                notes_text = re.sub(r'\n*---\s*$', '', notes_text).strip()
                day_data["notes"] = notes_text if notes_text else None

            result["days"][date_str] = day_data

        # Check for week-review section
        if "week-review" in section.lower():
            review_text = section

            # Extract summary
            summary_match = re.search(r'Goals?\s+hit[:\s]+(.+?)(?:\n|$)', review_text, re.IGNORECASE)
            if summary_match:
                result["week_review"]["summary"] = summary_match.group(1).strip()

            # Extract highlight
            highlight_match = re.search(r'Highlight[:\s]+(.+?)(?:\n|$)', review_text, re.IGNORECASE)
            if highlight_match:
                result["week_review"]["highlight"] = highlight_match.group(1).strip()

            # Extract next week
            next_match = re.search(r'Next\s+week[:\s]+(.+?)(?:\n|$)', review_text, re.IGNORECASE)
            if next_match:
                result["week_review"]["next_week"] = next_match.group(1).strip()

            # Goals completed - try to infer from summary and goals
            goals_completed = []
            summary = result["week_review"].get("summary", "")

            # Look for "X/Y" pattern to determine how many were completed
            ratio_match = re.search(r'(\d+)/(\d+)', summary)
            if ratio_match and result["weekly_goals"]:
                completed_count = int(ratio_match.group(1))
                # Try to identify which goals were NOT completed based on text
                # Look for patterns like "didn't finish DDIA ch4" or "didn't complete X"
                uncompleted_terms = []
                didnt_match = re.search(r"didn'?t\s+(?:finish|complete|do)\s+(.+?)(?:,|\s*-|$)", summary, re.IGNORECASE)
                if didnt_match:
                    uncompleted_text = didnt_match.group(1).lower().strip()
                    # Extract key terms (DDIA, ch4, chapter 4, etc.)
                    uncompleted_terms = re.findall(r'\b\w+\b', uncompleted_text)

                # Mark goals as completed unless they match uncompleted terms
                for goal in result["weekly_goals"]:
                    goal_lower = goal.lower()
                    # Check if goal contains any of the uncompleted terms
                    is_uncompleted = False
                    for term in uncompleted_terms:
                        if len(term) >= 3 and term in goal_lower:  # Only match terms 3+ chars
                            is_uncompleted = True
                            break
                    if not is_uncompleted:
                        goals_completed.append(goal)

                # Limit to the completed count
                goals_completed = goals_completed[:completed_count]

            result["week_review"]["goals_completed"] = goals_completed

    return result


if __name__ == "__main__":
    import json
    from pathlib import Path

    # Test with sample file
    sample_path = Path(__file__).parent.parent / "weeks" / "2025-W02.md"
    if sample_path.exists():
        markdown = sample_path.read_text()
        result = parse_journal_fallback(markdown, "2025-W02.md")
        print(json.dumps(result, indent=2))
