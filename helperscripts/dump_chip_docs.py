#!/usr/bin/env python3
"""
dump_chip_docs.py

Reads every chip in js/chips/chips*.js and writes a flat JSON file
(helperscripts/chip_docs.json) of the form:

    {
      "7400": "The 74x00 is the quintessential...\\n\\nPins:\\n  1A: ...\\n...",
      "7402": "...",
      ...
    }

Each value contains only the parts of the chip that are plain prose:
    - guideOverview
    - "Pins:" block (from guidePinDescriptions)
    - each guideSection (title, paragraphs, formulas, list, note)

Excluded: name, simpleName, description, datasheet, tags, pinout, gates,
pin/vcc/gnd numbers.

The output file is deleted and recreated on every run.  Companion script
write_chip_docs.py reads the same JSON and writes it back into the chip
JS files.

Usage:
    python3 helperscripts/dump_chip_docs.py
"""

import json
import glob
import os
import re
import subprocess
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.dirname(SCRIPT_DIR)
CHIPS_DIR  = os.path.join(REPO_ROOT, 'js', 'chips')
OUTPUT     = os.path.join(SCRIPT_DIR, 'chip_docs.json')

# Parses every chips*.js path passed on argv in ONE node process and emits a
# single merged {chip_id: chip_obj} JSON object. A per-file eval failure is
# reported on stderr and skipped rather than wedging the whole run.
NODE_HELPER = r"""
const fs  = require('fs');
const os  = require('os');
const vm  = require('vm');
const merged = {};
for (const src_path of process.argv.slice(2)) {
    try {
        let src = fs.readFileSync(src_path, 'utf8');
        src = src.replace(/\/\*[\s\S]*?\*\//g, '');
        src = src.replace(/^export const \w+ = /m, 'module.exports = ');
        const sandbox = { module: { exports: {} }, require, __filename: src_path };
        vm.runInNewContext(src, sandbox, { filename: src_path, timeout: 5000 });
        const data = sandbox.module.exports;
        if (data && typeof data === 'object') Object.assign(merged, data);
    } catch (err) {
        process.stderr.write('WARN ' + src_path + ': ' + err.message + '\n');
    }
}
process.stdout.write(JSON.stringify(merged));
"""


def parse_all_chip_files(js_paths: list) -> dict:
    """Use one Node.js process to parse all chips*.js files; returns merged dict."""
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.js', delete=False, encoding='utf-8'
    ) as fh:
        fh.write(NODE_HELPER)
        helper = fh.name

    try:
        result = subprocess.run(
            ['node', helper, *js_paths],
            capture_output=True, text=True, timeout=60
        )
        if result.stderr.strip():
            print(result.stderr.strip())
        if result.returncode != 0 or not result.stdout.strip():
            print(f"  WARN: node failed: {result.stderr.strip()[:200]}")
            return {}
        return json.loads(result.stdout)
    except Exception as exc:
        print(f"  WARN: could not parse chip files: {exc}")
        return {}
    finally:
        os.unlink(helper)


def parse_chips_file(js_path: str) -> dict:
    """Parse a single chips*.js file; returns dict of chip objects.

    Thin wrapper over parse_all_chip_files so companion scripts
    (write_chip_docs.py) that import this keep working.
    """
    return parse_all_chip_files([js_path])


def format_chip_text(chip: dict) -> str:
    """Build the plain-text body for one chip (no name/simpleName/description/datasheet)."""
    parts = []

    overview = (chip.get('guideOverview') or '').strip()
    if overview:
        parts.append(overview)

    pin_descs = chip.get('guidePinDescriptions') or {}
    if pin_descs:
        block = ['Pins:']
        for pin, desc in pin_descs.items():
            block.append(f"  {pin}: {desc}")
        parts.append('\n'.join(block))

    for section in (chip.get('guideSections') or []):
        block = []
        title = (section.get('title') or '').strip()
        if title:
            block.append(title)

        for para in (section.get('paragraphs') or []):
            block.append(para)

        for formula in (section.get('formulas') or []):
            block.append(f"  {formula}")

        for item in (section.get('list') or []):
            block.append(f"  - {item}")

        note = (section.get('note') or '').strip()
        if note:
            block.append(f"Note: {note}")

        if block:
            parts.append('\n'.join(block))

    return '\n\n'.join(parts)


def chip_file_key(path: str) -> int:
    m = re.search(r'chips(\d+)\.js$', path)
    return int(m.group(1)) if m else 0


def main():
    if os.path.exists(OUTPUT):
        os.unlink(OUTPUT)

    chip_files = sorted(
        glob.glob(os.path.join(CHIPS_DIR, 'chips*.js')),
        key=chip_file_key
    )
    if not chip_files:
        print(f"No chip files found in {CHIPS_DIR}")
        return

    output: dict = {}
    chips = parse_all_chip_files(chip_files)
    for chip_id, chip in chips.items():
        if isinstance(chip, dict):
            output[chip_id] = format_chip_text(chip)

    with open(OUTPUT, 'w', encoding='utf-8') as fh:
        json.dump(output, fh, indent=2, ensure_ascii=False)
        fh.write('\n')

    print(f"Wrote {len(output)} chips to {OUTPUT}")


if __name__ == '__main__':
    main()
