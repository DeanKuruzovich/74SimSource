"""
inject_links.py
Inject hyperlinks into docs.html for the first occurrence of each
term per article section, based on linkable-terms.json.

Common-terms headings (from the in-docs Common Terms article) are
extracted automatically and take priority over Wikipedia links.
Clicking a common-terms link opens docs.html at that specific heading
in a new tab (e.g. href="#ct-schmitt" target="_blank").

Skipped regions — links are never injected inside:
  - existing <a>…</a>
  - <script>…</script>  (JavaScript — never touch)
  - <style>…</style>   (CSS — never touch)
  - <pre>…</pre>  (code blocks)
  - <code>…</code>  (inline code)
  - <kbd>…</kbd>  (keyboard shortcuts)
  - <h1/2/3/4/5/6>…</h[1-6]>  (headings, all levels)
  - <table>…</table>  (tables already have structured content)
  - HTML tag attributes (anything inside < >)
"""

import json
import re
import shutil
import os

# ── 0. Section processing flags ────────────────────────────────────────────
# Set True to inject links into that section, False to skip it entirely.

PROCESS_GETTING_STARTED = False   # articles: overview, breadboard, chips
PROCESS_CONCEPTS        = False   # articles: families, floating, spice-simulator
PROCESS_RESOURCES       = False    # articles: examples, keybinds, common-terms, unverified-chips
PROCESS_CHIP_REFERENCE  = True    # articles: chip-* (injected by JS; no-op if absent from HTML)

# ── Article-to-section mapping ─────────────────────────────────────────────

_SECTION_MAP = {
    "overview":          "getting_started",
    "breadboard":        "getting_started",
    "chips":             "getting_started",
    "families":          "concepts",
    "floating":          "concepts",
    "spice-simulator":   "concepts",
    "examples":          "resources",
    "keybinds":          "resources",
    "common-terms":      "resources",
    "unverified-chips":  "resources",
}

_SECTION_FLAGS = {
    "getting_started": PROCESS_GETTING_STARTED,
    "concepts":        PROCESS_CONCEPTS,
    "resources":       PROCESS_RESOURCES,
}


def article_is_enabled(article_html):
    """Return True if the section flag for this article is enabled."""
    m = re.match(r'<article[^>]+id="article-([^"]+)"', article_html, re.IGNORECASE)
    if not m:
        return True
    slug = m.group(1)
    if slug.startswith("chip-"):
        return PROCESS_CHIP_REFERENCE
    section = _SECTION_MAP.get(slug)
    if section is None:
        return True  # unknown article: process by default
    return _SECTION_FLAGS.get(section, True)


REPO       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TERMS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "linkable-terms.json")
HTML_FILE  = os.path.join(REPO, "docs.html")

# ── 1. Load HTML (needed for common-terms extraction) ─────────────────────

with open(HTML_FILE, encoding="utf-8") as f:
    html = f.read()

# ── 2. Extract common-terms headings ──────────────────────────────────────

def _strip_tags(text):
    return re.sub(r'<[^>]+>', '', text)


def _split_paren(text):
    """'D Latch (Transparent Latch)' → ('D Latch', 'Transparent Latch')."""
    m = re.match(r'^([^(]+?)(?:\s*\(([^)]+)\))?\s*$', text)
    primary = m.group(1).strip() if m else text.strip()
    alt     = m.group(2).strip() if m and m.group(2) else None
    return primary, alt


def extract_ct_entries(html_src):
    """Parse <h2 id="ct-..."> headings in article-common-terms → [(term, url)]."""
    art_m = re.search(
        r'<article[^>]*id="article-common-terms"[^>]*>(.*?)</article>',
        html_src, re.DOTALL | re.IGNORECASE
    )
    if not art_m:
        return []
    body = art_m.group(1)
    entries = []
    for h2m in re.finditer(r'<h2\s+id="(ct-[^"]+)"[^>]*>(.*?)</h2>',
                            body, re.DOTALL | re.IGNORECASE):
        anchor_id   = h2m.group(1)
        heading_raw = _strip_tags(h2m.group(2)).strip()
        url         = f"#{anchor_id}"
        primary, alt = _split_paren(heading_raw)
        if primary:
            entries.append((primary, url))
        if alt and not re.match(r'^[A-Z0-9]{2,4}$', alt):
            entries.append((alt, url))
    return entries


ct_raw = extract_ct_entries(html)
print(f"Found {len(ct_raw)} common-terms match entries from docs.html.")

# ── 3. Load linkable-terms.json ────────────────────────────────────────────

with open(TERMS_FILE, encoding="utf-8") as f:
    data = json.load(f)


def extract_match_entries(term_entry):
    text = term_entry["term"]
    url  = term_entry["url"]
    primary, alt = _split_paren(text)
    entries = [(primary, url)]
    if alt and not re.match(r'^[A-Z0-9]{2,4}$', alt):
        entries.append((alt, url))
    return entries


wiki_raw = []
for cat in data["categories"]:
    for t in cat["terms"]:
        wiki_raw.extend(extract_match_entries(t))

# ── 4. Build TERMS: CT entries first (priority), then Wikipedia ────────────
# Sort each group longest-first so "AND gate" beats "AND" etc.
# Deduplicate by lower-case key; first occurrence wins, so CT beats Wikipedia.

ct_raw.sort(key=lambda e: len(e[0]), reverse=True)
wiki_raw.sort(key=lambda e: len(e[0]), reverse=True)

seen_keys = set()
TERMS = []
for term, url in ct_raw + wiki_raw:
    key = term.lower()
    if key not in seen_keys:
        seen_keys.add(key)
        TERMS.append((term, url))

# ── 5. Build protected-region regex ───────────────────────────────────────
# Covers every region where injecting a link would be wrong or dangerous.

PROTECTED_RE = re.compile(
    r"(<a\b[^>]*>.*?</a>"              # existing hyperlinks
    r"|<script\b[^>]*>.*?</script>"    # JavaScript — never modify
    r"|<style\b[^>]*>.*?</style>"      # CSS — never modify
    r"|<pre\b[^>]*>.*?</pre>"          # code blocks
    r"|<code\b[^>]*>.*?</code>"        # inline code
    r"|<kbd\b[^>]*>.*?</kbd>"          # keyboard shortcuts
    r"|<h[1-6]\b[^>]*>.*?</h[1-6]>"   # headings (all levels)
    r"|<table\b[^>]*>.*?</table>"      # tables
    r"|<[^>]+>)",                       # all other HTML tags (covers attributes)
    re.DOTALL | re.IGNORECASE
)

# ── 6. Per-article linking ─────────────────────────────────────────────────

_INJECTED_A_RE = re.compile(r"(<a\b[^>]*>.*?</a>)", re.DOTALL)


def apply_links(text_segment, linked_set):
    """
    Replace the first occurrence of each not-yet-linked term in a plain-text
    segment with an <a> tag.  Modifies `linked_set` in place.
    After each injection the new <a>…</a> is treated as a protected region so
    subsequent patterns cannot nest inside it.
    """
    chunks = [(text_segment, False)]

    for term, url in TERMS:
        key = term.lower()
        if key in linked_set:
            continue
        pattern = re.compile(r"\b" + re.escape(term) + r"\b", re.IGNORECASE)

        new_chunks = []
        found_this_term = False

        for chunk_text, is_protected in chunks:
            if is_protected or found_this_term:
                new_chunks.append((chunk_text, is_protected))
                continue

            new_text, n = pattern.subn(
                lambda m, _url=url: (
                    f'<a href="{_url}" target="_blank" rel="noopener">{m.group(0)}</a>'
                ),
                chunk_text,
                count=1,
            )
            if n:
                found_this_term = True
                sub_parts = _INJECTED_A_RE.split(new_text)
                for part in sub_parts:
                    if _INJECTED_A_RE.fullmatch(part):
                        new_chunks.append((part, True))
                    else:
                        new_chunks.append((part, False))
            else:
                new_chunks.append((chunk_text, False))

        if found_this_term:
            linked_set.add(key)
            chunks = new_chunks

    return "".join(text for text, _ in chunks)


def process_article(article_html):
    """Link terms inside one <article>…</article> block."""
    linked = set()
    result = []
    last_end = 0

    for m in PROTECTED_RE.finditer(article_html):
        gap = article_html[last_end : m.start()]
        if gap:
            gap = apply_links(gap, linked)
        result.append(gap)
        result.append(m.group(0))
        last_end = m.end()

    tail = article_html[last_end:]
    if tail:
        tail = apply_links(tail, linked)
    result.append(tail)

    return "".join(result)


# ── 7. Process docs.html ───────────────────────────────────────────────────

backup = HTML_FILE + ".bak"
shutil.copy2(HTML_FILE, backup)
print(f"Backed up original → {backup}")

ARTICLE_SPLIT_RE = re.compile(r"(?=<article\b)", re.IGNORECASE)
parts = ARTICLE_SPLIT_RE.split(html)

processed = []
skipped = 0
for part in parts:
    if part.lower().startswith("<article"):
        if not article_is_enabled(part):
            processed.append(part)
            skipped += 1
            continue
        end_m = re.search(r"</article\s*>", part, re.IGNORECASE)
        if end_m:
            article_body = part[: end_m.end()]
            rest         = part[end_m.end() :]
            processed.append(process_article(article_body))
            processed.append(rest)
        else:
            processed.append(process_article(part))
    else:
        processed.append(part)

new_html = "".join(processed)

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(new_html)

print(f"Done. Wrote updated {HTML_FILE}")
if skipped:
    print(f"Skipped {skipped} article(s) (section flag is False).")

# ── 8. Quick sanity check ──────────────────────────────────────────────────

links_added = new_html.count('target="_blank" rel="noopener"')
links_orig  = html.count('target="_blank" rel="noopener"')
ct_links_after  = sum(1 for _ in re.finditer(r'href="#ct-', new_html))
ct_links_before = sum(1 for _ in re.finditer(r'href="#ct-', html))
print(f"Links before: {links_orig}   Links after: {links_added}   Added: {links_added - links_orig}")
print(f"  of which common-terms links: {ct_links_after - ct_links_before} new  ({ct_links_after} total)")
