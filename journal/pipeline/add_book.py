#!/usr/bin/env python3
"""
Simple CLI to add a new book to track.

Usage:
    python add_book.py "System Design Interview" --author "Alex Xu" --pages 320 --alias sdi
    python add_book.py "Clean Code" --author "Robert Martin" --pages 464 --alias cc
"""

import argparse
import json
import re
from pathlib import Path


def slugify(name: str) -> str:
    """Convert book name to a valid JSON key."""
    # Remove special chars, replace spaces with underscores
    slug = re.sub(r'[^\w\s]', '', name)
    slug = re.sub(r'\s+', '_', slug.strip())
    return slug


def add_book(name: str, author: str, pages: int, alias: str = None):
    """Add a new book to books.json."""
    config_path = Path(__file__).parent.parent / "config" / "books.json"

    # Load existing books
    if config_path.exists():
        books = json.loads(config_path.read_text())
    else:
        books = {}

    # Generate key from alias or name
    key = alias.upper() if alias else slugify(name)

    if key in books:
        print(f"Book '{key}' already exists!")
        return False

    # Add new book
    books[key] = {
        "full_title": name,
        "author": author,
        "total_pages": pages,
        "aliases": [alias.lower()] if alias else [],
        "chapters": {}
    }

    # Save
    config_path.write_text(json.dumps(books, indent=2))

    print(f"✅ Added '{name}' as '{key}'")
    print(f"\nIn your journal, reference it as:")
    print(f"  - {key} chapter 1, pages 1-30 - insight here")
    if alias:
        print(f"  - {alias} chapter 1, pages 1-30 - insight here")

    # Update parser aliases
    update_parser_aliases(books)

    return True


def update_parser_aliases(books: dict):
    """Update the fallback parser with new book aliases."""
    parser_path = Path(__file__).parent / "fallback_parser.py"

    if not parser_path.exists():
        return

    # Build alias mapping
    aliases = {}
    for key, book in books.items():
        aliases[key.lower()] = key
        if "aliases" in book:
            for alias in book["aliases"]:
                aliases[alias.lower()] = key
        # Also add variations of the full title
        title_words = book["full_title"].lower().split()
        if len(title_words) >= 2:
            aliases[" ".join(title_words[:2])] = key

    print(f"\nRecognized book names: {list(aliases.keys())}")


def list_books():
    """List all tracked books."""
    config_path = Path(__file__).parent.parent / "config" / "books.json"

    if not config_path.exists():
        print("No books configured yet.")
        return

    books = json.loads(config_path.read_text())

    print("\n📚 Tracked Books:")
    print("-" * 50)
    for key, book in books.items():
        aliases = book.get("aliases", [])
        alias_str = f" (aliases: {', '.join(aliases)})" if aliases else ""
        print(f"  {key}: {book['full_title']} ({book['total_pages']} pages){alias_str}")


def main():
    parser = argparse.ArgumentParser(description="Add a book to track in your journal")
    parser.add_argument("name", nargs="?", help="Book title")
    parser.add_argument("--author", "-a", help="Author name")
    parser.add_argument("--pages", "-p", type=int, help="Total pages")
    parser.add_argument("--alias", help="Short alias (e.g., 'sdi' for System Design Interview)")
    parser.add_argument("--list", "-l", action="store_true", help="List all tracked books")

    args = parser.parse_args()

    if args.list:
        list_books()
        return

    if not args.name:
        parser.print_help()
        print("\nExamples:")
        print('  python add_book.py "System Design Interview" -a "Alex Xu" -p 320 --alias sdi')
        print('  python add_book.py --list')
        return

    if not args.author or not args.pages:
        print("Error: --author and --pages are required")
        return

    add_book(args.name, args.author, args.pages, args.alias)


if __name__ == "__main__":
    main()
