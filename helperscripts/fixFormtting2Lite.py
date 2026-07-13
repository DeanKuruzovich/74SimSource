#!/usr/bin/env python3
"""
fixFormtting2Lite.py
--------------------
Targets only helperscripts/chip_docs.json.

Fixes:
  1. Q# Q#   -> Q#-Q#    (e.g. "Q0 Q7"  -> "Q0-Q7",  "QA0 QA3" -> "QA0-QA3")
  2. # pin   -> #-pin    (e.g. "14 pin" -> "14-pin", "8 pin"   -> "8-pin")
  3. 74###   -> 74x###   (e.g. "7400"   -> "74x00",  "7437"    -> "74x37")
  4. D# D#   -> D#-D#    (e.g. "D0 D7"  -> "D0-D7",  "D1 D2"   -> "D1-D2")
"""

import os
import re

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(REPO_ROOT, "helperscripts", "chip_docs.json")

# Q<ident> Q<ident>  ->  Q<ident>-Q<ident>
Q_RANGE_RE = re.compile(r'\b(Q\w+) (Q\w+)\b')

# \d+ pin  ->  \d+-pin
NPIN_RE = re.compile(r'(\d+) pin\b', re.IGNORECASE)

# 74<digits>  ->  74x<digits>   (bare chip numbers, not 74x00 / 74LS00 variants)
CHIP_NUM_RE = re.compile(r'\b74(\d{2,})\b')

# D<ident> D<ident>  ->  D<ident>-D<ident>
D_RANGE_RE = re.compile(r'\b(D\w+) (D\w+)\b')


def apply_replacements(text: str) -> str:
    text = CHIP_NUM_RE.sub(r'74x\1', text)
    text = Q_RANGE_RE.sub(r'\1-\2', text)
    text = D_RANGE_RE.sub(r'\1-\2', text)
    text = NPIN_RE.sub(r'\1-pin', text)
    return text


def main():
    if not os.path.isfile(TARGET):
        print(f"Target not found: {TARGET}")
        return

    with open(TARGET, "r", encoding="utf-8") as fh:
        original = fh.read()

    modified = apply_replacements(original)
    if modified == original:
        print(f"No changes for {os.path.relpath(TARGET, REPO_ROOT)}.")
        return

    orig_lines = original.splitlines()
    mod_lines  = modified.splitlines()
    changed_lines = sum(1 for a, b in zip(orig_lines, mod_lines) if a != b)

    with open(TARGET, "w", encoding="utf-8") as fh:
        fh.write(modified)

    print(f"Fixed {os.path.relpath(TARGET, REPO_ROOT)} ({changed_lines} line(s) changed).")


if __name__ == "__main__":
    main()
