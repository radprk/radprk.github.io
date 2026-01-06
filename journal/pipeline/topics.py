"""
Topic Extraction and Weekly Narrative Generation.
Extracts learning topics from entries and generates weekly summaries.
"""

import json
import re
import urllib.request
import urllib.error
from collections import defaultdict
from pathlib import Path
from typing import Optional


def call_ollama(prompt: str, model: str = "mistral", timeout: int = 120) -> Optional[str]:
    """Call Ollama for text generation."""
    url = "http://localhost:11434/api/generate"

    payload = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 512,
            "temperature": 0.7
        }
    }).encode('utf-8')

    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get("response", "").strip()

    except Exception as e:
        print(f"Ollama error: {e}")
        return None


# Common algorithm/concept patterns for LeetCode problems
ALGORITHM_PATTERNS = {
    "two pointers": ["two pointer", "two-pointer", "sliding window"],
    "binary search": ["binary search", "bisect"],
    "dynamic programming": ["dp", "dynamic programming", "memoization", "tabulation"],
    "graphs": ["graph", "bfs", "dfs", "dijkstra", "topological", "shortest path"],
    "trees": ["tree", "binary tree", "bst", "traversal", "inorder", "preorder"],
    "backtracking": ["backtrack", "recursion", "permutation", "combination", "subset"],
    "linked lists": ["linked list", "linkedlist", "list node"],
    "stacks & queues": ["stack", "queue", "monotonic"],
    "heaps": ["heap", "priority queue", "heapq"],
    "hash maps": ["hash", "hashmap", "dictionary", "counter"],
    "strings": ["string", "substring", "palindrome", "anagram"],
    "arrays": ["array", "subarray", "prefix sum"],
    "greedy": ["greedy"],
    "bit manipulation": ["bit", "xor", "bitwise"],
    "math": ["math", "gcd", "prime", "factorial"],
}


def categorize_problem(problem: dict) -> list[str]:
    """Categorize a LeetCode problem by algorithm/concept."""
    categories = []

    # Check problem name and insight
    text = f"{problem.get('name', '')} {problem.get('insight', '')}".lower()

    for category, patterns in ALGORITHM_PATTERNS.items():
        for pattern in patterns:
            if pattern in text:
                categories.append(category)
                break

    return categories if categories else ["general"]


def extract_topics_from_entries(entries: dict, week_id: str) -> dict:
    """
    Extract and group topics from a week's entries.

    Returns:
        {
            "leetcode": {
                "graphs": [{"name": "...", "insight": "...", "date": "..."}],
                "two pointers": [...],
            },
            "system_design": [
                {"name": "bit.ly", "type": "HLD", "insight": "...", "date": "..."}
            ],
            "reading": {
                "DDIA": [{"chapter": 3, "insight": "...", "date": "..."}]
            },
            "exploring": {
                "astronomy": [{"content": "...", "date": "..."}],
                "philosophy": [...]
            },
            "building": [
                {"project": "Journal pipeline", "work": "...", "date": "..."}
            ]
        }
    """
    # Parse week from week_id
    match = re.match(r'(\d{4})-W(\d{2})', week_id)
    if not match:
        return {}

    year, week_num = int(match.group(1)), int(match.group(2))

    # Filter entries for this week
    from datetime import datetime
    week_entries = {}
    for date, data in entries.items():
        try:
            entry_date = datetime.strptime(date, "%Y-%m-%d")
            entry_year, entry_week = entry_date.isocalendar()[:2]
            if entry_year == year and entry_week == week_num:
                week_entries[date] = data
        except:
            continue

    topics = {
        "leetcode": defaultdict(list),
        "system_design": [],
        "reading": defaultdict(list),
        "exploring": defaultdict(list),
        "building": []
    }

    for date, day_data in sorted(week_entries.items()):
        practice = day_data.get("practice", {})

        # LeetCode problems grouped by algorithm
        for problem in practice.get("leetcode", []):
            categories = categorize_problem(problem)
            for cat in categories:
                topics["leetcode"][cat].append({
                    "name": problem.get("name", "Unknown"),
                    "difficulty": problem.get("difficulty", ""),
                    "insight": problem.get("insight", ""),
                    "date": date
                })

        # System design
        for sd in practice.get("system_design", []):
            topics["system_design"].append({
                "name": sd.get("name", "Unknown"),
                "type": sd.get("type", ""),
                "insight": sd.get("insight", ""),
                "date": date
            })

        # Reading
        for reading in day_data.get("reading", []):
            book = reading.get("book", "Unknown")
            topics["reading"][book].append({
                "chapter": reading.get("chapter"),
                "pages": reading.get("pages", []),
                "insight": reading.get("insight", ""),
                "date": date
            })

        # Exploring
        for exploring in day_data.get("exploring", []):
            topic = exploring.get("topic", "misc")
            topics["exploring"][topic].append({
                "content": exploring.get("content", ""),
                "date": date
            })

        # Building
        for building in day_data.get("building", []):
            topics["building"].append({
                "project": building.get("project", "Unknown"),
                "work": building.get("work", ""),
                "date": date
            })

    # Convert defaultdicts to regular dicts
    return {
        "leetcode": dict(topics["leetcode"]),
        "system_design": topics["system_design"],
        "reading": dict(topics["reading"]),
        "exploring": dict(topics["exploring"]),
        "building": topics["building"]
    }


def generate_topic_highlights(topics: dict) -> list[dict]:
    """
    Generate clickable topic highlights for the week.
    Returns list of topic objects with name, type, and preview.
    """
    highlights = []

    # LeetCode algorithm categories
    for algo, problems in topics.get("leetcode", {}).items():
        if problems:
            insights = [p["insight"] for p in problems if p.get("insight")]
            highlights.append({
                "name": algo,
                "type": "leetcode",
                "count": len(problems),
                "preview": insights[0] if insights else f"{len(problems)} problems",
                "items": problems
            })

    # System design
    for sd in topics.get("system_design", []):
        highlights.append({
            "name": sd["name"],
            "type": "system_design",
            "subtype": sd.get("type", ""),
            "preview": sd.get("insight", ""),
            "items": [sd]
        })

    # Reading insights
    for book, readings in topics.get("reading", {}).items():
        insights = [r["insight"] for r in readings if r.get("insight")]
        if insights:
            highlights.append({
                "name": book,
                "type": "reading",
                "preview": insights[0],
                "items": readings
            })

    # Exploring topics
    for topic, items in topics.get("exploring", {}).items():
        contents = [i["content"] for i in items if i.get("content")]
        if contents:
            highlights.append({
                "name": topic,
                "type": "exploring",
                "preview": contents[0][:100] + "..." if len(contents[0]) > 100 else contents[0],
                "items": items
            })

    # Building projects
    for project in topics.get("building", []):
        highlights.append({
            "name": project["project"],
            "type": "building",
            "preview": project.get("work", ""),
            "items": [project]
        })

    return highlights


def generate_weekly_narrative(topics: dict, week_id: str, use_ollama: bool = True) -> str:
    """
    Generate a natural language narrative for the week.

    Example output:
    "This week I explored consistent hashing while designing a URL shortener,
    worked through graph algorithms in LeetCode, and learned that dragonflies
    are the most efficient predators on Earth."
    """
    highlights = generate_topic_highlights(topics)

    if not highlights:
        return "No activities recorded this week."

    # Build context for LLM
    context_parts = []

    # LeetCode
    lc_topics = [h for h in highlights if h["type"] == "leetcode"]
    if lc_topics:
        lc_names = [h["name"] for h in lc_topics]
        context_parts.append(f"LeetCode: practiced {', '.join(lc_names)}")

    # System design
    sd_topics = [h for h in highlights if h["type"] == "system_design"]
    if sd_topics:
        sd_names = [f"{h['name']} ({h.get('subtype', '')})" for h in sd_topics]
        context_parts.append(f"System Design: designed {', '.join(sd_names)}")

    # Reading
    reading_topics = [h for h in highlights if h["type"] == "reading"]
    if reading_topics:
        book_insights = [f"{h['name']}: {h['preview']}" for h in reading_topics]
        context_parts.append(f"Reading: {'; '.join(book_insights)}")

    # Exploring
    exploring_topics = [h for h in highlights if h["type"] == "exploring"]
    if exploring_topics:
        explore_parts = [f"{h['name']}: {h['preview']}" for h in exploring_topics]
        context_parts.append(f"Exploring: {'; '.join(explore_parts)}")

    # Building
    building_topics = [h for h in highlights if h["type"] == "building"]
    if building_topics:
        project_parts = [f"{h['name']}: {h['preview']}" for h in building_topics]
        context_parts.append(f"Building: {'; '.join(project_parts)}")

    context = "\n".join(context_parts)

    if use_ollama:
        prompt = f"""Write a single engaging sentence (2-3 lines max) summarizing what I learned this week.
Be specific about interesting insights. Write in first person. Don't use bullet points.

Week activities:
{context}

Write the summary (one flowing sentence):"""

        response = call_ollama(prompt)
        if response:
            # Clean up the response
            narrative = response.strip()
            # Remove any leading quotes or formatting
            narrative = re.sub(r'^["\'"]', '', narrative)
            narrative = re.sub(r'["\'"]$', '', narrative)
            return narrative

    # Fallback: generate simple narrative
    parts = []
    if lc_topics:
        parts.append(f"practiced {', '.join([h['name'] for h in lc_topics[:2]])}")
    if sd_topics:
        parts.append(f"designed {sd_topics[0]['name']}")
    if exploring_topics:
        parts.append(f"explored {exploring_topics[0]['name']}")
    if reading_topics:
        parts.append(f"read about {reading_topics[0]['preview'][:50]}")

    if parts:
        return f"This week I {', '.join(parts[:3])}."
    return "Worked on various things this week."


def compute_weekly_summary(entries: dict, week_id: str, use_ollama: bool = True) -> dict:
    """
    Compute full weekly summary with topics and narrative.

    Returns:
        {
            "week_id": "2025-W02",
            "narrative": "This week I...",
            "topics": [...topic highlights...],
            "raw_topics": {...grouped topics...}
        }
    """
    topics = extract_topics_from_entries(entries, week_id)
    highlights = generate_topic_highlights(topics)
    narrative = generate_weekly_narrative(topics, week_id, use_ollama)

    return {
        "week_id": week_id,
        "narrative": narrative,
        "topics": highlights,
        "raw_topics": topics
    }


def load_blog_posts(blog_dir: Path) -> list[dict]:
    """
    Load blog posts from markdown files.

    Expected format in blog/*.md:
    ---
    title: Why I'm betting on local LLMs
    date: 2025-01-05
    tags: [ai, llm, local]
    ---

    Content here...
    """
    posts = []

    if not blog_dir.exists():
        return posts

    for md_file in sorted(blog_dir.glob("*.md"), reverse=True):
        content = md_file.read_text(encoding="utf-8")

        # Parse frontmatter
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if frontmatter_match:
            frontmatter = frontmatter_match.group(1)
            body = content[frontmatter_match.end():]

            # Parse YAML-like frontmatter
            post = {"slug": md_file.stem, "body": body.strip()}

            for line in frontmatter.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()

                    # Handle arrays
                    if value.startswith('[') and value.endswith(']'):
                        value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]

                    post[key] = value

            posts.append(post)
        else:
            # No frontmatter, use filename as title
            posts.append({
                "slug": md_file.stem,
                "title": md_file.stem.replace('-', ' ').replace('_', ' ').title(),
                "body": content.strip()
            })

    return posts


if __name__ == "__main__":
    # Test with sample data
    sample_entries = {
        "2025-01-06": {
            "day": "Monday",
            "practice": {
                "leetcode": [
                    {"name": "Container With Most Water", "difficulty": "medium", "insight": "two pointers shrink from both ends"},
                    {"name": "Number of Islands", "difficulty": "medium", "insight": "DFS flood fill marks visited"}
                ],
                "sql": [],
                "system_design": [{"name": "bit.ly", "type": "HLD", "insight": "consistent hashing for distribution"}],
                "ml": []
            },
            "building": [{"project": "Journal pipeline", "work": "topic extraction"}],
            "reading": [{"book": "DDIA", "chapter": 5, "pages": [151, 180], "insight": "replication lag patterns"}],
            "exploring": [{"topic": "nature", "content": "dragonflies have 95% hunting success rate, the highest of any predator"}],
            "notes": None
        },
        "2025-01-07": {
            "day": "Tuesday",
            "practice": {
                "leetcode": [
                    {"name": "Course Schedule", "difficulty": "medium", "insight": "topological sort with cycle detection"},
                    {"name": "Clone Graph", "difficulty": "medium", "insight": "BFS with hashmap for visited"}
                ],
                "sql": [],
                "system_design": [],
                "ml": []
            },
            "building": [],
            "reading": [],
            "exploring": [{"topic": "philosophy", "content": "stoicism focuses on what you can control"}],
            "notes": None
        }
    }

    print("Testing topic extraction...")
    summary = compute_weekly_summary(sample_entries, "2025-W02", use_ollama=False)
    print(json.dumps(summary, indent=2))
