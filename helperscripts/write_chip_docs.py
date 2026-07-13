#!/usr/bin/env python3
"""
write_chip_docs.py

Reverse of dump_chip_docs.py.  Reads helperscripts/chip_docs.json (the
flat {"chip_id": "text body", ...} file) and writes the contents back
into the matching chip JS files in js/chips/.

For every chip listed in the JSON, the text body is parsed into three
fields and those fields are surgically replaced inside the chip's
`{ ... }` block:

    - guideOverview          (string)
    - guidePinDescriptions   (object {pin: description})
    - guideSections          (array of {title, paragraphs?, list?,
                              formulas?, note?})

All other fields (name, simpleName, description, datasheet, pinout,
gates, tags, ...) and surrounding comments are left untouched.

If a target field is missing from a chip in the JS file, the field is
inserted just before that chip's closing `}` so newly-authored text in
the JSON does not silently get dropped.

Usage:
    python3 helperscripts/write_chip_docs.py
"""

import json
import os
import re
import sys
import glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.dirname(SCRIPT_DIR)
CHIPS_DIR  = os.path.join(REPO_ROOT, 'js', 'chips')
INPUT      = os.path.join(SCRIPT_DIR, 'chip_docs.json')

# Re-use the Node-backed parser and text formatter from the forward script
# so we can compare "what the chip currently looks like as text" against the
# JSON.  Anything that round-trips to the same text is skipped, which keeps
# inline comments and the existing formatting intact for unchanged chips.
sys.path.insert(0, SCRIPT_DIR)
from dump_chip_docs import parse_chips_file, format_chip_text  # noqa: E402


# ─────────────────────────── JS-aware text scanning ──────────────────────────

def skip_ws_and_comments(text: str, i: int, limit: int = None) -> int:
    """Advance past whitespace and JS comments."""
    if limit is None:
        limit = len(text)
    while i < limit:
        c = text[i]
        if c in ' \t\n\r':
            i += 1
        elif c == '/' and i + 1 < limit and text[i + 1] == '/':
            while i < limit and text[i] != '\n':
                i += 1
        elif c == '/' and i + 1 < limit and text[i + 1] == '*':
            i += 2
            while i + 1 < limit and not (text[i] == '*' and text[i + 1] == '/'):
                i += 1
            i += 2
        else:
            return i
    return i


def find_string_end(text: str, i: int) -> int:
    """Given i pointing at an opening quote, return index just AFTER the closing quote."""
    quote = text[i]
    i += 1
    while i < len(text):
        if text[i] == '\\':
            i += 2
        elif text[i] == quote:
            return i + 1
        else:
            i += 1
    return -1


def find_matching(text: str, i: int, open_ch: str, close_ch: str) -> int:
    """Given i pointing at `open_ch`, return index just AFTER the matching `close_ch`."""
    depth = 0
    while i < len(text):
        c = text[i]
        if c == open_ch:
            depth += 1
            i += 1
        elif c == close_ch:
            depth -= 1
            i += 1
            if depth == 0:
                return i
        elif c in ('"', "'", '`'):
            i = find_string_end(text, i)
            if i == -1:
                return -1
        elif c == '/' and i + 1 < len(text) and text[i + 1] == '/':
            while i < len(text) and text[i] != '\n':
                i += 1
        elif c == '/' and i + 1 < len(text) and text[i + 1] == '*':
            i += 2
            while i + 1 < len(text) and not (text[i] == '*' and text[i + 1] == '/'):
                i += 1
            i += 2
        else:
            i += 1
    return -1


def find_chip_block(text: str, chip_id: str):
    """Return (open_brace_idx, close_brace_idx) for the chip body, or None."""
    pattern = r"['\"]" + re.escape(chip_id) + r"['\"]\s*:\s*\{"
    for m in re.finditer(pattern, text):
        open_brace = text.index('{', m.end() - 1)
        end = find_matching(text, open_brace, '{', '}')
        if end == -1:
            continue
        # end is just past `}`, so close_brace_idx = end - 1
        return (open_brace, end - 1)
    return None


def parse_chip_fields(text: str, body_start: int, body_end: int) -> dict:
    """
    Walk the top-level fields of a chip object.
    body_start: index of opening `{`
    body_end:   index of closing `}` (inclusive)
    Returns {field_name: (value_start, value_end_exclusive)}.
    """
    fields: dict = {}
    i = body_start + 1
    limit = body_end

    while i < limit:
        i = skip_ws_and_comments(text, i, limit)
        if i >= limit:
            break
        if text[i] == ',':
            i += 1
            continue

        m = re.match(
            r"(?:['\"]([^'\"]+)['\"]|([A-Za-z_$][A-Za-z0-9_$]*))\s*:",
            text[i:limit],
        )
        if not m:
            i += 1
            continue

        name = m.group(1) or m.group(2)
        value_start = skip_ws_and_comments(text, i + m.end(), limit)
        if value_start >= limit:
            break

        c = text[value_start]
        if c in ('"', "'", '`'):
            value_end = find_string_end(text, value_start)
        elif c == '{':
            value_end = find_matching(text, value_start, '{', '}')
        elif c == '[':
            value_end = find_matching(text, value_start, '[', ']')
        else:
            value_end = value_start
            depth = 0
            while value_end < limit:
                cc = text[value_end]
                if cc in '{[(':
                    depth += 1
                elif cc in '}])':
                    if depth == 0:
                        break
                    depth -= 1
                elif cc == ',' and depth == 0:
                    break
                value_end += 1

        if value_end == -1:
            break
        fields[name] = (value_start, value_end)
        i = value_end

    return fields


# ─────────────────────────── Text → structured data ──────────────────────────

def parse_text(text: str) -> dict:
    """Parse the JSON-string body into {guideOverview, guidePinDescriptions, guideSections}."""
    result = {
        'guideOverview': '',
        'guidePinDescriptions': {},
        'guideSections': [],
    }

    chunks = [c for c in re.split(r'\n[ \t]*\n', text.strip()) if c.strip()]
    if not chunks:
        return result

    idx = 0
    first_lines = chunks[0].split('\n')
    if first_lines[0].strip() != 'Pins:':
        result['guideOverview'] = chunks[0].strip()
        idx = 1

    for chunk in chunks[idx:]:
        lines = chunk.split('\n')
        head = lines[0].strip()

        if head == 'Pins:':
            for line in lines[1:]:
                m = re.match(r'^\s+(\S+?)\s*:\s*(.*)$', line)
                if m:
                    result['guidePinDescriptions'][m.group(1)] = m.group(2).strip()
            continue

        section: dict = {'title': head}
        paragraphs, list_items, formulas = [], [], []
        note = None
        for line in lines[1:]:
            if not line.strip():
                continue
            if (not line.startswith(' ')) and line.startswith('Note:'):
                note = line[len('Note:'):].strip()
            elif line.startswith('  - '):
                list_items.append(line[4:].strip())
            elif line.startswith('  '):
                formulas.append(line[2:].rstrip())
            else:
                paragraphs.append(line.strip())

        if paragraphs:
            section['paragraphs'] = paragraphs
        if list_items:
            section['list'] = list_items
        if formulas:
            section['formulas'] = formulas
        if note:
            section['note'] = note

        result['guideSections'].append(section)

    return result


# ─────────────────────────── Structured data → JS ───────────────────────────

def js_string(s: str) -> str:
    """Single-quoted JS string literal."""
    s = s.replace('\\', '\\\\').replace("'", "\\'")
    s = s.replace('\r', '').replace('\n', '\\n')
    return f"'{s}'"


def format_pin_descriptions(pins: dict) -> str:
    if not pins:
        return '{}'
    out = ['{']
    for pin, desc in pins.items():
        out.append(f"      '{pin}': {js_string(desc)},")
    out.append('    }')
    return '\n'.join(out)


def format_sections(sections: list) -> str:
    if not sections:
        return '[]'
    out = ['[']
    for section in sections:
        out.append('      {')
        if section.get('title'):
            out.append(f"        title: {js_string(section['title'])},")
        if section.get('paragraphs'):
            out.append('        paragraphs: [')
            for p in section['paragraphs']:
                out.append(f"          {js_string(p)},")
            out.append('        ],')
        if section.get('list'):
            out.append('        list: [')
            for item in section['list']:
                out.append(f"          {js_string(item)},")
            out.append('        ],')
        if section.get('formulas'):
            out.append('        formulas: [')
            for f in section['formulas']:
                out.append(f"          {js_string(f)},")
            out.append('        ],')
        if section.get('note'):
            out.append(f"        note: {js_string(section['note'])},")
        out.append('      },')
    out.append('    ]')
    return '\n'.join(out)


# ─────────────────────────── Apply updates to a file ────────────────────────

def format_field_value(field_name: str, value) -> str:
    if field_name == 'guideOverview':
        return js_string(value or '')
    if field_name == 'guidePinDescriptions':
        return format_pin_descriptions(value or {})
    if field_name == 'guideSections':
        return format_sections(value or [])
    raise ValueError(f"Unknown field: {field_name}")


def update_chip_in_text(text: str, chip_id: str, updates: dict):
    """
    Replace exactly the fields named in `updates` (a subset of
    guideOverview / guidePinDescriptions / guideSections) in chip_id's
    block.  Fields not present in `updates` are left completely alone,
    so callers should only pass fields that actually need to change.

    Returns (new_text, ok, msg).
    """
    block = find_chip_block(text, chip_id)
    if block is None:
        return text, False, 'chip block not found'

    open_brace, close_brace = block
    fields = parse_chip_fields(text, open_brace, close_brace)

    target_order = ['guideOverview', 'guidePinDescriptions', 'guideSections']
    replacements = []
    inserts      = []

    for field_name in target_order:
        if field_name not in updates:
            continue
        new_value_text = format_field_value(field_name, updates[field_name])
        if field_name in fields:
            vs, ve = fields[field_name]
            replacements.append((vs, ve, new_value_text))
        else:
            inserts.append((field_name, new_value_text))

    replacements.sort(key=lambda r: r[0], reverse=True)
    for vs, ve, new_val in replacements:
        text = text[:vs] + new_val + text[ve:]

    if inserts:
        block = find_chip_block(text, chip_id)
        if block is None:
            return text, False, 'chip block disappeared after replacements'
        _, close_brace = block
        line_start = text.rfind('\n', 0, close_brace) + 1
        snippet = '\n'.join(
            f"    {name}: {val}," for name, val in inserts
        ) + '\n'
        text = text[:line_start] + snippet + text[line_start:]

    return text, True, ''


# ─────────────────────────── Per-field change detection ─────────────────────

def _norm_pins(p) -> dict:
    return dict(p or {})


def _norm_section(s: dict) -> dict:
    return {
        'title':      (s.get('title') or '').strip(),
        'paragraphs': list(s.get('paragraphs') or []),
        'list':       list(s.get('list') or []),
        'formulas':   list(s.get('formulas') or []),
        'note':       (s.get('note') or '').strip(),
    }


def _norm_sections(secs) -> list:
    return [_norm_section(s) for s in (secs or [])]


def diff_updates(current: dict, new_parsed: dict) -> dict:
    """Return only the fields that actually changed between current chip
    data (from JS) and the parsed text (from JSON)."""
    out: dict = {}
    if (new_parsed.get('guideOverview') or '').strip() != \
       (current.get('guideOverview') or '').strip():
        out['guideOverview'] = new_parsed.get('guideOverview', '')
    if _norm_pins(new_parsed.get('guidePinDescriptions')) != \
       _norm_pins(current.get('guidePinDescriptions')):
        out['guidePinDescriptions'] = new_parsed.get('guidePinDescriptions') or {}
    if _norm_sections(new_parsed.get('guideSections')) != \
       _norm_sections(current.get('guideSections')):
        out['guideSections'] = new_parsed.get('guideSections') or []
    return out


def chip_data_is_clean(chip: dict) -> bool:
    """
    True if the chip's existing JS data is well-formed enough to be
    reformatted safely.  Malformed chips (e.g. a corrupted block where
    pin descriptions contain nested objects instead of strings) are
    skipped so this script never makes things worse.
    """
    pins = chip.get('guidePinDescriptions') or {}
    if not isinstance(pins, dict):
        return False
    for v in pins.values():
        if not isinstance(v, str):
            return False
    secs = chip.get('guideSections') or []
    if not isinstance(secs, list):
        return False
    for s in secs:
        if not isinstance(s, dict):
            return False
        for k in ('title', 'note'):
            if k in s and not isinstance(s[k], str):
                return False
        for k in ('paragraphs', 'list', 'formulas'):
            if k in s:
                if not isinstance(s[k], list):
                    return False
                if any(not isinstance(x, str) for x in s[k]):
                    return False
    ov = chip.get('guideOverview')
    if ov is not None and not isinstance(ov, str):
        return False
    return True


# ─────────────────────────── Main ───────────────────────────────────────────

def chip_file_key(path: str) -> int:
    m = re.search(r'chips(\d+)\.js$', path)
    return int(m.group(1)) if m else 0


def main():
    if not os.path.exists(INPUT):
        print(f"ERROR: {INPUT} not found. Run dump_chip_docs.py first.")
        return

    with open(INPUT, encoding='utf-8') as fh:
        chip_docs = json.load(fh)

    chip_files = sorted(
        glob.glob(os.path.join(CHIPS_DIR, 'chips*.js')),
        key=chip_file_key,
    )

    # Parse every chip file via Node so we know which chip lives where AND
    # what each chip's current data looks like.  We compare field-by-field
    # so unchanged fields keep their original JS formatting and comments.
    chip_to_file:  dict = {}
    current_data:  dict = {}   # chip_id -> current chip dict (from JS)
    file_text:     dict = {}
    for path in chip_files:
        with open(path, encoding='utf-8') as fh:
            file_text[path] = fh.read()
        for chip_id, chip in parse_chips_file(path).items():
            chip_to_file[chip_id] = path
            current_data[chip_id] = chip

    # Group field-level updates per file, skipping anything unchanged
    updates_per_file: dict = {}
    missing_chips = []
    malformed = []
    skipped = 0
    for chip_id, text_body in chip_docs.items():
        if chip_id not in chip_to_file:
            missing_chips.append(chip_id)
            continue
        if not chip_data_is_clean(current_data[chip_id]):
            malformed.append(chip_id)
            continue
        new_parsed = parse_text(text_body)
        field_updates = diff_updates(current_data[chip_id], new_parsed)
        if not field_updates:
            skipped += 1
            continue
        path = chip_to_file[chip_id]
        updates_per_file.setdefault(path, []).append((chip_id, field_updates))

    # Apply updates per file
    files_modified = 0
    chips_updated  = 0
    chips_failed   = 0

    for path, items in updates_per_file.items():
        text = file_text[path]
        original = text
        for chip_id, parsed in items:
            new_text, ok, msg = update_chip_in_text(text, chip_id, parsed)
            if not ok:
                print(f"  WARN: {chip_id} in {os.path.basename(path)}: {msg}")
                chips_failed += 1
                continue
            text = new_text
            chips_updated += 1
        if text != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(text)
            files_modified += 1

    print(f"Updated {chips_updated} chips across {files_modified} files"
          f" (skipped {skipped} unchanged)")
    if chips_failed:
        print(f"Failed: {chips_failed}")
    if malformed:
        print(f"Skipped {len(malformed)} chips with malformed source data: "
              f"{', '.join(malformed)}")
    if missing_chips:
        print(f"Not found in any chip file: {len(missing_chips)} "
              f"(e.g. {', '.join(missing_chips[:5])})")


if __name__ == '__main__':
    main()
