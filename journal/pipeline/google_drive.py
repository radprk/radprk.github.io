"""
Google Drive integration for fetching weekly journal documents.
Supports both service account and OAuth authentication.
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False


# Scopes needed for read-only access to Drive
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']


def check_dependencies():
    """Check if Google API dependencies are installed."""
    if not GOOGLE_API_AVAILABLE:
        print("Google API dependencies not installed.")
        print("Install with: pip install google-api-python-client google-auth-oauthlib")
        return False
    return True


def get_service_account_credentials(credentials_path: Path):
    """Load service account credentials from JSON file."""
    if not credentials_path.exists():
        raise FileNotFoundError(f"Service account file not found: {credentials_path}")

    return service_account.Credentials.from_service_account_file(
        str(credentials_path),
        scopes=SCOPES
    )


def get_oauth_credentials(credentials_path: Path, token_path: Path):
    """
    Get OAuth credentials, refreshing or re-authenticating as needed.
    First run will open a browser for authentication.
    """
    creds = None

    # Load existing token if available
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    # Refresh or get new credentials
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not credentials_path.exists():
                raise FileNotFoundError(
                    f"OAuth credentials file not found: {credentials_path}\n"
                    "Download from Google Cloud Console > APIs & Services > Credentials"
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), SCOPES)
            creds = flow.run_local_server(port=0)

        # Save token for future use
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return creds


def build_drive_service(credentials):
    """Build the Google Drive API service."""
    return build('drive', 'v3', credentials=credentials)


def get_current_week_identifier() -> str:
    """Get the current ISO week identifier (e.g., '2025-W02')."""
    now = datetime.now()
    return now.strftime("%Y-W%V")


def find_journal_doc(service, week_id: str) -> Optional[dict]:
    """
    Find the journal document for a given week.
    Searches for documents named like "Journal - 2025-W02".
    """
    # Search query for the journal document
    query = f"name contains 'Journal' and name contains '{week_id}' and mimeType = 'application/vnd.google-apps.document'"

    try:
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, modifiedTime)',
            pageSize=10
        ).execute()

        files = results.get('files', [])

        if not files:
            return None

        # Return the first matching file
        return files[0]

    except HttpError as e:
        print(f"Error searching for document: {e}")
        return None


def get_document_content(service, file_id: str) -> Optional[str]:
    """
    Export a Google Doc as plain text.
    """
    try:
        # Export as plain text
        content = service.files().export(
            fileId=file_id,
            mimeType='text/plain'
        ).execute()

        # Decode bytes to string
        if isinstance(content, bytes):
            content = content.decode('utf-8')

        return content

    except HttpError as e:
        print(f"Error exporting document: {e}")
        return None


def fetch_weekly_journal(
    week_id: Optional[str] = None,
    credentials_path: Optional[Path] = None,
    token_path: Optional[Path] = None,
    use_service_account: bool = False
) -> Optional[tuple[str, str, str]]:
    """
    Fetch the journal document for a given week.

    Args:
        week_id: Week identifier (e.g., '2025-W02'). Defaults to current week.
        credentials_path: Path to credentials JSON file
        token_path: Path to save/load OAuth token (for OAuth flow)
        use_service_account: Whether to use service account auth

    Returns:
        Tuple of (content, week_id, modified_time) or None if not found
    """
    if not check_dependencies():
        return None

    # Default paths
    config_dir = Path(__file__).parent.parent / "config"
    if credentials_path is None:
        if use_service_account:
            credentials_path = config_dir / "service_account.json"
        else:
            credentials_path = config_dir / "oauth_credentials.json"

    if token_path is None:
        token_path = config_dir / "token.json"

    # Get week identifier
    if week_id is None:
        week_id = get_current_week_identifier()

    print(f"Fetching journal for week: {week_id}")

    # Authenticate
    try:
        if use_service_account:
            creds = get_service_account_credentials(credentials_path)
        else:
            creds = get_oauth_credentials(credentials_path, token_path)
    except FileNotFoundError as e:
        print(f"Authentication error: {e}")
        return None

    # Build service
    service = build_drive_service(creds)

    # Find the document
    doc = find_journal_doc(service, week_id)
    if not doc:
        print(f"No journal document found for {week_id}")
        print("Expected document name format: 'Journal - 2025-W02'")
        return None

    print(f"Found document: {doc['name']} (modified: {doc['modifiedTime']})")

    # Get content
    content = get_document_content(service, doc['id'])
    if not content:
        print("Failed to fetch document content")
        return None

    return content, week_id, doc['modifiedTime']


def list_journal_documents(
    credentials_path: Optional[Path] = None,
    token_path: Optional[Path] = None,
    use_service_account: bool = False,
    limit: int = 10
) -> list[dict]:
    """
    List all journal documents found in Drive.
    Useful for debugging and seeing what's available.
    """
    if not check_dependencies():
        return []

    config_dir = Path(__file__).parent.parent / "config"
    if credentials_path is None:
        if use_service_account:
            credentials_path = config_dir / "service_account.json"
        else:
            credentials_path = config_dir / "oauth_credentials.json"

    if token_path is None:
        token_path = config_dir / "token.json"

    try:
        if use_service_account:
            creds = get_service_account_credentials(credentials_path)
        else:
            creds = get_oauth_credentials(credentials_path, token_path)
    except FileNotFoundError as e:
        print(f"Authentication error: {e}")
        return []

    service = build_drive_service(creds)

    # Search for all journal documents
    query = "name contains 'Journal' and mimeType = 'application/vnd.google-apps.document'"

    try:
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, modifiedTime)',
            orderBy='modifiedTime desc',
            pageSize=limit
        ).execute()

        return results.get('files', [])

    except HttpError as e:
        print(f"Error listing documents: {e}")
        return []


if __name__ == "__main__":
    import sys

    print("Google Drive Journal Fetcher")
    print("=" * 40)

    # Check for command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "list":
            print("\nListing journal documents...")
            docs = list_journal_documents()
            for doc in docs:
                print(f"  - {doc['name']} (modified: {doc['modifiedTime'][:10]})")
        else:
            # Treat argument as week ID
            week_id = sys.argv[1]
            result = fetch_weekly_journal(week_id=week_id)
            if result:
                content, week, modified = result
                print(f"\nContent ({len(content)} chars):")
                print("-" * 40)
                print(content[:500] + "..." if len(content) > 500 else content)
    else:
        # Fetch current week
        result = fetch_weekly_journal()
        if result:
            content, week, modified = result
            print(f"\nFetched {len(content)} characters for {week}")
