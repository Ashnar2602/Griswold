"""Check static site integrity using only the Python standard library."""

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = set()
        self.duplicates = []
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            identifier = attrs["id"]
            if identifier in self.ids:
                self.duplicates.append(identifier)
            self.ids.add(identifier)
        for key in ("href", "src"):
            if attrs.get(key):
                self.links.append(attrs[key])


def main():
    errors = []
    pages = {
        path.resolve(): Page(path.read_text(encoding="utf-8"))
        for path in ROOT.rglob("*.html")
        if ".git" not in path.parts
    }

    def check_link(source, link):
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            return
        if parsed.path.startswith("/"):
            errors.append(f"{source.relative_to(ROOT)}: absolute site path {link}")
            return
        target = (source.parent / unquote(parsed.path)).resolve() if parsed.path else source
        if target.is_dir():
            target = target / "index.html"
        if not target.is_file():
            errors.append(f"{source.relative_to(ROOT)}: missing {link}")
        elif parsed.fragment and target in pages:
            if unquote(parsed.fragment) not in pages[target].ids:
                errors.append(f"{source.relative_to(ROOT)}: missing anchor {link}")

    for path, page in pages.items():
        for duplicate in page.duplicates:
            errors.append(f"{path.relative_to(ROOT)}: duplicate id {duplicate}")
        for link in page.links:
            check_link(path, link)

    for path in ROOT.rglob("*.css"):
        pattern = r"url\(\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s)]+))\s*\)"
        for match in re.finditer(pattern, path.read_text(encoding="utf-8")):
            check_link(path, next(value for value in match.groups() if value is not None))

    json_count = 0
    for path in ROOT.rglob("*.json"):
        if ".git" in path.parts:
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
            json_count += 1
        except (ValueError, UnicodeError) as error:
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {error}")

    if errors:
        print("\n".join(errors))
        return 1
    print(f"OK: {len(pages)} HTML pages, {json_count} JSON files, local resources and anchors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
