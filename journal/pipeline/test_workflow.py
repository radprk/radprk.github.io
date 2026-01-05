#!/usr/bin/env python3
"""
Test the full journal sync workflow end-to-end.
"""

import sys
import json
from pathlib import Path

def test_workflow():
    print("=" * 50)
    print("Journal Sync Workflow Test")
    print("=" * 50)

    results = []

    # 1. Test Google Drive connection
    print("\n[1/5] Testing Google Drive connection...")
    try:
        from google_drive import list_journal_documents, GOOGLE_API_AVAILABLE
        if not GOOGLE_API_AVAILABLE:
            print("  ❌ Google API not installed")
            results.append(("Google Drive", False))
        else:
            docs = list_journal_documents(limit=3)
            if docs:
                print(f"  ✅ Found {len(docs)} journal docs:")
                for doc in docs[:3]:
                    print(f"     - {doc['name']}")
                results.append(("Google Drive", True))
            else:
                print("  ⚠️  Connected but no journal docs found")
                results.append(("Google Drive", True))
    except Exception as e:
        print(f"  ❌ Error: {e}")
        results.append(("Google Drive", False))

    # 2. Test Ollama connection
    print("\n[2/5] Testing Ollama connection...")
    try:
        import urllib.request
        import json as json_lib

        req = urllib.request.Request(
            "http://localhost:11434/api/generate",
            data=json_lib.dumps({
                "model": "mistral",
                "prompt": "Say 'OK' only",
                "stream": False,
                "options": {"num_predict": 10}
            }).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json_lib.loads(resp.read())
            print(f"  ✅ Ollama responded: {result.get('response', '')[:50]}")
            results.append(("Ollama", True))
    except Exception as e:
        print(f"  ❌ Ollama not available: {e}")
        print("     Run 'ollama serve' to start")
        results.append(("Ollama", False))

    # 3. Test parser
    print("\n[3/5] Testing parser...")
    try:
        from fallback_parser import parse_journal_fallback
        test_md = """## Monday
### Practice
- Leetcode: Test Problem (easy) - test insight
### Reading
- DDIA chapter 1, pages 1-10 - test
"""
        result = parse_journal_fallback(test_md, "2026-W01.md")
        if result.get("entries"):
            print(f"  ✅ Parser works: found {len(result['entries'])} entries")
            results.append(("Parser", True))
        else:
            print("  ⚠️  Parser returned no entries")
            results.append(("Parser", False))
    except Exception as e:
        print(f"  ❌ Parser error: {e}")
        results.append(("Parser", False))

    # 4. Test stats computation
    print("\n[4/5] Testing stats computation...")
    try:
        from stats import compute_all_stats, load_books_config

        base = Path(__file__).parent.parent
        books = load_books_config(base / "config" / "books.json")
        entries = json.loads((base / "data" / "entries.json").read_text())
        weeks = json.loads((base / "data" / "weeks.json").read_text())

        stats = compute_all_stats(entries, weeks, books)
        print(f"  ✅ Stats computed:")
        print(f"     - Leetcode: {stats.get('practice', {}).get('leetcode', {}).get('total', 0)} problems")
        print(f"     - Books: {len(stats.get('reading', {}))} tracked")
        results.append(("Stats", True))
    except Exception as e:
        print(f"  ❌ Stats error: {e}")
        results.append(("Stats", False))

    # 5. Test git
    print("\n[5/5] Testing git...")
    try:
        import subprocess
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        if result.returncode == 0:
            changes = len([l for l in result.stdout.strip().split('\n') if l])
            print(f"  ✅ Git works: {changes} uncommitted changes")
            results.append(("Git", True))
        else:
            print(f"  ❌ Git error: {result.stderr}")
            results.append(("Git", False))
    except Exception as e:
        print(f"  ❌ Git error: {e}")
        results.append(("Git", False))

    # Summary
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    passed = sum(1 for _, ok in results if ok)
    total = len(results)

    for name, ok in results:
        status = "✅" if ok else "❌"
        print(f"  {status} {name}")

    print(f"\n{passed}/{total} checks passed")

    if passed == total:
        print("\n🎉 All systems go! Run 'python pipeline/sync.py' to sync.")
    else:
        print("\n⚠️  Some checks failed. Fix issues above before syncing.")

    return passed == total


if __name__ == "__main__":
    success = test_workflow()
    sys.exit(0 if success else 1)
