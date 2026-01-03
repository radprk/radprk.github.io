"""
Journal Parser using local Ollama (Mistral) for flexible extraction.
Converts natural journal entries into structured JSON.
"""

import json
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional


# Schema that Ollama should return
OUTPUT_SCHEMA = {
    "weekly_goals": ["string"],
    "days": {
        "YYYY-MM-DD": {
            "day": "string (Monday, Tuesday, etc)",
            "practice": {
                "leetcode": [{"name": "string", "difficulty": "easy|medium|hard", "insight": "string"}],
                "sql": [{"name": "string", "insight": "string"}],
                "system_design": [{"name": "string", "type": "HLD|LLD", "insight": "string"}],
                "ml": [{"name": "string", "insight": "string"}]
            },
            "building": [{"project": "string", "work": "string"}],
            "reading": [{"book": "string", "chapter": "number|null", "pages": "[start, end]|null", "insight": "string"}],
            "exploring": [{"topic": "string", "content": "string"}],
            "notes": "string|null"
        }
    },
    "week_review": {
        "summary": "string",
        "goals_completed": ["string"],
        "highlight": "string|null",
        "next_week": "string|null"
    }
}


def get_extraction_prompt(journal_text: str, week_start_date: str) -> str:
    """Generate the prompt for Ollama to extract structured data."""
    return f'''You are a precise JSON extractor. Extract structured data from this journal and return ONLY valid JSON, no other text.

CRITICAL RULES:
1. Return ONLY the JSON object, no explanations or markdown code blocks
2. Use the exact date format YYYY-MM-DD for day keys
3. The week starts on {week_start_date} (Monday)
4. For practice items, categorize into: leetcode, sql, system_design, ml
5. Extract difficulty (easy/medium/hard) from leetcode entries if mentioned
6. For system design, identify if it's HLD or LLD
7. For reading, extract book abbreviation, chapter number, and page range if present
8. For exploring, identify the general topic (astronomy, philosophy, music, history, technology, etc.)
9. If a section is empty or missing for a day, use empty arrays []
10. Preserve the original insight/notes text as written

BOOK ABBREVIATIONS TO RECOGNIZE:
- "DDIA" = Designing Data-Intensive Applications
- "AI Engineering" or "AI Eng" = AI Engineering by Chip Huyen

JOURNAL TEXT:
---
{journal_text}
---

Return JSON matching this structure:
{{
  "weekly_goals": ["goal1", "goal2"],
  "days": {{
    "2025-01-06": {{
      "day": "Monday",
      "practice": {{
        "leetcode": [{{"name": "Problem Name", "difficulty": "medium", "insight": "key learning"}}],
        "sql": [{{"name": "Topic/Problem", "insight": "what clicked"}}],
        "system_design": [{{"name": "System", "type": "HLD", "insight": "key concept"}}],
        "ml": [{{"name": "Topic", "insight": "learning"}}]
      }},
      "building": [{{"project": "Project Name", "work": "what was done"}}],
      "reading": [{{"book": "DDIA", "chapter": 3, "pages": [72, 89], "insight": "key takeaway"}}],
      "exploring": [{{"topic": "astronomy", "content": "what was explored"}}],
      "notes": "personal reflection or null"
    }}
  }},
  "week_review": {{
    "summary": "goals hit summary",
    "goals_completed": ["completed goal 1"],
    "highlight": "week highlight",
    "next_week": "plans for next week"
  }}
}}'''


def call_ollama(prompt: str, model: str = "mistral") -> Optional[str]:
    """Call local Ollama with the given prompt."""
    import os

    # Set UTF-8 encoding for Windows compatibility
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"

    try:
        result = subprocess.run(
            ["ollama", "run", model],
            input=prompt,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',  # Replace undecodable chars instead of failing
            timeout=300,  # 5 minute timeout
            env=env
        )

        if result.returncode != 0:
            print(f"Ollama error: {result.stderr}")
            return None

        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        print("Ollama request timed out")
        return None
    except FileNotFoundError:
        print("Ollama not found. Make sure it's installed and in PATH")
        return None
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return None


def extract_json_from_response(response: str) -> Optional[dict]:
    """Extract JSON from Ollama response, handling markdown code blocks."""
    if not response:
        return None

    # Try to find JSON in code blocks first
    code_block_pattern = r'```(?:json)?\s*\n?(.*?)\n?```'
    matches = re.findall(code_block_pattern, response, re.DOTALL)

    if matches:
        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue

    # Try parsing the whole response as JSON
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object in the response
    json_pattern = r'\{[\s\S]*\}'
    match = re.search(json_pattern, response)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    print("Could not extract valid JSON from response")
    return None


def parse_week_identifier(filename: str) -> tuple[int, int]:
    """Extract year and week number from filename like '2025-W02.md'."""
    match = re.match(r'(\d{4})-W(\d{2})', filename)
    if match:
        return int(match.group(1)), int(match.group(2))
    raise ValueError(f"Invalid week filename format: {filename}")


def get_week_start_date(year: int, week: int) -> str:
    """Get the Monday date for a given ISO week."""
    # ISO week 1 is the week containing Jan 4th
    jan4 = datetime(year, 1, 4)
    # Find Monday of week 1
    week1_monday = jan4 - __import__('datetime').timedelta(days=jan4.weekday())
    # Add weeks
    target_monday = week1_monday + __import__('datetime').timedelta(weeks=week - 1)
    return target_monday.strftime("%Y-%m-%d")


def validate_parsed_data(data: dict) -> dict:
    """Validate and normalize the parsed data structure."""
    validated = {
        "weekly_goals": data.get("weekly_goals", []),
        "days": {},
        "week_review": data.get("week_review", {})
    }

    # Normalize each day's data
    for date_key, day_data in data.get("days", {}).items():
        validated["days"][date_key] = {
            "day": day_data.get("day", ""),
            "practice": {
                "leetcode": day_data.get("practice", {}).get("leetcode", []),
                "sql": day_data.get("practice", {}).get("sql", []),
                "system_design": day_data.get("practice", {}).get("system_design", []),
                "ml": day_data.get("practice", {}).get("ml", [])
            },
            "building": day_data.get("building", []),
            "reading": day_data.get("reading", []),
            "exploring": day_data.get("exploring", []),
            "notes": day_data.get("notes")
        }

    # Normalize week review
    if validated["week_review"]:
        validated["week_review"] = {
            "summary": validated["week_review"].get("summary", ""),
            "goals_completed": validated["week_review"].get("goals_completed", []),
            "highlight": validated["week_review"].get("highlight"),
            "next_week": validated["week_review"].get("next_week")
        }

    return validated


def parse_journal(markdown_text: str, week_filename: str, model: str = "mistral") -> Optional[dict]:
    """
    Parse a journal markdown file using Ollama.

    Args:
        markdown_text: The raw markdown content of the journal
        week_filename: The filename (e.g., "2025-W02.md") to determine dates
        model: The Ollama model to use (default: mistral)

    Returns:
        Parsed and validated journal data as a dictionary, or None on failure
    """
    try:
        year, week = parse_week_identifier(week_filename)
        week_start = get_week_start_date(year, week)
    except ValueError as e:
        print(f"Error parsing week identifier: {e}")
        return None

    prompt = get_extraction_prompt(markdown_text, week_start)

    print(f"Calling Ollama ({model}) to parse journal...")
    response = call_ollama(prompt, model)

    if not response:
        return None

    print("Extracting JSON from response...")
    parsed = extract_json_from_response(response)

    if not parsed:
        return None

    print("Validating parsed data...")
    validated = validate_parsed_data(parsed)

    return validated


def parse_journal_file(filepath: Path, model: str = "mistral") -> Optional[dict]:
    """
    Parse a journal file from disk.

    Args:
        filepath: Path to the markdown file
        model: The Ollama model to use

    Returns:
        Parsed journal data or None on failure
    """
    if not filepath.exists():
        print(f"File not found: {filepath}")
        return None

    markdown_text = filepath.read_text(encoding="utf-8")
    return parse_journal(markdown_text, filepath.name, model)


if __name__ == "__main__":
    # Test with sample file
    import sys

    if len(sys.argv) > 1:
        filepath = Path(sys.argv[1])
    else:
        # Default to sample file
        filepath = Path(__file__).parent.parent / "weeks" / "2025-W02.md"

    print(f"Parsing: {filepath}")
    result = parse_journal_file(filepath)

    if result:
        print("\n" + "="*50)
        print("PARSED RESULT:")
        print("="*50)
        print(json.dumps(result, indent=2))
    else:
        print("Failed to parse journal")
        sys.exit(1)
