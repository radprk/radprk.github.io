"""
GitHub sync module for committing and pushing journal data changes.
Uses local git commands - no API token required if git is configured.
"""

import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional


def run_git_command(args: list[str], cwd: Path) -> tuple[bool, str]:
    """Run a git command and return success status and output."""
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=60
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output.strip()
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except FileNotFoundError:
        return False, "Git not found. Make sure git is installed and in PATH"


def get_repo_root() -> Path:
    """Get the repository root directory."""
    # Assuming this script is in journal/pipeline/
    return Path(__file__).parent.parent.parent


def has_changes(repo_path: Path, paths: list[str]) -> bool:
    """Check if there are any changes in the specified paths."""
    success, output = run_git_command(["status", "--porcelain"] + paths, repo_path)
    return bool(output.strip())


def stage_files(repo_path: Path, paths: list[str]) -> tuple[bool, str]:
    """Stage files for commit."""
    return run_git_command(["add"] + paths, repo_path)


def commit_changes(repo_path: Path, message: str) -> tuple[bool, str]:
    """Create a commit with the given message."""
    return run_git_command(["commit", "-m", message], repo_path)


def push_changes(repo_path: Path, branch: str = "main", retries: int = 3) -> tuple[bool, str]:
    """Push changes to remote with retry logic."""
    import time

    for attempt in range(retries):
        success, output = run_git_command(["push", "origin", branch], repo_path)
        if success:
            return True, output

        if attempt < retries - 1:
            wait_time = 2 ** (attempt + 1)  # Exponential backoff: 2, 4, 8 seconds
            print(f"Push failed, retrying in {wait_time}s... (attempt {attempt + 1}/{retries})")
            time.sleep(wait_time)

    return False, output


def get_current_branch(repo_path: Path) -> Optional[str]:
    """Get the current branch name."""
    success, output = run_git_command(["branch", "--show-current"], repo_path)
    return output if success else None


def sync_journal_data(
    week_id: Optional[str] = None,
    dry_run: bool = False,
    push: bool = True
) -> tuple[bool, str]:
    """
    Commit and push journal data changes.

    Args:
        week_id: Week identifier for commit message (optional)
        dry_run: If True, only show what would be done without committing
        push: If True, push after committing

    Returns:
        Tuple of (success, message)
    """
    repo_path = get_repo_root()

    # Files to track
    data_files = [
        "journal/data/entries.json",
        "journal/data/stats.json",
        "journal/data/weeks.json",
    ]

    # Check for week markdown files too
    weeks_dir = repo_path / "journal" / "weeks"
    if weeks_dir.exists():
        data_files.append("journal/weeks/")

    # Check if there are any changes
    if not has_changes(repo_path, data_files):
        return True, "No changes to commit"

    # Get current branch
    branch = get_current_branch(repo_path)
    if not branch:
        return False, "Could not determine current branch"

    # Generate commit message
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    if week_id:
        message = f"Update journal data for {week_id}\n\nSynced at {timestamp}"
    else:
        message = f"Update journal data\n\nSynced at {timestamp}"

    if dry_run:
        return True, f"Would commit to {branch}:\n{message}\n\nFiles: {data_files}"

    # Stage files
    success, output = stage_files(repo_path, data_files)
    if not success:
        return False, f"Failed to stage files: {output}"

    # Commit
    success, output = commit_changes(repo_path, message)
    if not success:
        return False, f"Failed to commit: {output}"

    commit_msg = f"Committed: {message.split(chr(10))[0]}"

    # Push if requested
    if push:
        success, push_output = push_changes(repo_path, branch)
        if not success:
            return False, f"Committed but failed to push: {push_output}"
        return True, f"{commit_msg}\nPushed to {branch}"

    return True, commit_msg


def pull_latest(repo_path: Optional[Path] = None, branch: str = "main") -> tuple[bool, str]:
    """Pull latest changes from remote."""
    if repo_path is None:
        repo_path = get_repo_root()

    return run_git_command(["pull", "origin", branch], repo_path)


def get_last_commit_info(repo_path: Optional[Path] = None) -> dict:
    """Get info about the last commit."""
    if repo_path is None:
        repo_path = get_repo_root()

    success, output = run_git_command(
        ["log", "-1", "--format=%H|%s|%ai"],
        repo_path
    )

    if success and output:
        parts = output.split("|")
        if len(parts) >= 3:
            return {
                "hash": parts[0],
                "message": parts[1],
                "date": parts[2]
            }

    return {}


if __name__ == "__main__":
    import sys

    print("GitHub Sync for Journal Data")
    print("=" * 40)

    repo = get_repo_root()
    branch = get_current_branch(repo)
    print(f"Repository: {repo}")
    print(f"Branch: {branch}")

    last_commit = get_last_commit_info()
    if last_commit:
        print(f"Last commit: {last_commit['message'][:50]}...")

    # Check for --dry-run flag
    dry_run = "--dry-run" in sys.argv
    no_push = "--no-push" in sys.argv

    if dry_run:
        print("\n[DRY RUN MODE]")

    print("\nChecking for changes...")
    success, message = sync_journal_data(dry_run=dry_run, push=not no_push)

    if success:
        print(f"✓ {message}")
    else:
        print(f"✗ {message}")
        sys.exit(1)
