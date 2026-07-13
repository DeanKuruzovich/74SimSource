#!/usr/bin/env python3
"""
fixFormatting.py
----------------
Walks the entire 74SIM repo and replaces typographic problems in text files:

  1. Specific hyphenated compound words → space-separated  (case-insensitive,
     preserving original case of each half)
  2. Any   N bit  pattern (digits followed by -bit)  →  N bit
  3. Em dashes (  U+2014) and en dashes (  U+2013) → single space

Skips binary / non-UTF-8 files, .git/, and common build artefacts.
"""
# ---------------------------------------------------------------------------
# Target selection. Set exactly one of these to True.
#   full_repo        — walk the whole repo (filtered by ALLOW_PATH_PATTERNS)
#   full_docs        — only user-facing docs: docs.html + chip_docs.json
#   justChip_docsJson — only helperscripts/chip_docs.json (values only)
# ---------------------------------------------------------------------------
full_repo = False
full_docs = False
justChip_docsJson = True

import json
import os
import re
import sys

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHIP_DOCS_JSON = os.path.join(REPO_ROOT, "helperscripts", "chip_docs.json")
DOCS_HTML      = os.path.join(REPO_ROOT, "docs.html")

# Directories / file patterns to skip
SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv",
    "target",           # Rust build output
    "dist-app",         # generated output   skip to avoid double-processing
    "releases",
}

SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
    ".woff", ".woff2", ".ttf", ".eot",
    ".pdf", ".dmg", ".exe", ".AppImage", ".gz", ".zip",
    ".pyc", ".pyo",
    ".sig",             # binary signatures
}

# Allowlist of files the script may edit. Anything not matching is left alone.
# Only user-facing prose lives in these. Engine code, CSS, tests, build
# helpers, and backend code are off-limits so identifiers (file paths, DOM
# ids, CSS classes, variable names) in them can't be corrupted.
ALLOW_PATH_PATTERNS = [
    re.compile(r".*\.md$"),
    re.compile(r".*\.html$"),
    re.compile(r"(^|/)js/chips/chips\d+\.js$"),
    re.compile(r"(^|/)js/onramp-lessons\.js$"),
    re.compile(r"(^|/)js/updateLog\.js$"),
    re.compile(r"(^|/)js/examples/.*\.json$"),
]

def is_allowed(rel_path: str) -> bool:
    rel = rel_path.replace(os.sep, "/")
    return any(p.search(rel) for p in ALLOW_PATH_PATTERNS)

# ---------------------------------------------------------------------------
# Hyphenated-word replacements
# Each entry is (left_word, right_word).  Matching is case-insensitive.
# The replacement preserves the original casing of each half.
# ---------------------------------------------------------------------------

HYPHENATED_PAIRS = [
    ("Mixed",    "Polarity"),
    ("active",   "HIGH"),
    ("active",   "LOW"),
    ("Boundary", "scan"),
    ("built",    "in"),
    ("Pull",     "down"),
    ("Pull",     "up"),
    ("Per",      "net"),
    ("Gate",     "level"),
    ("Floating", "input"),
    ("Level",    "setting"),
    ("Family",   "dependent"),
    ("wired",    "AND"),
    ("wired",    "OR"),
    ("built","in"),
    ("flood","fill"),
    ("74", "series"),
    ("Serial","In"),
    ("Parallel","Out"),
    ("negative","edge"),
    ("edge","triggered"),
    ("falling","edge"),
    ("rising","edge"),
    ("1","line"),
    ("2","line"),
    ("3","line"),
    ("4","line"),
    ("5","line"),
    ("6","line"),
    ("7","line"),
    ("8","line"),
    ("9","line"),
    ("carry","save"),
    ("high","speed"),
    ("BCD","to"),
    ("to","binary"),
    ("digital","to"),
    ("analog","to"),
    ("open","collector"),
    ("open","drain"),
    ("parallel","in"),
    ("serial","out"),
    ("cross","coupled"),
    ("push","pull"),
    ("totem","pole"),
    ("tri","state"),
    ("level","sensitive"),
    ("divide","by"),
    ("fan","out"),
    ("flip","flop"),
    ("schmitt","trigger"),
    ("non","inverting"),
    ("controller","device"),
    ("7","segment"),
    ("AND","OR"),
    ("OR","AND"),
    ("random","access"),
    ("carry","in"),
    ("ROM","Based"),
    ("AND","gated"),
    ("parallel", "access"),
    ("bi",       "quinary"),
    ("look",     "ahead"),
    ("non",      "inverted"),
    ("general",  "purpose"),
    ("control",  "voltage"),
    ("square",   "wave"),
    ("one",      "shot"),
    ("4000",     "series"),
    ("near",     "zero"),
    ("cross",    "connected"),
    ("cross",    "connecting"),
    ("carry",    "out"),
    ("most",     "significant"),
    ("least",    "significant"),
    ("no",       "connect"),
    ("by",       "twelve"),
    ("ALS",      "family"),
    ("ALU",      "like"),
    ("ALU",      "style"),
    ("Always",   "Active"),
    ("always",   "driven"),
    ("always",   "enabled"),
    ("analog",   "in"),
    ("analog",   "ish"),
    ("analog",   "like"),
    ("analog",   "logic"),
    ("analog",   "modeled"),
    ("analog",   "sensitive"),
    ("analog",   "simulated"),
    ("analog",   "style"),
    ("analog",   "switch"),
    ("analog",   "threshold"),
    ("and",      "add"),
    ("AND",      "ed"),
    ("AND",      "gate"),
    ("and",      "hold"),
    ("AND",      "like"),
    ("and",      "phase"),
    ("and",      "trigger"),
    ("application", "specific"),
    ("around",   "safe"),
    ("as",       "is"),
    ("asynchronous", "clear"),
    ("back",     "substitute"),
    ("back",     "to"),
    ("backplane", "style"),
    ("band",     "gap"),
    ("bank",     "enable"),
    ("banked",   "decoding"),
    ("battery",  "backed"),
    ("Battery",  "friendly"),
    ("BCD",      "encoded"),
    ("behavior", "modeled"),
    ("best",     "effort"),
    ("Binary",   "Coded"),
    ("binary",   "to"),
    ("bit",      "bang"),
    ("bit",      "pair"),
    ("bit",      "serial"),
    ("bit",      "slice"),
    ("bit",      "to"),
    ("blow",     "up"),
    ("board",    "level"),
    ("bounce",   "toggle"),
    ("boundary", "aware"),
    ("boundary", "contains"),
    ("breadboard", "connected"),
    ("build",    "electronic"),
    ("burned",   "in"),
    ("burned",   "out"),
    ("burst",    "error"),
    ("bus",      "conditioning"),
    ("bus",      "connected"),
    ("bus",      "control"),
    ("bus",      "driver"),
    ("bus",      "electrical"),
    ("bus",      "enable"),
    ("bus",      "expansion"),
    ("bus",      "facing"),
    ("bus",      "friendly"),
    ("Bus",      "Hold"),
    ("bus",      "interface"),
    ("bus",      "isolation"),
    ("Bus",      "Level"),
    ("bus",      "line"),
    ("bus",      "loading"),
    ("bus",      "oriented"),
    ("bus",      "ownership"),
    ("bus",      "peripheral"),
    ("bus",      "register"),
    ("bus",      "sharing"),
    ("Bus",      "side"),
    ("bus",      "state"),
    ("bus",      "structured"),
    ("bus",      "switch"),
    ("bus",      "termination"),
    ("bus",      "transceiver"),
    ("bus",      "transfer"),
    ("bus",      "width"),
    ("by",       "column"),
    ("by",       "step"),
    ("BYP",      "controlled"),
    ("byte",     "identical"),
    ("byte",     "plus"),
    ("byte",     "wide"),
    ("cable",    "driven"),
    ("cable",    "interconnect"),
    ("capacitor", "based"),
    ("carry",    "generate"),
    ("carry",    "lookahead"),
    ("carry",    "propagate"),
    ("CBT",      "family"),
    ("CBT",      "style"),
    ("CCITT",    "only"),
    ("ceramic",  "disc"),
    ("channel",  "straddle"),
    ("clock",    "controlled"),
    ("clock",    "distribution"),
    ("clock",    "driver"),
    ("clock",    "enable"),
    ("clock",    "enabled"),
    ("clock",    "latch"),
    ("clock",    "latches"),
    ("clock",    "like"),
    ("Clock",    "to"),
    ("CMOS",     "to"),
    ("coax",     "terminated"),
    ("Coin",     "tosser"),
    ("collector", "to"),
    ("column",   "by"),
    ("combined", "bbox"),
    ("common",   "anode"),
    ("common",   "cathode"),
    ("Common",   "clock"),
    ("common",   "I"),
    ("common",   "mode"),
    ("complement", "and"),
    ("complementary", "style"),
    ("complemented", "bus"),
    ("component", "boundary"),
    ("conditions", "met"),
    ("constant", "current"),
    ("contention", "safe"),
    ("Context",  "sensitive"),
    ("control",  "critical"),
    ("control",  "line"),
    ("control",  "pin"),
    ("control",  "signal"),
    ("controller", "to"),
    ("copper",   "colored"),
    ("Count",    "down"),
    ("count",    "enable"),
    ("Count",    "up"),
    ("counter",  "clockwise"),
    ("counter",  "plus"),
    ("counters", "dividers"),
    ("CPU",      "design"),
    ("cross",    "connect"),
    ("cross",    "domain"),
    ("cross",    "interleaved"),
    ("Crystal",  "controlled"),
    ("crystal",  "startup"),
    ("current",  "flow"),
    ("current",  "limiting"),
    ("current",  "sensing"),
    ("current",  "sink"),
    ("currently", "servicing"),
    ("cycle",    "steal"),
    ("daisy",    "chain"),
    ("daisy",    "chained"),
    ("daisy",    "chaining"),
    ("daisy",    "chains"),
    ("datasheet", "recommended"),
    ("De",       "assert"),
    ("de",       "asserted"),
    ("de",       "asserts"),
    ("decimal",  "counting"),
    ("decoder",  "plus"),
    ("default",  "HIGH"),
    ("defense",  "in"),
    ("delta",    "sigma"),
    ("detect",   "all"),
    ("device",   "to"),
    ("different", "height"),
    ("differential", "drive"),
    ("differential", "like"),
    ("differential", "receiver"),
    ("digit",    "select"),
    ("digit",    "selection"),
    ("digital",  "badge"),
    ("digital",  "logic"),
    ("digital",  "only"),
    ("DIP",      "switch"),
    ("Direct",   "Drive"),
    ("direction", "control"),
    ("direction", "controlled"),
    ("direction", "select"),
    ("Disc",     "local"),
    ("divided",  "by"),
    ("document", "level"),
    ("documentation", "oriented"),
    ("dot",      "AND"),
    ("double",   "bit"),
    ("double",   "buffered"),
    ("double",   "buffering"),
    ("Double",   "check"),
    ("double",   "checking"),
    ("double",   "error"),
    ("Double",   "indexed"),
    ("double",   "latch"),
    ("down",     "count"),
    ("down",     "counter"),
    ("down",     "counting"),
    ("drive",    "strength"),
    ("driver",   "grade"),
    ("dual",     "bus"),
    ("dual",     "channel"),
    ("Dual",     "Enable"),
    ("dual",     "FF"),
    ("dual",     "gate"),
    ("Dual",     "OE"),
    ("Dual",     "Polarity"),
    ("dual",     "port"),
    ("dual",     "rail"),
    ("Dual",     "Rank"),
    ("dual",     "serial"),
    ("dual",     "slope"),
    ("dual",     "supply"),
    ("duty",     "cycle"),
    ("ECL",      "level"),
    ("Edge",     "detect"),
    ("edge",     "detection"),
    ("edge",     "rate"),
    ("Eight",    "bit"),
    ("eight",    "channel"),
    ("electronic", "circuits"),
    ("emitter",  "coupled"),
    ("Enable",   "output"),
    ("end",      "nodes"),
    ("end",      "of"),
    ("enhanced", "process"),
    ("equal",    "to"),
    ("error",    "level"),
    ("event",    "counting"),
    ("exclusive", "NOR"),
    ("exclusive", "OR"),
    ("expander", "oriented"),
    ("expansion", "network"),
    ("externally", "wired"),
    ("fan",      "in"),
    ("Far",      "side"),
    ("fast",     "carry"),
    ("feature",  "complete"),
    ("FET",      "switch"),
    ("Fiber",    "optic"),
    ("field",    "programmable"),
    ("file",     "to"),
    ("fine",     "grained"),
    ("fine",     "tunes"),
    ("first",    "arrival"),
    ("first",    "entered"),
    ("first",    "in"),
    ("first",    "out"),
    ("Five",     "bit"),
    ("fixed",    "point"),
    ("fixed",    "polynomial"),
    ("Fixed",    "size"),
    ("flip",     "flops"),
    ("floating", "prone"),
    ("flops",    "latches"),
    ("forced",   "HIGH"),
    ("format",   "select"),
    ("forward",  "biased"),
    ("four",     "bit"),
    ("four",     "gate"),
    ("Four",     "input"),
    ("four",     "phase"),
    ("four",     "way"),
    ("free",     "running"),
    ("frequency", "and"),
    ("frequency", "division"),
    ("frequency", "setting"),
    ("frequency", "switching"),
    ("Front",    "facing"),
    ("full",     "adder"),
    ("full",     "function"),
    ("full",     "scale"),
    ("full",     "swing"),
    ("function", "select"),
    ("fuse",     "map"),
    ("fuse",     "programmable"),
    ("gas",      "discharge"),
    ("gate",     "eval"),
    ("Gate",     "select"),
    ("glitch",   "free"),
    ("Glitch",   "less"),
    ("glue",     "logic"),
    ("GND",      "tagged"),
    ("GND",      "wins"),
    ("go",       "to"),
    ("Gray",     "encoded"),
    ("Gray",     "zone"),
    ("Greater",  "or"),
    ("greater",  "than"),
    ("ground",   "clamp"),
    ("Group",    "select"),
    ("half",     "byte"),
    ("half",     "cycle"),
    ("half",     "ellipse"),
    ("half",     "enable"),
    ("Half",     "extents"),
    ("half",     "frequency"),
    ("Half",     "Rate"),
    ("half",     "segment"),
    ("half",     "size"),
    ("half",     "sum"),
    ("half",     "word"),
    ("hand",     "solve"),
    ("Hard",     "reset"),
    ("hard",     "wire"),
    ("hard",     "wired"),
    ("heavy",    "duty"),
    ("Hi",       "Z"),
    ("HIGH",     "active"),
    ("high",     "current"),
    ("high",     "drive"),
    ("high",     "fanout"),
    ("HIGH",     "HIGH"),
    ("high",     "impedance"),
    ("high",     "order"),
    ("high",     "resolution"),
    ("HIGH",     "to"),
    ("high",     "voltage"),
    ("HIGH",     "Z"),
    ("higher",   "current"),
    ("higher",   "drive"),
    ("higher",   "level"),
    ("higher",   "numbered"),
    ("Higher",   "order"),
    ("higher",   "power"),
    ("higher",   "priority"),
    ("higher",   "resolution"),
    ("higher",   "speed"),
    ("higher",   "voltage"),
    ("highest",  "active"),
    ("highest",  "numbered"),
    ("highest",  "priority"),
    ("hold",     "previous"),
    ("hold",     "toggle"),
    ("hole",     "apart"),
    ("hole",     "hover"),
    ("hot",      "plug"),
    ("HP",       "IB"),
    ("in",       "depth"),
    ("in",       "digital"),
    ("in",       "first"),
    ("in",       "flight"),
    ("In",       "line"),
    ("in",       "memory"),
    ("in",       "progress"),
    ("inactive", "inverted"),
    ("Independent", "Enable"),
    ("independently", "gated"),
    ("initial",  "click"),
    ("inputs",   "first"),
    ("inter",    "group"),
    ("interrupt", "generating"),
    ("inversion", "aware"),
    ("Inversion", "select"),
    ("inverted", "input"),
    ("inverting", "input"),
    ("inverting", "output"),
    ("keyboard", "matrix"),
    ("lamp",     "test"),
    ("largest",  "capacity"),
    ("laser",    "etched"),
    ("last",     "pin"),
    ("Latch",    "enable"),
    ("latched",  "switch"),
    ("LCD",      "Oriented"),
    ("LCD",      "style"),
    ("lead",     "end"),
    ("LED",      "oriented"),
    ("less",     "significant"),
    ("less",     "than"),
    ("lesson",   "select"),
    ("level",    "clocked"),
    ("level",    "controlled"),
    ("level",    "latch"),
    ("level",    "latches"),
    ("level",    "shifting"),
    ("level",    "translation"),
    ("level",    "triggered"),
    ("live",     "compare"),
    ("Load",     "Enable"),
    ("local",    "side"),
    ("Lock",     "detect"),
    ("lock",     "related"),
    ("lock",     "step"),
    ("logic",    "combining"),
    ("logic",    "design"),
    ("logic",    "function"),
    ("logic",    "HIGH"),
    ("logic",    "ics"),
    ("logic",    "inverted"),
    ("logic",    "level"),
    ("logic",    "low"),
    ("Logic",    "Reset"),
    ("logic",    "side"),
    ("Logic",    "to"),
    ("Logic",    "wise"),
    ("long",     "cable"),
    ("long",     "line"),
    ("look",     "up"),
    ("loop",     "related"),
    ("low",      "delay"),
    ("low",      "frequency"),
    ("low",      "impedance"),
    ("low",      "numbered"),
    ("low",      "order"),
    ("low",      "power"),
    ("low",      "resistance"),
    ("low",      "skew"),
    ("low",      "speed"),
    ("low",      "swing"),
    ("LOW",      "to"),
    ("LOW",      "true"),
    ("low",      "V"),
    ("low",      "voltage"),
    ("lower",    "frequency"),
    ("lower",    "half"),
    ("lower",    "left"),
    ("lower",    "numbered"),
    ("lower",    "order"),
    ("lower",    "power"),
    ("lower",    "priority"),
    ("lower",    "rail"),
    ("lower",    "right"),
    ("lower",    "significance"),
    ("lower",    "swing"),
    ("lowest",   "numbered"),
    ("lowest",   "priority"),
    ("LS",       "family"),
    ("LS",       "Process"),
    ("LV",       "TTL"),
    ("Master",   "Slave"),
    ("match",    "and"),
    ("Metastable", "Resistant"),
    ("microcontroller", "like"),
    ("microprocessor", "controlled"),
    ("microprocessor", "style"),
    ("mid",      "drag"),
    ("mixed",    "logic"),
    ("mixed",    "output"),
    ("mixed",    "signal"),
    ("mixed",    "standard"),
    ("mixed",    "supply"),
    ("mixed",    "voltage"),
    ("Mode",     "control"),
    ("mode",     "select"),
    ("mode",     "selectable"),
    ("module",   "level"),
    ("modulo",   "N"),
    ("more",     "pure"),
    ("most",     "used"),
    ("motor",    "control"),
    ("mouse",    "off"),
    ("multi",    "bank"),
    ("multi",    "bit"),
    ("multi",    "byte"),
    ("multi",    "channel"),
    ("multi",    "chip"),
    ("multi",    "component"),
    ("multi",    "decade"),
    ("multi",    "device"),
    ("multi",    "digit"),
    ("multi",    "drop"),
    ("multi",    "function"),
    ("Multi",    "input"),
    ("multi",    "level"),
    ("multi",    "master"),
    ("Multi",    "Mode"),
    ("multi",    "move"),
    ("multi",    "output"),
    ("multi",    "package"),
    ("Multi",    "Port"),
    ("Multi",    "processor"),
    ("Multi",    "Rate"),
    ("multi",    "select"),
    ("multi",    "selection"),
    ("multi",    "source"),
    ("multi",    "stage"),
    ("multi",    "tier"),
    ("Multi",    "wire"),
    ("multiple", "port"),
    ("multiply", "accumulate"),
    ("multiply", "style"),
    ("NAND",     "based"),
    ("NAND",     "gate"),
    ("near",     "black"),
    ("near",     "constant"),
    ("near",     "open"),
    ("Near",     "side"),
    ("neg",      "edge"),
    ("negative", "enable"),
    ("negative", "going"),
    ("negative", "logic"),
    ("next",     "state"),
    ("nibble",   "wide"),
    ("Nine",     "Bit"),
    ("Nine",     "wide"),
    ("Nines",    "complement"),
    ("no",       "pull"),
    ("noise",    "immune"),
    ("noise",    "induced"),
    ("noise",    "sensitive"),
    ("Noise",    "Tolerant"),
    ("non",      "band"),
    ("non",      "BCD"),
    ("Non",      "combinational"),
    ("non",      "complementing"),
    ("non",      "existent"),
    ("non",      "floating"),
    ("non",      "GND"),
    ("non",      "inv"),
    ("non",      "numeric"),
    ("non",      "overlapping"),
    ("non",      "reference"),
    ("non",      "rising"),
    ("non",      "sign"),
    ("non",      "standard"),
    ("non",      "trivial"),
    ("non",      "uniform"),
    ("non",      "zero"),
    ("NOR",      "gate"),
    ("NOR",      "heavy"),
    ("Norton",   "equivalent"),
    ("NOT",      "J"),
    ("NOT",      "K"),
    ("NOT",      "NOR"),
    ("now",      "known"),
    ("number",   "based"),
    ("Of",       "Conversion"),
    ("of",       "count"),
    ("of",       "Eight"),
    ("of",       "four"),
    ("of",       "many"),
    ("of",       "packet"),
    ("of",       "products"),
    ("of",       "range"),
    ("of",       "second"),
    ("Of",       "Sixteen"),
    ("off",      "board"),
    ("off",      "canvas"),
    ("Off",      "rail"),
    ("off",      "state"),
    ("old",      "school"),
    ("on",       "chip"),
    ("on",       "hovered"),
    ("on",       "resistance"),
    ("one",      "bit"),
    ("one",      "clock"),
    ("one",      "hole"),
    ("one",      "hot"),
    ("one",      "of"),
    ("one",      "to"),
    ("one",      "way"),
    ("open",     "emitter"),
    ("open",     "source"),
    ("opposite", "polarity"),
    ("OR",       "ed"),
    ("or",       "Equal"),
    ("OR",       "gated"),
    ("OR",       "ing"),
    ("OR",       "INVERT"),
    ("or",       "nothing"),
    ("OR",       "then"),
    ("over",     "range"),
    ("overlap",  "free"),
    ("parallel", "enable"),
    ("parallel", "load"),
    ("parallel", "loads"),
    ("parallel", "preset"),
    ("parallel", "to"),
    ("parity",   "extended"),
    ("parity",   "protected"),
    ("parity",   "related"),
    ("partial",  "cycle"),
    ("pass",     "switch"),
    ("pass",     "through"),
    ("pass",     "transistor"),
    ("per",      "channel"),
    ("per",      "chip"),
    ("Per",      "class"),
    ("per",      "item"),
    ("per",      "nibble"),
    ("Per",      "pin"),
    ("per",      "section"),
    ("per",      "seg"),
    ("per",      "step"),
    ("per",      "switch"),
    ("phase",    "comparator"),
    ("phase",    "compared"),
    ("phase",    "comparison"),
    ("phase",    "difference"),
    ("phase",    "error"),
    ("phase",    "locked"),
    ("phase",    "related"),
    ("physical", "hole"),
    ("pin",      "compatible"),
    ("Pin",      "for"),
    ("Pin",      "on"),
    ("pin",      "to"),
    ("pinout",   "legend"),
    ("pipeline", "oriented"),
    ("pixel",    "position"),
    ("plain",    "object"),
    ("plug",     "in"),
    ("plus",     "display"),
    ("plus",     "flag"),
    ("plus",     "monitor"),
    ("PMOS",     "compatible"),
    ("point",    "to"),
    ("Polarity", "Matched"),
    ("polarity", "select"),
    ("polarity", "variant"),
    ("polynomial", "based"),
    ("pos",      "edge"),
    ("positive", "edge"),
    ("positive", "enable"),
    ("positive", "feedback"),
    ("positive", "going"),
    ("positive", "logic"),
    ("post",     "solve"),
    ("power",    "badge"),
    ("Power",    "Down"),
    ("power",    "hungry"),
    ("power",    "none"),
    ("power",    "of"),
    ("power",    "on"),
    ("power",    "partial"),
    ("power",    "pin"),
    ("power",    "rail"),
    ("power",    "sensitive"),
    ("power",    "up"),
    ("powered",  "wire"),
    ("prefers",  "reduced"),
    ("Preset",   "Only"),
    ("pressed",  "state"),
    ("previous", "state"),
    ("priority", "encoded"),
    ("producer", "consumer"),
    ("Program",  "load"),
    ("properly", "phased"),
    ("pseudo",   "random"),
    ("pulse",    "controlled"),
    ("pulse",    "width"),
    ("pure",     "digital"),
    ("purpose",  "built"),
    ("push",     "button"),
    ("queue",    "depth"),
    ("race",     "around"),
    ("rail",     "clamp"),
    ("rail",     "tagged"),
    ("rail",     "to"),
    ("random",   "state"),
    ("Rate",     "multiplied"),
    ("RC",       "shaped"),
    ("Re",       "add"),
    ("Re",       "apply"),
    ("Re",       "enable"),
    ("re",       "insert"),
    ("re",       "invokes"),
    ("re",       "read"),
    ("Re",       "run"),
    ("re",       "runs"),
    ("re",       "set"),
    ("Re",       "solve"),
    ("re",       "stamp"),
    ("re",       "stamped"),
    ("readback", "oriented"),
    ("real",     "time"),
    ("real",     "world"),
    ("reduced",  "motion"),
    ("Reference", "Biased"),
    ("Reference", "voltage"),
    ("registers", "counters"),
    ("reverse",  "bias"),
    ("reverse",  "biased"),
    ("reverse",  "polarity"),
    ("ribbon",   "cable"),
    ("ripple",   "blank"),
    ("ripple",   "blanking"),
    ("ripple",   "carry"),
    ("ripple",   "chains"),
    ("rise",     "time"),
    ("row",      "warn"),
    ("sample",   "and"),
    ("Schmitt",  "marked"),
    ("second",   "group"),
    ("second",   "least"),
    ("second",   "source"),
    ("second",   "stage"),
    ("segment",  "drive"),
    ("select",   "line"),
    ("self",     "clocking"),
    ("self",     "contained"),
    ("self",     "oscillate"),
    ("serial",   "chain"),
    ("serial",   "to"),
    ("series",   "terminate"),
    ("set",      "dominant"),
    ("Set",      "Reset"),
    ("setup",    "time"),
    ("Seven",    "segment"),
    ("shared",   "bus"),
    ("Shared",   "Clock"),
    ("shared",   "enable"),
    ("shared",   "line"),
    ("shift",    "and"),
    ("shift",    "chain"),
    ("shift",    "left"),
    ("Shift",    "register"),
    ("shift",    "registers"),
    ("shift",    "right"),
    ("shift",    "then"),
    ("short",    "circuit"),
    ("short",    "term"),
    ("Side",     "A"),
    ("Side",     "B"),
    ("side",     "channel"),
    ("sign",     "extend"),
    ("sign",     "extending"),
    ("signal",   "conditioning"),
    ("signal",   "integrity"),
    ("signal",   "path"),
    ("signal",   "processing"),
    ("significant", "digit"),
    ("simpler",  "flag"),
    ("single",   "bit"),
    ("Single",   "button"),
    ("single",   "chip"),
    ("single",   "click"),
    ("single",   "control"),
    ("single",   "ended"),
    ("single",   "error"),
    ("single",   "input"),
    ("Single",   "letter"),
    ("single",   "package"),
    ("Single",   "phase"),
    ("Single",   "pin"),
    ("single",   "pole"),
    ("single",   "stage"),
    ("single",   "supply"),
    ("single",   "throw"),
    ("sink",     "only"),
    ("six",      "channel"),
    ("six",      "gate"),
    ("sixteen",  "line"),
    ("slide",    "switch"),
    ("slow",     "driving"),
    ("slow",     "edge"),
    ("slow",     "rise"),
    ("slow",     "slewing"),
    ("slowly",   "changing"),
    ("slowly",   "slewing"),
    ("software", "controlled"),
    ("special",  "function"),
    ("speed",    "grade"),
    ("SPI",      "style"),
    ("split",    "en"),
    ("split",    "enable"),
    ("Split",    "Nibble"),
    ("split",    "polarity"),
    ("stage",    "to"),
    ("standard", "logic"),
    ("Start",    "of"),
    ("starts",   "with"),
    ("state",    "active"),
    ("state",    "badge"),
    ("state",    "detect"),
    ("state",    "inactive"),
    ("state",    "machine"),
    ("steady",   "state"),
    ("Step",     "by"),
    ("storage",  "register"),
    ("strobe",   "loaded"),
    ("sum",      "of"),
    ("Supply",   "monitor"),
    ("supply",   "rail"),
    ("supply",   "voltage"),
    ("Switch",   "Based"),
    ("switch",   "bounce"),
    ("switch",   "control"),
    ("switch",   "selectable"),
    ("synchronous", "CLR"),
    ("system",   "monitoring"),
    ("TAP",      "controller"),
    ("ten",      "bit"),
    ("ten",      "line"),
    ("tens",     "digit"),
    ("tenth",    "of"),
    ("terminal", "count"),
    ("test",     "access"),
    ("test",     "clock"),
    ("test",     "data"),
    ("Test",     "Logic"),
    ("test",     "mode"),
    ("test",     "reset"),
    ("then",     "invert"),
    ("then",     "latch"),
    ("Thirty",   "two"),
    ("Three",    "bit"),
    ("three",    "bus"),
    ("three",    "input"),
    ("three",    "state"),
    ("Three",    "Way"),
    ("threshold", "sense"),
    ("through",  "current"),
    ("through",  "hole"),
    ("through",  "R"),
    ("tile",     "edge"),
    ("time",     "base"),
    ("Time",     "domain"),
    ("time",     "multiplexed"),
    ("time",     "step"),
    ("time",     "stepping"),
    ("timing",   "capacitor"),
    ("timing",   "critical"),
    ("timing",   "network"),
    ("timing",   "resistor"),
    ("timing",   "sensitive"),
    ("to",       "A"),
    ("to",       "analog"),
    ("to",       "B"),
    ("to",       "back"),
    ("to",       "BCD"),
    ("to",       "D"),
    ("to",       "date"),
    ("to",       "Decimal"),
    ("to",       "device"),
    ("to",       "digital"),
    ("to",       "ECL"),
    ("to",       "emitter"),
    ("to",       "face"),
    ("to",       "GND"),
    ("to",       "HIGH"),
    ("to",       "logic"),
    ("to",       "LOW"),
    ("to",       "many"),
    ("to",       "move"),
    ("to",       "output"),
    ("to",       "Par"),
    ("to",       "parallel"),
    ("to",       "pin"),
    ("to",       "point"),
    ("to",       "port"),
    ("to",       "Q"),
    ("to",       "rail"),
    ("to",       "serial"),
    ("to",       "stage"),
    ("to",       "TTL"),
    ("Totem",    "Pole"),
    ("trade",    "off"),
    ("transmission", "line"),
    ("transparent", "latch"),
    ("Triple",   "condition"),
    ("triple",   "source"),
    ("TTL",      "compatible"),
    ("TTL",      "ECL"),
    ("TTL",      "friendly"),
    ("TTL",      "level"),
    ("TTL",      "like"),
    ("TTL",      "only"),
    ("TTL",      "style"),
    ("TTL",      "to"),
    ("twelve",   "bit"),
    ("twelve",   "channel"),
    ("two",      "bit"),
    ("two",      "channel"),
    ("two",      "decade"),
    ("two",      "enable"),
    ("two",      "input"),
    ("two",      "nibble"),
    ("two",      "number"),
    ("two",      "pass"),
    ("two",      "phase"),
    ("two",      "stage"),
    ("union",    "find"),
    ("units",    "digit"),
    ("up",       "count"),
    ("up",       "counting"),
    ("up",       "equipped"),
    ("up",       "to"),
    ("upper",    "left"),
    ("upper",    "order"),
    ("upper",    "right"),
    ("variable", "frequency"),
    ("VCC",      "at"),
    ("VCC",      "tagged"),
    ("VCC",      "through"),
    ("Voltage",  "controlled"),
    ("voltage",  "level"),
    ("Voltage",  "monitor"),
    ("Voltage",  "Translating"),
    ("wait",     "state"),
    ("wall",     "clock"),
    ("wave",     "shaping"),
    ("well",     "defined"),
    ("well",     "known"),
    ("Wide",     "Bus"),
    ("wide",     "path"),
    ("wire",     "AND"),
    ("wire",     "ANDed"),
    ("wire",     "ANDing"),
    ("wire",     "like"),
    ("wire",     "OR"),
    ("wire",     "programmed"),
    ("wired",    "backplane"),
    ("wired",    "logic"),
    ("world",    "pixel"),
    ("World",    "space"),
    ("write",    "enable"),
    ("write",    "only"),
    ("zero",     "crossing"),
    ("Zero",     "detect"),
    ("On",       "Ramp")
]

# Build a single compiled regex for all pairs.
# Each alternative captures (left)(right) so we can reassemble without the dash.
HYPHEN_RE = re.compile(
    "|".join(
        r"(" + re.escape(left) + r")-(" + re.escape(right) + r"s?)"
        for left, right in HYPHENATED_PAIRS
    ),
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Three-word compound phrases: A-B-C → A B C  (case-insensitive; s? catches plurals)
# ---------------------------------------------------------------------------

THREE_WORD_TRIPLES = [
    ("preset",  "to",  "9"),
    ("reset",   "to",  "0"),
    ("BCD",     "to",  "binary"),
    ("bit",     "by",  "bit"),
    ("charge",  "and", "discharge"),
    # X-to-Y conversions / level shifts (case-insensitive)
    ("HIGH",       "to",  "LOW"),
    ("LOW",        "to",  "HIGH"),
    ("Logic",      "to",  "logic"),
    ("Serial",     "to",  "Parallel"),
    ("Parallel",   "to",  "serial"),
    ("Ser",        "to",  "Par"),
    ("Binary",     "to",  "BCD"),
    ("binary",     "to",  "decimal"),
    ("CMOS",       "to",  "TTL"),
    ("GTL",        "to",  "TTL"),
    ("TTL",        "to",  "ECL"),
    ("Clamp",      "to",  "Rail"),
    # X-to-X reduplications
    ("point",      "to",  "point"),
    ("face",       "to",  "face"),
    ("end",        "to",  "end"),
    ("back",       "to",  "back"),
    ("rail",       "to",  "rail"),
    ("pin",        "to",  "pin"),
    ("output",     "to",  "output"),
    ("stage",      "to",  "stage"),
    ("device",     "to",  "device"),
    ("controller", "to",  "device"),
    ("collector",  "to",  "emitter"),
    # X-for-X / X-of-X / one-of-N
    ("Pin",        "for", "pin"),
    ("sum",        "of",  "product"),
    ("one",        "of",  "many"),
    ("one",        "to",  "many"),
    ("One",        "of",  "Ten"),
    ("One",        "of",  "Eight"),
    ("One",        "of",  "Sixteen"),
    ("One",        "of",  "four"),
    
    # X-or-Y / X-and-Y phrases
    ("Greater",    "or",  "Equal"),
    ("All",        "or",  "nothing"),
    ("frequency",  "and", "phase"),
    ("shift",      "and", "add"),
    ("sample",     "and", "hold"),
    ("complement", "and", "add"),
    ("match",      "and", "trigger"),
    # X-by-Y
    ("column",     "by",  "column"),
    ("file",       "by",  "file"),
    ("Step",       "by",  "step"),
]

THREE_WORD_RE = re.compile(
    "|".join(
        r"(" + re.escape(a) + r")-(" + re.escape(b) + r")-(" + re.escape(c) + r"s?)"
        for a, b, c in THREE_WORD_TRIPLES
    ),
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# N bit  →  N bit   (e.g. 1 bit, 16 bit, 32 bit …)
# N-word →  N word  (e.g. 4 word, 8 word …)
# N-pin  →  N pin   (e.g. 8 pin, 16 pin …)
# ---------------------------------------------------------------------------
NBIT_RE  = re.compile(r"(\d+)-bit",  re.IGNORECASE)
NWORD_RE = re.compile(r"(\d+)-word", re.IGNORECASE)
NPIN_RE  = re.compile(r"(\d+)-pin",  re.IGNORECASE)
NSTAGE_RE  = re.compile(r"(\d+)-stage",  re.IGNORECASE)

# ---------------------------------------------------------------------------
# Em dash (U+2014) and en dash (U+2013) -> single space.
# Eat surrounding whitespace so "word word" and "word word" both
# collapse to "word word".  Unicode escapes are used so this regex survives
# the script being run on itself (literal dashes would get eaten).
# ---------------------------------------------------------------------------
_EM_DASH = chr(0x2014)
_EN_DASH = chr(0x2013)
DASH_RE = re.compile(r"\s*[" + _EM_DASH + _EN_DASH + r"]\s*")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def apply_replacements(text: str) -> str:
    # Extract URLs and markdown links to preserve them
    links = []
    placeholder_template = "\x00LINK_{}\x00"

    # Pattern 1: markdown links [text](url)
    def _extract_markdown_link(m: re.Match) -> str:
        links.append(m.group(0))
        return placeholder_template.format(len(links) - 1)

    # Pattern 2: bare URLs (http://, https://, ftp://, file://)
    def _extract_url(m: re.Match) -> str:
        links.append(m.group(0))
        return placeholder_template.format(len(links) - 1)

    # Extract markdown links first: [any text](any url)
    text = re.sub(r'\[([^\]]*)\]\(([^)]*)\)', _extract_markdown_link, text)

    # Extract bare URLs
    text = re.sub(r'(?:https?|ftp|file)://[^\s\)]+', _extract_url, text)

    # Identifier-context filter: any quoted string with NO internal whitespace
    # is treated as an identifier (DOM id, file path, CSS class ref, etc.) and
    # protected from rewriting. Quoted prose like 'High-Z drive' is left
    # eligible because it contains a space.
    idents = []
    ident_placeholder = "\x00IDENT_{}\x00"

    def _extract_ident(m: re.Match) -> str:
        idents.append(m.group(0))
        return ident_placeholder.format(len(idents) - 1)

    # Match "...", '...', `...` where the inside contains no whitespace.
    # Each alternative uses its own delimiter so quotes don't nest.
    text = re.sub(r'"[^"\s]*"', _extract_ident, text)
    text = re.sub(r"'[^'\s]*'", _extract_ident, text)
    text = re.sub(r"`[^`\s]*`", _extract_ident, text)

    # 1. Three-word compound phrases must run before 2 word to prevent partial matches
    def _dehyphen3(m: re.Match) -> str:
        groups = [g for g in m.groups() if g is not None]
        return groups[0] + " " + groups[1] + " " + groups[2]

    text = THREE_WORD_RE.sub(_dehyphen3, text)

    # 2. Hyphenated compound words   preserve casing of each captured half
    def _dehyphen(m: re.Match) -> str:
        # m.group(0) is the full match; groups alternate (left, right) per alt
        groups = [g for g in m.groups() if g is not None]
        # groups[0] = left word, groups[1] = right word
        return groups[0] + " " + groups[1]

    text = HYPHEN_RE.sub(_dehyphen, text)

    # 3. N bit / N-word / N-pin /N-stage
    text = NBIT_RE.sub(r"\1 bit", text)
    text = NWORD_RE.sub(r"\1 word", text)
    text = NSTAGE_RE.sub(r"\1 stage",  text)

    # 4. Em / en dashes
    text = DASH_RE.sub(" ", text)

    # 5. Restore identifier-quoted strings, then URLs/markdown links.
    # Order matters: idents were extracted AFTER links, so restore them first
    # so the link placeholders are still intact when we restore the links.
    for i, ident in enumerate(idents):
        text = text.replace(ident_placeholder.format(i), ident)
    for i, link in enumerate(links):
        text = text.replace(placeholder_template.format(i), link)

    return text


def process_file(path: str) -> tuple[int, int]:
    """Return (lines_changed, replacements_made)."""
    try:
        with open(path, "r", encoding="utf-8") as fh:
            original = fh.read()
    except (UnicodeDecodeError, PermissionError):
        return 0, 0   # skip binary / unreadable files

    modified = apply_replacements(original)

    if modified == original:
        return 0, 0

    # Count rough replacement count by comparing line-by-line
    orig_lines = original.splitlines()
    mod_lines  = modified.splitlines()
    changed_lines = sum(1 for a, b in zip(orig_lines, mod_lines) if a != b)
    replacements  = len(orig_lines) - len(mod_lines) + changed_lines  # rough

    with open(path, "w", encoding="utf-8") as fh:
        fh.write(modified)

    return changed_lines, max(changed_lines, 1)


def process_json_file(path: str) -> tuple[int, int]:
    """Apply replacements to every string VALUE in a JSON file.

    Keys are treated as identifiers (chip names like "74x00") and left alone.
    Returns (values_changed, total_replacements_approx).
    """
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (UnicodeDecodeError, PermissionError, json.JSONDecodeError):
        return 0, 0

    values_changed = 0

    def walk(node):
        nonlocal values_changed
        if isinstance(node, dict):
            for k, v in node.items():
                if isinstance(v, str):
                    new_v = apply_replacements(v)
                    if new_v != v:
                        print("fix")
                        node[k] = new_v
                        values_changed += 1
                else:
                    walk(v)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                if isinstance(v, str):
                    new_v = apply_replacements(v)
                    if new_v != v:
                        node[i] = new_v
                        values_changed += 1
                else:
                    walk(v)

    walk(data)

    if values_changed == 0:
        return 0, 0

    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return values_changed, values_changed


def should_skip_dir(name: str) -> bool:
    return name in SKIP_DIRS or name.startswith(".")


def should_skip_file(name: str) -> bool:
    _, ext = os.path.splitext(name)
    return ext.lower() in SKIP_EXTENSIONS


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run_full_repo() -> tuple[int, int, int]:
    total_files = changed_files = total_changes = 0
    for dirpath, dirnames, filenames in os.walk(REPO_ROOT):
        dirnames[:] = [d for d in dirnames if not should_skip_dir(d)]
        for fname in filenames:
            if should_skip_file(fname):
                continue
            fpath = os.path.join(dirpath, fname)
            rel = os.path.relpath(fpath, REPO_ROOT)
            if not is_allowed(rel):
                continue
            total_files += 1
            lines_changed, n_replacements = process_file(fpath)
            if lines_changed:
                print(f"  fixed  {rel}  ({lines_changed} line(s) changed)")
                changed_files += 1
                total_changes += n_replacements
    return total_files, changed_files, total_changes


def run_chip_docs_json() -> tuple[int, int, int]:
    if not os.path.exists(CHIP_DOCS_JSON):
        print(f"  missing  {CHIP_DOCS_JSON}")
        return 0, 0, 0
    rel = os.path.relpath(CHIP_DOCS_JSON, REPO_ROOT)
    values_changed, n_replacements = process_json_file(CHIP_DOCS_JSON)
    if values_changed:
        print(f"  fixed  {rel}  ({values_changed} value(s) changed)")
        return 1, 1, n_replacements
    return 1, 0, 0


def run_full_docs() -> tuple[int, int, int]:
    total_files = changed_files = total_changes = 0

    # docs.html (and any other user-facing HTML articles at repo root)
    if os.path.exists(DOCS_HTML):
        total_files += 1
        rel = os.path.relpath(DOCS_HTML, REPO_ROOT)
        lines_changed, n_replacements = process_file(DOCS_HTML)
        if lines_changed:
            print(f"  fixed  {rel}  ({lines_changed} line(s) changed)")
            changed_files += 1
            total_changes += n_replacements

    # chip_docs.json
    t, c, n = run_chip_docs_json()
    total_files += t
    changed_files += c
    total_changes += n

    return total_files, changed_files, total_changes


def main():
    selected = [full_repo, full_docs, justChip_docsJson]
    if sum(bool(x) for x in selected) != 1:
        print("error: set exactly one of full_repo / full_docs / justChip_docsJson to True",
              file=sys.stderr)
        sys.exit(1)

    if full_repo:
        total_files, changed_files, total_changes = run_full_repo()
    elif full_docs:
        total_files, changed_files, total_changes = run_full_docs()
    else:
        total_files, changed_files, total_changes = run_chip_docs_json()

    print(f"\nDone. Scanned {total_files} files. "
          f"Modified {changed_files} file(s) across ~{total_changes} location(s).")


if __name__ == "__main__":
    main()
