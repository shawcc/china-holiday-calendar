#!/usr/bin/env python3
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
KNOWN_URLS = {
    json.loads(path.read_text(encoding="utf-8"))["source_url"]
    for path in (ROOT / "data").glob("*.json")
}
QUERY = 'site:gov.cn/zhengce "国务院办公厅关于" "部分节假日安排的通知"'
RSS_URL = "https://www.bing.com/search?format=rss&q=" + urllib.parse.quote(QUERY)
TITLE_PATTERN = re.compile(r"国务院办公厅关于(\d{4})年.*部分节假日安排的通知")


def fetch_results() -> list[dict]:
    request = urllib.request.Request(
        RSS_URL,
        headers={"User-Agent": "ChinaHolidayCalendarMonitor/1.0"}
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        root = ET.fromstring(response.read())
    results = []
    for item in root.findall("./channel/item"):
        title = item.findtext("title", default="")
        url = item.findtext("link", default="")
        match = TITLE_PATTERN.search(title)
        if match and "gov.cn" in url:
            results.append({"year": int(match.group(1)), "title": title, "url": url})
    return results


def main() -> int:
    candidates = [item for item in fetch_results() if item["url"] not in KNOWN_URLS]
    report = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "query": QUERY,
        "candidates": candidates
    }
    report_path = ROOT / "release-check.json"
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    if candidates:
        print("NEW_RELEASE_FOUND")
        for item in candidates:
            print(f"{item['year']}|{item['title']}|{item['url']}")
        return 2
    print("No unverified official release found.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(f"Release check failed: {error}", file=sys.stderr)
        sys.exit(1)
