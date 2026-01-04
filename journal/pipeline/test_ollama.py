"""Quick test to see how long Ollama takes with a small prompt."""
import urllib.request
import json
import time

prompt = """Extract JSON from this journal entry. Return ONLY valid JSON, no explanation.

# Monday, Jan 6
## practice
- leetcode: Two Sum, easy - hashmap approach
## notes
Good day.

Return JSON like: {"2025-01-06": {"practice": {"leetcode": [{"name": "...", "difficulty": "...", "insight": "..."}]}, "notes": "..."}}"""

url = "http://localhost:11434/api/generate"
payload = json.dumps({"model": "mistral", "prompt": prompt, "stream": False}).encode("utf-8")
req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})

print("Sending request to Ollama...")
start = time.time()

with urllib.request.urlopen(req, timeout=120) as resp:
    result = json.loads(resp.read().decode("utf-8"))

elapsed = time.time() - start
print(f"\nCompleted in {elapsed:.1f} seconds")
print(f"\nResponse:\n{result['response']}")
