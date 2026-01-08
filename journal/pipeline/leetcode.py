"""
LeetCode URL metadata extractor.
Extracts problem name, difficulty, and tags from LeetCode URLs.
"""

import json
import re
import urllib.request
import urllib.error
from typing import Optional
from functools import lru_cache


# LeetCode GraphQL endpoint
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

# GraphQL query for problem metadata
PROBLEM_QUERY = """
query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        topicTags {
            name
            slug
        }
        isPaidOnly
    }
}
"""


def extract_leetcode_urls(text: str) -> list[str]:
    """Extract all LeetCode problem URLs from text."""
    pattern = r'https?://(?:www\.)?leetcode\.com/problems/([a-z0-9-]+)/?'
    matches = re.findall(pattern, text, re.IGNORECASE)
    return list(set(matches))  # Deduplicate


def extract_slug_from_url(url: str) -> Optional[str]:
    """Extract the problem slug from a LeetCode URL."""
    match = re.search(r'leetcode\.com/problems/([a-z0-9-]+)', url, re.IGNORECASE)
    return match.group(1) if match else None


@lru_cache(maxsize=500)
def fetch_leetcode_metadata(slug: str) -> Optional[dict]:
    """
    Fetch problem metadata from LeetCode's GraphQL API.
    Results are cached to avoid repeated API calls.
    """
    payload = json.dumps({
        "query": PROBLEM_QUERY,
        "variables": {"titleSlug": slug}
    }).encode('utf-8')

    headers = {
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/problems/{slug}/",
        "User-Agent": "Mozilla/5.0 (compatible; JournalSync/1.0)"
    }

    try:
        req = urllib.request.Request(
            LEETCODE_GRAPHQL_URL,
            data=payload,
            headers=headers,
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            question = result.get("data", {}).get("question")

            if question:
                return {
                    "id": question.get("questionId"),
                    "name": question.get("title"),
                    "slug": question.get("titleSlug"),
                    "difficulty": question.get("difficulty", "").lower(),
                    "tags": [tag["name"] for tag in question.get("topicTags", [])],
                    "url": f"https://leetcode.com/problems/{slug}/",
                    "is_premium": question.get("isPaidOnly", False)
                }
    except urllib.error.HTTPError as e:
        print(f"  LeetCode API error for {slug}: {e.code}")
    except urllib.error.URLError as e:
        print(f"  Network error fetching {slug}: {e}")
    except Exception as e:
        print(f"  Error fetching {slug}: {e}")

    return None


def parse_leetcode_from_text(text: str) -> list[dict]:
    """
    Parse LeetCode problems from text containing URLs.
    Returns list of problem metadata dicts.
    """
    slugs = extract_leetcode_urls(text)
    problems = []

    for slug in slugs:
        metadata = fetch_leetcode_metadata(slug)
        if metadata:
            problems.append(metadata)
        else:
            # Fallback: create entry from slug if API fails
            name = slug.replace('-', ' ').title()
            problems.append({
                "name": name,
                "slug": slug,
                "difficulty": "unknown",
                "tags": [],
                "url": f"https://leetcode.com/problems/{slug}/",
                "is_premium": False
            })

    return problems


def format_problem_for_display(problem: dict) -> str:
    """Format a problem dict for display."""
    difficulty = problem.get("difficulty", "unknown")
    name = problem.get("name", problem.get("slug", "Unknown"))
    tags = problem.get("tags", [])

    tag_str = f" [{', '.join(tags[:3])}]" if tags else ""
    return f"{name} ({difficulty}){tag_str}"


# Cache for offline mode / rate limiting
_cache_file = None

def set_cache_file(path: str):
    """Set the cache file path for persistent caching."""
    global _cache_file
    _cache_file = path


def load_cache() -> dict:
    """Load cached metadata from file."""
    if _cache_file:
        try:
            with open(_cache_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
    return {}


def save_cache(cache: dict):
    """Save cached metadata to file."""
    if _cache_file:
        with open(_cache_file, 'w') as f:
            json.dump(cache, f, indent=2)


if __name__ == "__main__":
    # Test the extractor
    test_text = """
    ## Practice
    https://leetcode.com/problems/two-sum/
    https://leetcode.com/problems/valid-parentheses/
    https://leetcode.com/problems/merge-intervals/
    """

    print("Extracting LeetCode problems from text...")
    print("-" * 50)

    problems = parse_leetcode_from_text(test_text)

    for p in problems:
        print(f"  {format_problem_for_display(p)}")
        print(f"    URL: {p['url']}")
        print(f"    Tags: {p.get('tags', [])}")
        print()
