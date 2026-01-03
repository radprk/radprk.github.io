#!/usr/bin/env python3
"""
Test script for the journal pipeline.
Tests parsing, stats computation, and data merging.
"""

import json
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from journal.pipeline.fallback_parser import parse_journal_fallback
from journal.pipeline.stats import (
    compute_all_stats,
    load_books_config,
    merge_entries,
    update_weeks,
)


def test_fallback_parser():
    """Test the regex-based fallback parser."""
    print("=" * 60)
    print("TEST: Fallback Parser")
    print("=" * 60)

    sample_path = Path(__file__).parent.parent / "weeks" / "2025-W02.md"
    if not sample_path.exists():
        print(f"ERROR: Sample file not found: {sample_path}")
        return False

    markdown = sample_path.read_text()
    result = parse_journal_fallback(markdown, "2025-W02.md")

    # Validate structure
    assert "weekly_goals" in result, "Missing weekly_goals"
    assert "days" in result, "Missing days"
    assert "week_review" in result, "Missing week_review"

    # Check we got goals
    print(f"\nWeekly Goals: {len(result['weekly_goals'])}")
    for goal in result["weekly_goals"]:
        print(f"  - {goal}")

    # Check we got days
    print(f"\nDays parsed: {len(result['days'])}")
    for date, data in sorted(result["days"].items()):
        lc_count = len(data["practice"]["leetcode"])
        sql_count = len(data["practice"]["sql"])
        sd_count = len(data["practice"]["system_design"])
        ml_count = len(data["practice"]["ml"])
        print(f"  {date} ({data['day']}): LC={lc_count}, SQL={sql_count}, SD={sd_count}, ML={ml_count}")

    # Verify specific entries
    monday = result["days"].get("2025-01-06", {})
    assert monday.get("day") == "Monday", f"Expected Monday, got {monday.get('day')}"

    lc_entries = monday.get("practice", {}).get("leetcode", [])
    assert len(lc_entries) >= 1, f"Expected leetcode entries for Monday, got {len(lc_entries)}"
    print(f"\nMonday leetcode: {lc_entries[0]['name']}")

    # Check reading
    reading = monday.get("reading", [])
    assert len(reading) >= 1, "Expected reading entries for Monday"
    print(f"Monday reading: {reading[0]['book']} ch{reading[0]['chapter']}")

    print("\n✓ Fallback parser test PASSED")
    return True


def test_stats_computation():
    """Test stats computation from parsed entries."""
    print("\n" + "=" * 60)
    print("TEST: Stats Computation")
    print("=" * 60)

    # Load books config
    config_path = Path(__file__).parent.parent / "config" / "books.json"
    books = load_books_config(config_path)
    print(f"\nLoaded {len(books)} books from config")

    # Parse sample data
    sample_path = Path(__file__).parent.parent / "weeks" / "2025-W02.md"
    markdown = sample_path.read_text()
    parsed = parse_journal_fallback(markdown, "2025-W02.md")

    # Convert to entries format
    entries = parsed["days"]

    # Create weeks data
    weeks = {
        "2025-W02": {
            "goals": parsed["weekly_goals"],
            "goals_completed": parsed.get("week_review", {}).get("goals_completed", [])
        }
    }

    # Compute stats
    stats = compute_all_stats(entries, weeks, books)

    # Validate practice stats
    print("\nPractice Stats:")
    for category, data in stats["practice"].items():
        print(f"  {category}: total={data['total']}, streak={data['current_streak']}/{data['longest_streak']}")

    assert stats["practice"]["leetcode"]["total"] >= 1, "Should have leetcode problems"

    # Validate reading stats
    print("\nReading Stats:")
    for book, data in stats["reading"].items():
        print(f"  {book}: {data['pages_read']}/{data['total_pages']} pages ({data['percentage']}%)")

    # Validate building stats
    print("\nBuilding Stats:")
    for project, data in stats["building"]["projects"].items():
        print(f"  {project}: {data['days_worked']} days, last: {data['last_active']}")

    # Validate exploring stats
    print("\nExploring Stats:")
    for topic, count in stats["exploring"]["topics"].items():
        print(f"  {topic}: {count}")

    print("\n✓ Stats computation test PASSED")
    return True


def test_data_merging():
    """Test merging new entries with existing data."""
    print("\n" + "=" * 60)
    print("TEST: Data Merging")
    print("=" * 60)

    # Existing entries
    existing = {
        "2025-01-05": {
            "day": "Sunday",
            "practice": {"leetcode": [{"name": "Two Sum", "difficulty": "easy", "insight": "hashmap"}], "sql": [], "system_design": [], "ml": []},
            "building": [],
            "reading": [],
            "exploring": [],
            "notes": "Day before the test week"
        }
    }

    # Parse new data
    sample_path = Path(__file__).parent.parent / "weeks" / "2025-W02.md"
    markdown = sample_path.read_text()
    parsed = parse_journal_fallback(markdown, "2025-W02.md")

    # Merge
    merged = merge_entries(existing, parsed)

    # Verify old entry preserved
    assert "2025-01-05" in merged, "Old entry should be preserved"
    assert "2025-01-06" in merged, "New entry should be added"

    print(f"\nMerged entries: {len(merged)} total")
    for date in sorted(merged.keys()):
        print(f"  {date}: {merged[date]['day']}")

    print("\n✓ Data merging test PASSED")
    return True


def test_weeks_update():
    """Test updating weeks data."""
    print("\n" + "=" * 60)
    print("TEST: Weeks Update")
    print("=" * 60)

    existing_weeks = {
        "2025-W01": {
            "goals": ["Setup project"],
            "goals_completed": ["Setup project"],
            "review": "Good start",
            "highlight": "Got started"
        }
    }

    # Parse new data
    sample_path = Path(__file__).parent.parent / "weeks" / "2025-W02.md"
    markdown = sample_path.read_text()
    parsed = parse_journal_fallback(markdown, "2025-W02.md")

    # Update weeks
    updated = update_weeks(existing_weeks, parsed, "2025-W02")

    assert "2025-W01" in updated, "Old week should be preserved"
    assert "2025-W02" in updated, "New week should be added"

    print(f"\nWeeks: {list(updated.keys())}")
    print(f"W02 goals: {len(updated['2025-W02']['goals'])}")

    print("\n✓ Weeks update test PASSED")
    return True


def test_full_pipeline():
    """Test the full pipeline end-to-end."""
    print("\n" + "=" * 60)
    print("TEST: Full Pipeline")
    print("=" * 60)

    base_path = Path(__file__).parent.parent
    config_path = base_path / "config" / "books.json"
    data_path = base_path / "data"
    weeks_path = base_path / "weeks"

    # Ensure data directory exists
    data_path.mkdir(exist_ok=True)

    # Load config
    books = load_books_config(config_path)

    # Parse all weeks
    all_entries = {}
    all_weeks = {}

    for week_file in sorted(weeks_path.glob("*.md")):
        print(f"\nProcessing: {week_file.name}")
        markdown = week_file.read_text()

        parsed = parse_journal_fallback(markdown, week_file.name)

        # Extract week ID
        week_id = week_file.stem  # e.g., "2025-W02"

        # Merge entries
        all_entries = merge_entries(all_entries, parsed)

        # Update weeks
        all_weeks = update_weeks(all_weeks, parsed, week_id)

    # Compute stats
    stats = compute_all_stats(all_entries, all_weeks, books)

    # Output files
    entries_file = data_path / "entries.json"
    stats_file = data_path / "stats.json"
    weeks_file = data_path / "weeks.json"

    entries_file.write_text(json.dumps(all_entries, indent=2))
    stats_file.write_text(json.dumps(stats, indent=2))
    weeks_file.write_text(json.dumps(all_weeks, indent=2))

    print(f"\nGenerated files:")
    print(f"  - {entries_file} ({len(all_entries)} entries)")
    print(f"  - {stats_file}")
    print(f"  - {weeks_file} ({len(all_weeks)} weeks)")

    # Verify files exist and have content
    assert entries_file.exists() and entries_file.stat().st_size > 0
    assert stats_file.exists() and stats_file.stat().st_size > 0
    assert weeks_file.exists() and weeks_file.stat().st_size > 0

    print("\n✓ Full pipeline test PASSED")
    return True


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("JOURNAL PIPELINE TEST SUITE")
    print("=" * 60)

    tests = [
        ("Fallback Parser", test_fallback_parser),
        ("Stats Computation", test_stats_computation),
        ("Data Merging", test_data_merging),
        ("Weeks Update", test_weeks_update),
        ("Full Pipeline", test_full_pipeline),
    ]

    results = []
    for name, test_fn in tests:
        try:
            passed = test_fn()
            results.append((name, passed))
        except Exception as e:
            print(f"\n✗ {name} FAILED with exception: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, p in results if p)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status}: {name}")

    print(f"\n{passed}/{total} tests passed")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
