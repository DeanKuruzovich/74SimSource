#!/usr/bin/env python3
"""
Generate the Ben Eater 8-bit SAP-1 CPU as a 74Sim example board.

Output: js/examples/BenEater8BitCPU.json

PHYSICAL MODEL (verified against js/constants.js, js/breadboard.js, js/netlist.js,
js/interaction.js, js/renderer.js):

  - One tile = 63 columns x 10 main rows + 4 power-rail rows.
  - Main rows 0..4 (top half) and 5..9 (bottom half) — five holes of one column-half
    are ONE net; the two halves are SEPARATE nets.
  - Chips anchor at row 4, straddle rows 4/5. An N-pin DIP occupies cols
    [col, col+N//2-1] across rows 4 and 5.
  - Power rails are per-tile. Row 1/3 = VCC, row 0/2 = GND (automatic — no source
    component needed). A power hole exists at column c only when
        oc = c - 2 ; 0 <= oc < 59 ; oc % 6 != 5
    -> valid power cols: 2-6, 8-12, 14-18, 20-24, 26-30, 32-36, 38-42,
       44-48, 50-54, 56-60.
  - A wire endpoint CANNOT share a hole with a chip pin or another wire endpoint.
    To connect to a pin, attach the wire to a free row in the SAME column-half
    (top pin row 4: free rows {3,2,1,0}; bottom pin row 5: free rows {6,7,8,9}).
    The column tie carries the net.
  - LED+resistor must not share both endpoints (that's a short + a hole collision).
    Channel-bridge pattern: wire to bank col row 3, resistor across rows 4->5
    (different halves -> different nets -> legal), LED from row 6 to a GND power
    rail at a valid column.

A validate() pass runs before writing; raises on any of the historical bugs.
"""

import json
import pathlib
import sys
from collections import defaultdict

# ── Geometry ────────────────────────────────────────────────────────────────

TILE_COLS = 63
CHIP_ROW  = 4    # all DIPs straddle 4/5
POWER_ROWS = {0, 1, 2, 3}
MAIN_ROWS  = set(range(10))

# Valid power-rail columns: oc = col - 2, 0 <= oc < 59, oc % 6 != 5
def is_valid_power_col(col: int) -> bool:
    oc = col - 2
    return 0 <= oc < 59 and oc % 6 != 5

VALID_POWER_COLS = [c for c in range(TILE_COLS) if is_valid_power_col(c)]

def nearest_valid_power_col(col: int) -> int:
    if is_valid_power_col(col):
        return col
    for d in range(1, TILE_COLS + 1):
        for c in (col - d, col + d):
            if 0 <= c < TILE_COLS and is_valid_power_col(c):
                return c
    raise RuntimeError(f"no valid power col anywhere near {col}")

# Track power-rail holes already used by wire endpoints so we don't collide.
_POWER_USED = defaultdict(set)   # (tx, ty, row) -> set of used cols

def alloc_power_col(tx: int, ty: int, row: int, prefer_col: int) -> int:
    """Pick a valid power column close to prefer_col, not used on this tile/row."""
    used = _POWER_USED[(tx, ty, row)]
    if prefer_col not in used and is_valid_power_col(prefer_col):
        used.add(prefer_col); return prefer_col
    for d in range(1, TILE_COLS + 1):
        for c in (prefer_col - d, prefer_col + d):
            if 0 <= c < TILE_COLS and is_valid_power_col(c) and c not in used:
                used.add(c); return c
    raise RuntimeError(f"power rail row {row} on tile ({tx},{ty}) exhausted")

# ── ID counter ──────────────────────────────────────────────────────────────

_next_id = [1]
def next_id() -> int:
    i = _next_id[0]
    _next_id[0] += 1
    return i

# ── Hole strings ────────────────────────────────────────────────────────────

def hole(tx: int, ty: int, kind: str, col: int, row: int) -> str:
    return f"{tx}:{ty}:{kind}:{col}:{row}"

def parse_hole(h: str):
    p = h.split(":")
    return int(p[0]), int(p[1]), p[2], int(p[3]), int(p[4])

# ── Pin → free-hole allocator ───────────────────────────────────────────────
# For each chip-pin hole (col, row==4 or row==5), the same-column-same-half has
# 4 OTHER holes that are electrically tied to the pin via the breadboard column.
# Wires attach to one of those free holes (never the pin hole itself).
# Each free hole hosts at most one wire endpoint (no wire-on-wire collisions).

_PIN_FREE = {}   # (tx, ty, col, half) -> list of remaining free rows

def pin_net(any_main_hole: str) -> str:
    """Allocate a free wire-attachment hole in the same column-half as the given
    main hole, EXCLUDING the input hole itself. Works for chip pins (rows 4/5),
    button/wire-like terminals, and clock-component outputs."""
    tx, ty, kind, col, row = parse_hole(any_main_hole)
    if kind != "main":
        raise RuntimeError(f"pin_net called on non-main hole {any_main_hole}")
    half = 0 if row < 5 else 1
    key = (tx, ty, col, half)
    if key not in _PIN_FREE:
        all_rows = list(range(0, 5)) if half == 0 else list(range(5, 10))
        # Prefer rows closer to the input row (i.e. closest to the actual pin)
        _PIN_FREE[key] = sorted(all_rows, key=lambda r: (abs(r - row), r))
    # Make sure the input hole's row isn't a candidate (it's occupied)
    if row in _PIN_FREE[key]:
        _PIN_FREE[key].remove(row)
    if not _PIN_FREE[key]:
        raise RuntimeError(f"no free rows left in column-half for {any_main_hole}")
    r = _PIN_FREE[key].pop(0)
    return hole(tx, ty, "main", col, r)

# ── Component emitters ──────────────────────────────────────────────────────

def chip(chip_id, tx, ty, col, *, ram_state=None):
    c = {
        "id": next_id(),
        "type": "chip",
        "chipId": chip_id,
        "tileX": tx, "tileY": ty,
        "col": col, "row": CHIP_ROW,
    }
    if ram_state is not None:
        c["ramState"] = {"words": ram_state}
    return c

def led(start_hole, end_hole, color="red"):
    return {"id": next_id(), "type": "led", "color": color,
            "startHoleId": start_hole, "endHoleId": end_hole}

def resistor(start_hole, end_hole, ohms=470):
    return {"id": next_id(), "type": "resistor", "resistance": ohms,
            "startHoleId": start_hole, "endHoleId": end_hole}

def capacitor(start_hole, end_hole, farads=100e-9):
    return {"id": next_id(), "type": "capacitor", "capacitance": farads,
            "startHoleId": start_hole, "endHoleId": end_hole}

def switch_(start_hole, end_hole, on=False):
    return {"id": next_id(), "type": "switch", "on": on,
            "startHoleId": start_hole, "endHoleId": end_hole}

def push_button(start_hole, end_hole):
    return {"id": next_id(), "type": "push_button",
            "startHoleId": start_hole, "endHoleId": end_hole}

def dip_switch(tx, ty, col, count=8, states=None):
    return {"id": next_id(), "type": "dip_switch",
            "tileX": tx, "tileY": ty, "col": col, "row": CHIP_ROW,
            "count": count, "states": states if states is not None else [False]*count}

def clock_component(tx, ty, col, row, freq_hz=1.0):
    return {"id": next_id(), "type": "clock",
            "tileX": tx, "tileY": ty, "col": col, "row": row,
            "frequencyHz": freq_hz, "dutyCycle": 0.5}

def seven_seg(tx, ty, col):
    return {"id": next_id(), "type": "seven_seg",
            "tileX": tx, "tileY": ty, "col": col, "row": CHIP_ROW,
            "commonAnode": True}

def text_box(x, y, text, w=400, h=50):
    return {"id": next_id(), "x": x, "y": y, "w": w, "h": h, "text": text, "v": 2}

def wire(a, b, color="#3498db"):
    return {"id": next_id(), "startHoleId": a, "endHoleId": b, "color": color}

# ── Pinout tables (verified against js/chips/*.js) ──────────────────────────

PIN_173 = {"OE1": 1, "OE2": 2, "1Q": 3, "2Q": 4, "3Q": 5, "4Q": 6, "CLK": 7,
           "GND": 8, "IE1": 9, "IE2": 10, "4D": 11, "3D": 12, "2D": 13, "1D": 14,
           "CLR": 15, "VCC": 16}
PIN_245 = {"DIR": 1, "A1": 2, "A2": 3, "A3": 4, "A4": 5, "A5": 6, "A6": 7, "A7": 8,
           "A8": 9, "GND": 10, "B8": 11, "B7": 12, "B6": 13, "B5": 14, "B4": 15,
           "B3": 16, "B2": 17, "B1": 18, "OE": 19, "VCC": 20}
PIN_189 = {"A0": 1, "Q1": 2, "D1": 3, "A1": 4, "Q2": 5, "D2": 6, "CS": 7, "GND": 8,
           "WE": 9, "D3": 10, "Q3": 11, "A2": 12, "D4": 13, "Q4": 14, "A3": 15,
           "VCC": 16}
PIN_283 = {"A2": 1, "B2": 2, "S2": 3, "A3": 4, "B3": 5, "S3": 6, "S4": 7, "GND": 8,
           "C0": 9, "S1": 10, "A1": 11, "B1": 12, "A4": 13, "B4": 14, "S5": 15,
           "VCC": 16}
PIN_377 = {"En": 1, "Q1": 2, "D1": 3, "D2": 4, "Q2": 5, "Q3": 6, "D3": 7, "D4": 8,
           "Q4": 9, "GND": 10, "CLK": 11, "Q5": 12, "D5": 13, "D6": 14, "Q6": 15,
           "Q7": 16, "D7": 17, "D8": 18, "Q8": 19, "VCC": 20}
PIN_161 = {"CLR": 1, "CLK": 2, "A": 3, "B": 4, "C": 5, "D": 6, "ENP": 7, "GND": 8,
           "LOAD": 9, "ENT": 10, "QD": 11, "QC": 12, "QB": 13, "QA": 14, "RCO": 15,
           "VCC": 16}
PIN_138 = {"A": 1, "B": 2, "C": 3, "G2A": 4, "G2B": 5, "G1": 6, "Y7": 7, "GND": 8,
           "Y6": 9, "Y5": 10, "Y4": 11, "Y3": 12, "Y2": 13, "Y1": 14, "Y0": 15,
           "VCC": 16}
PIN_139 = {"1G": 1, "1A": 2, "1B": 3, "1Y0": 4, "1Y1": 5, "1Y2": 6, "1Y3": 7,
           "GND": 8, "2Y3": 9, "2Y2": 10, "2Y1": 11, "2Y0": 12, "2B": 13, "2A": 14,
           "2G": 15, "VCC": 16}
PIN_157 = {"S": 1, "1A": 2, "1B": 3, "1Y": 4, "2A": 5, "2B": 6, "2Y": 7, "GND": 8,
           "3Y": 9, "3B": 10, "3A": 11, "4Y": 12, "4B": 13, "4A": 14, "En": 15,
           "VCC": 16}
PIN_107 = {"1J": 1, "1Qn": 2, "1Q": 3, "1K": 4, "2Q": 5, "2Qn": 6, "GND": 7,
           "2J": 8, "2CLK": 9, "2CLR": 10, "2K": 11, "1CLK": 12, "1CLR": 13,
           "VCC": 14}
PIN_04 = {"1A": 1, "1Y": 2, "2A": 3, "2Y": 4, "3A": 5, "3Y": 6, "GND": 7,
          "4Y": 8, "4A": 9, "5Y": 10, "5A": 11, "6Y": 12, "6A": 13, "VCC": 14}
PIN_QUAD = {"1A": 1, "1B": 2, "1Y": 3, "2A": 4, "2B": 5, "2Y": 6, "GND": 7,
            "3Y": 8, "3A": 9, "3B": 10, "4Y": 11, "4A": 12, "4B": 13, "VCC": 14}
PIN_28C16 = {"A7": 1, "A6": 2, "A5": 3, "A4": 4, "A3": 5, "A2": 6, "A1": 7, "A0": 8,
             "IO0": 9, "IO1": 10, "IO2": 11, "GND": 12, "IO3": 13, "IO4": 14,
             "IO5": 15, "IO6": 16, "IO7": 17, "CE": 18, "A10": 19, "OE": 20,
             "A9": 21, "A8": 22, "WE": 23, "VCC": 24}
PIN_555 = {"GND": 1, "TRIG": 2, "OUT": 3, "RESETn": 4, "CTRL": 5, "THRESH": 6,
           "DISCH": 7, "VCC": 8}

# Pin widths (DIP package pin count)
PIN_COUNT = {
    "74x173": 16, "74x245": 20, "74x189": 16, "74x283": 16, "74x377": 20,
    "74x161": 16, "74x138": 16, "74x139": 16, "74x157": 16, "74x107": 14,
    "74x04": 14, "74x00": 14, "74x08": 14, "74x32": 14, "74x86": 14,
    "28C16": 24, "555": 8,
}

PIN_MAPS = {
    "74x173": PIN_173, "74x245": PIN_245, "74x189": PIN_189, "74x283": PIN_283,
    "74x377": PIN_377, "74x161": PIN_161, "74x138": PIN_138, "74x139": PIN_139,
    "74x157": PIN_157, "74x107": PIN_107, "74x04": PIN_04, "74x00": PIN_QUAD,
    "74x08": PIN_QUAD, "74x32": PIN_QUAD, "74x86": PIN_QUAD,
    "28C16": PIN_28C16, "555": PIN_555,
}

def pin_to_col(col, pin, pin_count):
    side = pin_count // 2
    if pin <= side:
        return col + (pin - 1)
    return col + (pin_count - pin)

def pin_to_row(pin, pin_count):
    return 4 if pin <= pin_count // 2 else 5

def chip_pin_hole(tx, ty, col, pin, pin_count):
    return hole(tx, ty, "main", pin_to_col(col, pin, pin_count), pin_to_row(pin, pin_count))

def cp(chip_id, tx, ty, col, pin_name):
    """Lookup a chip pin's hole by chip type + pin name."""
    pc = PIN_COUNT[chip_id]
    pm = PIN_MAPS[chip_id]
    return chip_pin_hole(tx, ty, col, pm[pin_name], pc)

# ── Power connection ────────────────────────────────────────────────────────

def connect_power_pin(chip_id, tx, ty, col, pin_name, rail):
    """Wire a chip's power pin (VCC/GND) to its tile's power rail at a valid column.
    rail: 'vcc' or 'gnd'. Picks the rail on the same side (top vs bottom) as the pin.
    Returns the wire dict (component side has been resolved via pin_net).
    """
    pin_hole = cp(chip_id, tx, ty, col, pin_name)
    free = pin_net(pin_hole)
    _, _, _, pin_col, pin_row = parse_hole(pin_hole)
    # Side: top (pin row 4) uses power rows 0/1; bottom (row 5) uses 2/3.
    if pin_row == 4:
        rail_row = 1 if rail == "vcc" else 0
    else:
        rail_row = 3 if rail == "vcc" else 2
    pcol = alloc_power_col(tx, ty, rail_row, pin_col)
    target = hole(tx, ty, "power", pcol, rail_row)
    color = "#e74c3c" if rail == "vcc" else "#34495e"
    return wire(free, target, color=color)

def power_chip(chip_id, tx, ty, col):
    """Wire both VCC and GND for a chip."""
    return [
        connect_power_pin(chip_id, tx, ty, col, "VCC", "vcc"),
        connect_power_pin(chip_id, tx, ty, col, "GND", "gnd"),
    ]

def tie_pin_to_power(chip_id, tx, ty, col, pin_name, rail):
    """Tie a non-power pin (e.g. an unused enable) to VCC or GND."""
    return connect_power_pin(chip_id, tx, ty, col, pin_name, rail)

# ── Per-module LED indicator boards ─────────────────────────────────────────
# Ben Eater puts each module's status LEDs on a board sitting right next to that
# module. We mirror that: every module that exposes a value gets its OWN
# indicator board (the breadboard immediately to its right). Each LED uses the
# channel-bridge pattern on a fresh, otherwise-empty tile, so placements can
# never collide with the module's own wiring:
#   wire:     source pin free hole (module tile) -> (LED tile, main, lc, 3)
#   resistor: (LED tile, main, lc, 4) -> (lc, 5)      [top half -> bottom half]
#   LED:      (LED tile, main, lc, 6) -> GND rail
# build() sets _CURRENT_LED_TILE before each module builder runs, so a module's
# request_led() calls automatically land on that module's own indicator board.

_CURRENT_LED_TILE = [None]   # (tx, ty) of the active module's LED board, or None
_LED_REQUESTS = []           # list of (tx, ty, label, color, source_pin_hole)

def request_led(label: str, source_pin_hole: str, color: str = "red"):
    """Queue an LED on the CURRENT module's indicator board."""
    tile = _CURRENT_LED_TILE[0]
    if tile is None:
        raise RuntimeError(
            f"request_led({label!r}) called but this module has no LED board — "
            "give it an led_tile in MODULE_LAYOUT")
    _LED_REQUESTS.append((tile[0], tile[1], label, color, source_pin_hole))

def build_led_panel():
    """Place each module's queued LEDs on its own indicator board, packed
    left-to-right with a 1-hole gap between bank columns. Each LED:
    wire to (lc,3), resistor (lc,4)->(lc,5), LED (lc,6)->GND rail."""
    components, wires_ = [], []
    by_tile = defaultdict(list)
    for (tx, ty, label, color, src) in _LED_REQUESTS:
        by_tile[(tx, ty)].append((label, color, src))
    for (tx0, ty0), reqs in by_tile.items():
        lc = 2
        for (label, color, src_pin) in reqs:
            if lc >= TILE_COLS - 1:
                raise RuntimeError(f"LED board ({tx0},{ty0}) overflowed at {label!r}")
            src_free = pin_net(src_pin)
            bank_top         = hole(tx0, ty0, "main", lc, 3)
            bank_r_top       = hole(tx0, ty0, "main", lc, 4)
            bank_r_bot       = hole(tx0, ty0, "main", lc, 5)
            bank_led_anode   = hole(tx0, ty0, "main", lc, 6)
            gnd_col          = alloc_power_col(tx0, ty0, 2, lc)
            bank_led_cathode = hole(tx0, ty0, "power", gnd_col, 2)
            wires_.append(wire(src_free, bank_top, color=color))
            components.append(resistor(bank_r_top, bank_r_bot, ohms=470))
            components.append(led(bank_led_anode, bank_led_cathode, color=color))
            lc += 2   # 1-hole gap between LED bank columns
    return components, wires_

# ── Bus and control signal registries ──────────────────────────────────────
# Taps and sources are stored as raw chip-pin holes (not pre-allocated free
# holes). The rail builders allocate one fresh free hole per wire endpoint at
# chain time, so an interior node gets two distinct free holes (one for the
# incoming wire, one for the outgoing) — avoiding wire-on-wire collisions.

_BUS_TAPS    = {b: [] for b in range(8)}   # bus bit -> list of pin holes
_CTRL_TAPS   = defaultdict(list)            # signal -> list of pin holes
_CTRL_SOURCE = {}                           # signal -> source pin hole

def bus_tap_pin(chip_id, tx, ty, col, pin_name, bit):
    _BUS_TAPS[bit].append(cp(chip_id, tx, ty, col, pin_name))

def ctrl_tap_pin(chip_id, tx, ty, col, pin_name, signal):
    _CTRL_TAPS[signal].append(cp(chip_id, tx, ty, col, pin_name))

def ctrl_source_pin(chip_id, tx, ty, col, pin_name, signal):
    if signal in _CTRL_SOURCE:
        raise RuntimeError(f"control signal {signal} sourced twice")
    _CTRL_SOURCE[signal] = cp(chip_id, tx, ty, col, pin_name)

# ── Microcode generator (control ROM contents) ─────────────────────────────

HLT = 1 << 15
MI  = 1 << 14
RI  = 1 << 13
RO  = 1 << 12
IO  = 1 << 11
II  = 1 << 10
AI  = 1 <<  9
AO  = 1 <<  8
EO  = 1 <<  7
SU  = 1 <<  6
BI  = 1 <<  5
OI  = 1 <<  4
CE  = 1 <<  3
CO  = 1 <<  2
J   = 1 <<  1
FI  = 1 <<  0

OP_NOP, OP_LDA, OP_ADD, OP_SUB = 0x0, 0x1, 0x2, 0x3
OP_STA, OP_LDI, OP_JMP, OP_JC, OP_JZ = 0x4, 0x5, 0x6, 0x7, 0x8
OP_OUT, OP_HLT = 0xE, 0xF

FETCH_T0 = MI | CO
FETCH_T1 = RO | II | CE

UCODE = {
    OP_NOP: [0, 0, 0],
    OP_LDA: [IO | MI, RO | AI, 0],
    OP_ADD: [IO | MI, RO | BI, EO | AI | FI],
    OP_SUB: [IO | MI, RO | BI, EO | SU | AI | FI],
    OP_STA: [IO | MI, AO | RI, 0],
    OP_LDI: [IO | AI, 0, 0],
    OP_JMP: [IO | J,  0, 0],
    OP_JC:  [0, 0, 0],
    OP_JZ:  [0, 0, 0],
    OP_OUT: [AO | OI, 0, 0],
    OP_HLT: [HLT, 0, 0],
}
UCODE_TAKEN = {OP_JC: [IO | J, 0, 0], OP_JZ: [IO | J, 0, 0]}

def build_control_rom(half):
    rom = [0] * 2048
    for cf in (0, 1):
        for zf in (0, 1):
            for op in range(16):
                steps = [FETCH_T0, FETCH_T1] + UCODE.get(op, [0, 0, 0])
                if op == OP_JC and cf == 1:
                    steps = [FETCH_T0, FETCH_T1] + UCODE_TAKEN[OP_JC]
                if op == OP_JZ and zf == 1:
                    steps = [FETCH_T0, FETCH_T1] + UCODE_TAKEN[OP_JZ]
                steps += [0, 0, 0]
                for step in range(8):
                    addr = step | (op << 3) | (zf << 7) | (cf << 8)
                    word = steps[step]
                    byte = (word >> (8 * half)) & 0xFF
                    rom[addr] = byte
    return rom

# ── 7-seg decoder ROM ──────────────────────────────────────────────────────

SEG_PATTERNS = {
    "0": 0b0111111, "1": 0b0000110, "2": 0b1011011, "3": 0b1001111,
    "4": 0b1100110, "5": 0b1101101, "6": 0b1111101, "7": 0b0000111,
    "8": 0b1111111, "9": 0b1101111, "-": 0b1000000, " ": 0b0000000,
}

def build_display_rom():
    rom = [0] * 2048
    for mode in (0, 1):
        for value in range(256):
            if mode == 0:
                s = f"{value:3d}"
                sign = " "
            else:
                signed = value if value < 128 else value - 256
                s = f"{abs(signed):3d}"
                sign = "-" if signed < 0 else " "
            digits = {0: s[2], 1: s[1], 2: s[0], 3: sign}
            for digit in range(4):
                addr = value | (digit << 8) | (mode << 10)
                rom[addr] = SEG_PATTERNS.get(digits[digit], 0)
    return rom

def rom_bytes_to_words(rom_bytes):
    return [[(b >> i) & 1 for i in range(8)] for b in rom_bytes]

# ── Demo program ────────────────────────────────────────────────────────────

def demo_ram_words():
    program = [
        0x51,  # LDI 1
        0x4E,  # STA 14
        0x1F,  # LDA 15
        0x2E,  # ADD 14
        0xE0,  # OUT
        0x4F,  # STA 15
        0x62,  # JMP 2
        0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]
    program = (program + [0]*16)[:16]
    low  = [[(b >> i) & 1 for i in range(4)] for b in program]
    high = [[(b >> (i+4)) & 1 for i in range(4)] for b in program]
    return low + high

# ── Chip layout helper ──────────────────────────────────────────────────────
# Lay out a row of chips on a tile starting at start_col with 1-hole gaps.
# Returns the per-chip column dict and the final column reached.

def lay_chips(tx, ty, start_col, chip_ids):
    """Place chips starting at start_col with 1-hole gap between each.
    Returns (cols, components, end_col) where cols[i] = column of chip i.
    """
    cols = []
    comps = []
    c = start_col
    for cid in chip_ids:
        cols.append(c)
        comps.append(chip(cid, tx, ty, c))
        c += PIN_COUNT[cid] // 2 + 1   # width + 1-hole gap
    return cols, comps, c - 1   # last gap not strictly needed at end

# ── Module builders ─────────────────────────────────────────────────────────

def m_clock(tx, ty):
    """Clock module: built-in clock component drives CLK net. 555 + 74x08 + 74x04
    placed at 1-hole gap (visual fidelity to Ben Eater's halt-gated clock)."""
    comps, wires_ = [], []
    # Place chips packed tight
    cols, c_comps, _ = lay_chips(tx, ty, 2, ["555", "74x08", "74x04"])
    comps += c_comps
    c_555, c_08, c_04 = cols
    wires_ += power_chip("555", tx, ty, c_555)
    wires_ += power_chip("74x08", tx, ty, c_08)
    wires_ += power_chip("74x04", tx, ty, c_04)
    # Built-in clock at a free column to the right of the chips
    clk_col = cols[-1] + PIN_COUNT["74x04"] // 2 + 3
    comps.append(clock_component(tx, ty, clk_col, 4, freq_hz=1.0))
    _CTRL_SOURCE["CLK"] = hole(tx, ty, "main", clk_col, 4) if "CLK" not in _CTRL_SOURCE else _CTRL_SOURCE["CLK"]
    # Note: the clock-component pin IS its own hole (no wire-attach needed for
    # standalone source).  We treat the clock's output hole as the CLK source.
    return comps, wires_

def m_reset(tx, ty):
    """Reset module: push button from RST line to GND."""
    comps, wires_ = [], []
    # Button at row 4 (vertical) somewhere in the tile
    btn_col = 2
    # Push button is a wire-like 2-pin component
    # One terminal in a free main column area, other to GND rail
    btn_a = hole(tx, ty, "main", btn_col, 3)
    btn_b = hole(tx, ty, "power", alloc_power_col(tx, ty, 0, btn_col), 0)
    comps.append(push_button(btn_a, btn_b))
    # RST signal source: the main side of the button
    _CTRL_SOURCE["RST"] = btn_a
    return comps, wires_

def _byte_register(tx, ty, start_col, load_signal, with_buffer=False, ao_signal=None,
                   led_color="red", led_label="REG"):
    """Build an 8-bit register: 2x 74x173 + optional 74x245 buffer.
    Returns (components, wires, q_holes, d_holes, end_col)."""
    comps, wires_ = [], []
    chip_list = ["74x173", "74x173"]
    if with_buffer:
        chip_list.append("74x245")
    cols, c_comps, end_col = lay_chips(tx, ty, start_col, chip_list)
    comps += c_comps
    c_lo, c_hi = cols[0], cols[1]
    for cid, c in zip(chip_list, cols):
        wires_ += power_chip(cid, tx, ty, c)

    # Q outputs (bits 0..3 from low, 4..7 from high) — DO NOT allocate pin_net here,
    # callers and LED requests will allocate as needed
    q_pins = []
    for name in ["1Q", "2Q", "3Q", "4Q"]:
        q_pins.append(cp("74x173", tx, ty, c_lo, name))
    for name in ["1Q", "2Q", "3Q", "4Q"]:
        q_pins.append(cp("74x173", tx, ty, c_hi, name))
    d_pins = []
    for name in ["1D", "2D", "3D", "4D"]:
        d_pins.append(cp("74x173", tx, ty, c_lo, name))
    for name in ["1D", "2D", "3D", "4D"]:
        d_pins.append(cp("74x173", tx, ty, c_hi, name))

    # Shared CLK between halves (chain wire)
    clk_lo_free = pin_net(cp("74x173", tx, ty, c_lo, "CLK"))
    clk_hi_free = pin_net(cp("74x173", tx, ty, c_hi, "CLK"))
    wires_.append(wire(clk_lo_free, clk_hi_free, color="#f39c12"))
    # Register one CLK tap (one chain endpoint participates in the global CLK chain)
    _CTRL_TAPS["CLK"].append(cp("74x173", tx, ty, c_lo, "CLK"))

    # IE1 (load enable, active LOW) shared between halves; tap to load_signal
    ie1_lo_free = pin_net(cp("74x173", tx, ty, c_lo, "IE1"))
    ie1_hi_free = pin_net(cp("74x173", tx, ty, c_hi, "IE1"))
    wires_.append(wire(ie1_lo_free, ie1_hi_free, color="#9b59b6"))
    _CTRL_TAPS[load_signal].append(cp("74x173", tx, ty, c_lo, "IE1"))

    # IE2 tied LOW on both halves
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_lo, "IE2", "gnd"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_hi, "IE2", "gnd"))

    # CLR shared, tied to RST (active LOW: reset clears)
    clr_lo_free = pin_net(cp("74x173", tx, ty, c_lo, "CLR"))
    clr_hi_free = pin_net(cp("74x173", tx, ty, c_hi, "CLR"))
    wires_.append(wire(clr_lo_free, clr_hi_free, color="#e67e22"))
    _CTRL_TAPS["RST"].append(cp("74x173", tx, ty, c_lo, "CLR"))

    # OE1, OE2 handling
    if not with_buffer:
        # No tri-state buffer needed — tie all OEs to GND (Q outputs always drive)
        for cc in (c_lo, c_hi):
            wires_.append(tie_pin_to_power("74x173", tx, ty, cc, "OE1", "gnd"))
            wires_.append(tie_pin_to_power("74x173", tx, ty, cc, "OE2", "gnd"))
    else:
        # Buffer-gated output (Q always-drive into buffer A side)
        for cc in (c_lo, c_hi):
            wires_.append(tie_pin_to_power("74x173", tx, ty, cc, "OE1", "gnd"))
            wires_.append(tie_pin_to_power("74x173", tx, ty, cc, "OE2", "gnd"))
        # 74x245 buffer
        c_buf = cols[2]
        # DIR tied HIGH (A->B)
        wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, "DIR", "vcc"))
        # OE = AO_BAR signal
        if ao_signal:
            _CTRL_TAPS[ao_signal].append(cp("74x245", tx, ty, c_buf, "OE"))
        # Q -> A; B -> bus
        for i in range(8):
            a_pin = cp("74x245", tx, ty, c_buf, f"A{i+1}")
            b_pin = cp("74x245", tx, ty, c_buf, f"B{i+1}")
            # Wire Q free -> A free
            q_free = pin_net(q_pins[i])
            a_free = pin_net(a_pin)
            wires_.append(wire(q_free, a_free, color="#3498db"))
            # B taps the bus
            _BUS_TAPS[i].append(b_pin)

    # D inputs tap the bus (so when load signal is asserted, register latches bus)
    for i, d_pin in enumerate(d_pins):
        _BUS_TAPS[i].append(d_pin)

    # LED requests on Q outputs (consume one free hole each; the LED panel will
    # allocate during build_led_panel)
    for i in range(8):
        request_led(f"{led_label}{i}", q_pins[i], color=led_color)

    return comps, wires_, q_pins, d_pins, end_col

def m_a_register(tx, ty):
    """A register with bus buffer (AI load, AO out)."""
    comps, wires_, _, _, _ = _byte_register(tx, ty, 2, "AI", with_buffer=True,
                                            ao_signal="AO", led_color="red",
                                            led_label="A")
    return comps, wires_

def m_b_register(tx, ty):
    """B register: load only (BI), no bus output."""
    comps, wires_, _, _, _ = _byte_register(tx, ty, 2, "BI", with_buffer=False,
                                            led_color="red", led_label="B")
    return comps, wires_

def m_mar(tx, ty):
    """MAR: 1x 74x173 (4 bits used) + 4 DIP switches for manual address."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty, 2, ["74x173"])
    comps += c_comps
    c_mar = cols[0]
    wires_ += power_chip("74x173", tx, ty, c_mar)

    # CLK chain participant
    _CTRL_TAPS["CLK"].append(cp("74x173", tx, ty, c_mar, "CLK"))
    # CLR -> RST
    _CTRL_TAPS["RST"].append(cp("74x173", tx, ty, c_mar, "CLR"))
    # IE1 = MI, IE2 = GND
    _CTRL_TAPS["MI"].append(cp("74x173", tx, ty, c_mar, "IE1"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_mar, "IE2", "gnd"))
    # OE1, OE2 = GND (always drive Q out to RAM addr lines)
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_mar, "OE1", "gnd"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_mar, "OE2", "gnd"))

    # D inputs tap bus (low 4 bits)
    for i, n in enumerate(["1D", "2D", "3D", "4D"]):
        _BUS_TAPS[i].append(cp("74x173", tx, ty, c_mar, n))

    # Q outputs registered as named ctrl sources (consumed by RAM module)
    for i, n in enumerate(["1Q", "2Q", "3Q", "4Q"]):
        ctrl_source_pin("74x173", tx, ty, c_mar, n, f"MAR_Q{i}")
        request_led(f"MAR{i}", cp("74x173", tx, ty, c_mar, n), color="amber")

    # 4-bit DIP switch (manual address) — placed at a free column with 1-hole gap
    sw_col = c_mar + PIN_COUNT["74x173"] // 2 + 2   # gap of 2 to keep clear
    comps.append(dip_switch(tx, ty, sw_col, count=4))

    return comps, wires_

def m_ir(tx, ty):
    """IR: 2x 74x173 + 1x 74x245 (low-nibble buffer). Top nibble feeds control."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty, 2, ["74x173", "74x173", "74x245"])
    comps += c_comps
    c_lo, c_hi, c_buf = cols
    wires_ += power_chip("74x173", tx, ty, c_lo)
    wires_ += power_chip("74x173", tx, ty, c_hi)
    wires_ += power_chip("74x245", tx, ty, c_buf)

    # CLK chain
    clk_lo = pin_net(cp("74x173", tx, ty, c_lo, "CLK"))
    clk_hi = pin_net(cp("74x173", tx, ty, c_hi, "CLK"))
    wires_.append(wire(clk_lo, clk_hi, color="#f39c12"))
    _CTRL_TAPS["CLK"].append(cp("74x173", tx, ty, c_lo, "CLK"))

    # IE1 = II (active LOW), IE2 = GND
    ie1_lo = pin_net(cp("74x173", tx, ty, c_lo, "IE1"))
    ie1_hi = pin_net(cp("74x173", tx, ty, c_hi, "IE1"))
    wires_.append(wire(ie1_lo, ie1_hi, color="#9b59b6"))
    _CTRL_TAPS["II"].append(cp("74x173", tx, ty, c_lo, "IE1"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_lo, "IE2", "gnd"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_hi, "IE2", "gnd"))

    # OE1, OE2 = GND — both halves drive Q always
    for cc in (c_lo, c_hi):
        wires_.append(tie_pin_to_power("74x173", tx, ty, cc, "OE1", "gnd"))
        wires_.append(tie_pin_to_power("74x173", tx, ty, cc, "OE2", "gnd"))

    # CLR -> RST
    clr_lo = pin_net(cp("74x173", tx, ty, c_lo, "CLR"))
    clr_hi = pin_net(cp("74x173", tx, ty, c_hi, "CLR"))
    wires_.append(wire(clr_lo, clr_hi, color="#e67e22"))
    _CTRL_TAPS["RST"].append(cp("74x173", tx, ty, c_lo, "CLR"))

    # D inputs from bus
    for i, n in enumerate(["1D", "2D", "3D", "4D"]):
        _BUS_TAPS[i].append(cp("74x173", tx, ty, c_lo, n))
    for i, n in enumerate(["1D", "2D", "3D", "4D"]):
        _BUS_TAPS[i + 4].append(cp("74x173", tx, ty, c_hi, n))

    # Top nibble Q outputs feed control logic (IR_OP0..3)
    for i, n in enumerate(["1Q", "2Q", "3Q", "4Q"]):
        ctrl_source_pin("74x173", tx, ty, c_hi, n, f"IR_OP{i}")
        request_led(f"IR{i+4}", cp("74x173", tx, ty, c_hi, n), color="red")

    # Low nibble Q outputs -> buffer A side -> bus on IO=0
    wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, "DIR", "vcc"))
    _CTRL_TAPS["IO"].append(cp("74x245", tx, ty, c_buf, "OE"))
    for i, n in enumerate(["1Q", "2Q", "3Q", "4Q"]):
        q = cp("74x173", tx, ty, c_lo, n)
        a = cp("74x245", tx, ty, c_buf, f"A{i+1}")
        wires_.append(wire(pin_net(q), pin_net(a), color="#3498db"))
        b = cp("74x245", tx, ty, c_buf, f"B{i+1}")
        _BUS_TAPS[i].append(b)
        request_led(f"IR{i}", cp("74x173", tx, ty, c_lo, n), color="red")
    # A5..A8 unused, tie LOW
    for k in range(5, 9):
        wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, f"A{k}", "gnd"))
    return comps, wires_

def m_pc(tx, ty):
    """PC: 74x161 + 74x245."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty, 2, ["74x161", "74x245"])
    comps += c_comps
    c_ctr, c_buf = cols
    wires_ += power_chip("74x161", tx, ty, c_ctr)
    wires_ += power_chip("74x245", tx, ty, c_buf)

    _CTRL_TAPS["CLK"].append(cp("74x161", tx, ty, c_ctr, "CLK"))
    _CTRL_TAPS["RST"].append(cp("74x161", tx, ty, c_ctr, "CLR"))
    wires_.append(tie_pin_to_power("74x161", tx, ty, c_ctr, "ENT", "vcc"))
    _CTRL_TAPS["CE"].append(cp("74x161", tx, ty, c_ctr, "ENP"))
    _CTRL_TAPS["J"].append(cp("74x161", tx, ty, c_ctr, "LOAD"))

    # Parallel-load inputs A..D from low 4 bits of bus
    for i, n in enumerate(["A", "B", "C", "D"]):
        _BUS_TAPS[i].append(cp("74x161", tx, ty, c_ctr, n))

    # Q outputs -> A side of buffer; B -> bus (bottom 4 only)
    wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, "DIR", "vcc"))
    _CTRL_TAPS["CO_BAR"].append(cp("74x245", tx, ty, c_buf, "OE"))
    for i, n in enumerate(["QA", "QB", "QC", "QD"]):
        q = cp("74x161", tx, ty, c_ctr, n)
        a = cp("74x245", tx, ty, c_buf, f"A{i+1}")
        wires_.append(wire(pin_net(q), pin_net(a), color="#27ae60"))
        _BUS_TAPS[i].append(cp("74x245", tx, ty, c_buf, f"B{i+1}"))
        request_led(f"PC{i}", cp("74x161", tx, ty, c_ctr, n), color="green")
    # A5..A8 unused -> GND
    for k in range(5, 9):
        wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, f"A{k}", "gnd"))
    return comps, wires_

def m_flags(tx, ty):
    """Flags register: 74x173 (2 bits: carry, zero)."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty, 2, ["74x173"])
    comps += c_comps
    c_fl = cols[0]
    wires_ += power_chip("74x173", tx, ty, c_fl)
    _CTRL_TAPS["CLK"].append(cp("74x173", tx, ty, c_fl, "CLK"))
    _CTRL_TAPS["RST"].append(cp("74x173", tx, ty, c_fl, "CLR"))
    _CTRL_TAPS["FI"].append(cp("74x173", tx, ty, c_fl, "IE1"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_fl, "IE2", "gnd"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_fl, "OE1", "gnd"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_fl, "OE2", "gnd"))

    # D1 = CF, D2 = ZF, D3/D4 = GND
    _CTRL_TAPS["CF"].append(cp("74x173", tx, ty, c_fl, "1D"))
    _CTRL_TAPS["ZF"].append(cp("74x173", tx, ty, c_fl, "2D"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_fl, "3D", "gnd"))
    wires_.append(tie_pin_to_power("74x173", tx, ty, c_fl, "4D", "gnd"))

    # Q1, Q2 -> CF_LATCHED, ZF_LATCHED (consumed by control logic)
    ctrl_source_pin("74x173", tx, ty, c_fl, "1Q", "CF_LATCHED")
    ctrl_source_pin("74x173", tx, ty, c_fl, "2Q", "ZF_LATCHED")
    request_led("FCF", cp("74x173", tx, ty, c_fl, "1Q"), color="yellow")
    request_led("FZF", cp("74x173", tx, ty, c_fl, "2Q"), color="yellow")
    return comps, wires_

def m_alu(tx, ty):
    """ALU: 2x 74x283 + 2x 74x86 + 1x 74x245 + 1x 74x32 (zero detect)."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty,
                                  2, ["74x283", "74x283", "74x86", "74x86", "74x245", "74x32"])
    comps += c_comps
    c_lo, c_hi, c_x1, c_x2, c_buf, c_zd = cols
    wires_ += power_chip("74x283", tx, ty, c_lo)
    wires_ += power_chip("74x283", tx, ty, c_hi)
    wires_ += power_chip("74x86", tx, ty, c_x1)
    wires_ += power_chip("74x86", tx, ty, c_x2)
    wires_ += power_chip("74x245", tx, ty, c_buf)
    wires_ += power_chip("74x32", tx, ty, c_zd)

    wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, "DIR", "vcc"))
    _CTRL_TAPS["EO_BAR"].append(cp("74x245", tx, ty, c_buf, "OE"))

    # SU drives the XOR B-input on each of 8 bits AND adder C0
    _CTRL_TAPS["SU"].append(cp("74x283", tx, ty, c_lo, "C0"))
    # Sum outputs -> buffer A side; buffer B side -> bus
    for i, n in enumerate(["S1", "S2", "S3", "S4"]):
        s = cp("74x283", tx, ty, c_lo, n)
        a = cp("74x245", tx, ty, c_buf, f"A{i+1}")
        wires_.append(wire(pin_net(s), pin_net(a), color="#f1c40f"))
        _BUS_TAPS[i].append(cp("74x245", tx, ty, c_buf, f"B{i+1}"))
    for i, n in enumerate(["S1", "S2", "S3", "S4"]):
        s = cp("74x283", tx, ty, c_hi, n)
        a = cp("74x245", tx, ty, c_buf, f"A{i+5}")
        wires_.append(wire(pin_net(s), pin_net(a), color="#f1c40f"))
        _BUS_TAPS[i + 4].append(cp("74x245", tx, ty, c_buf, f"B{i+5}"))

    # Carry chain: S5 of low -> C0 of high
    wires_.append(wire(pin_net(cp("74x283", tx, ty, c_lo, "S5")),
                       pin_net(cp("74x283", tx, ty, c_hi, "C0")),
                       color="#f1c40f"))
    # CF = top S5
    ctrl_source_pin("74x283", tx, ty, c_hi, "S5", "CF")

    # ALU LED indicators on buffer B-side (the output to bus) — request via Q
    for i in range(8):
        # Use the A-side pin (driver side) since B is shared with bus daisy chain
        a_pin = cp("74x245", tx, ty, c_buf, f"A{i+1}") if i < 4 else cp("74x245", tx, ty, c_buf, f"A{i+1}")
        request_led(f"ALU{i}", a_pin, color="yellow")
    return comps, wires_

def m_ram(tx, ty):
    """RAM: 2x 74x189 + 1x 74x157 + 1x 74x245 + 1x 74x00 + DIP switches + write button."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty,
                                  2, ["74x189", "74x189", "74x157", "74x00", "74x245"])
    comps += c_comps
    c_rl, c_rh, c_mux, c_we, c_buf = cols
    wires_ += power_chip("74x189", tx, ty, c_rl, )
    wires_ += power_chip("74x189", tx, ty, c_rh)
    wires_ += power_chip("74x157", tx, ty, c_mux)
    wires_ += power_chip("74x00", tx, ty, c_we)
    wires_ += power_chip("74x245", tx, ty, c_buf)

    # Add the ram_state to the 189 chips
    # We need to re-emit them with ram_state. Since chip() above already placed
    # them without state, replace them by overriding ramState on the dict:
    demo = demo_ram_words()
    c_comps[0]["ramState"] = {"words": demo[:16]}
    c_comps[1]["ramState"] = {"words": demo[16:32]}

    # Buffer: DIR HIGH, OE = RO
    wires_.append(tie_pin_to_power("74x245", tx, ty, c_buf, "DIR", "vcc"))
    _CTRL_TAPS["RO"].append(cp("74x245", tx, ty, c_buf, "OE"))

    # CS tied LOW on both RAMs (always selected; bus gated by buffer)
    for cc in (c_rl, c_rh):
        wires_.append(tie_pin_to_power("74x189", tx, ty, cc, "CS", "gnd"))

    # WE on both -> RI signal (tap)
    we_lo = pin_net(cp("74x189", tx, ty, c_rl, "WE"))
    we_hi = pin_net(cp("74x189", tx, ty, c_rh, "WE"))
    wires_.append(wire(we_lo, we_hi, color="#e74c3c"))
    _CTRL_TAPS["RI"].append(cp("74x189", tx, ty, c_rl, "WE"))

    # D inputs from bus
    for i, n in enumerate(["D1", "D2", "D3", "D4"]):
        _BUS_TAPS[i].append(cp("74x189", tx, ty, c_rl, n))
    for i, n in enumerate(["D1", "D2", "D3", "D4"]):
        _BUS_TAPS[i + 4].append(cp("74x189", tx, ty, c_rh, n))

    # Q outputs -> buffer A side -> bus B side. Note 74x189 outputs are INVERTED.
    for i, n in enumerate(["Q1", "Q2", "Q3", "Q4"]):
        q = cp("74x189", tx, ty, c_rl, n)
        a = cp("74x245", tx, ty, c_buf, f"A{i+1}")
        wires_.append(wire(pin_net(q), pin_net(a), color="#1abc9c"))
        _BUS_TAPS[i].append(cp("74x245", tx, ty, c_buf, f"B{i+1}"))
    for i, n in enumerate(["Q1", "Q2", "Q3", "Q4"]):
        q = cp("74x189", tx, ty, c_rh, n)
        a = cp("74x245", tx, ty, c_buf, f"A{i+5}")
        wires_.append(wire(pin_net(q), pin_net(a), color="#1abc9c"))
        _BUS_TAPS[i + 4].append(cp("74x245", tx, ty, c_buf, f"B{i+5}"))

    # Address mux 74x157 — S tied LOW for now (always use MAR side, manual disabled)
    wires_.append(tie_pin_to_power("74x157", tx, ty, c_mux, "S", "gnd"))
    wires_.append(tie_pin_to_power("74x157", tx, ty, c_mux, "En", "gnd"))
    # 1A..4A inputs from MAR_Q0..3 (consumed via ctrl tap pattern)
    for i, (a_in, y_out) in enumerate([("1A", "1Y"), ("2A", "2Y"), ("3A", "3Y"), ("4A", "4Y")]):
        _CTRL_TAPS[f"MAR_Q{i}"].append(cp("74x157", tx, ty, c_mux, a_in))
        # Y -> both RAMs A0..A3 (chain)
        y_free = pin_net(cp("74x157", tx, ty, c_mux, y_out))
        addr_pin_name = f"A{i}"
        a_lo_free = pin_net(cp("74x189", tx, ty, c_rl, addr_pin_name))
        a_hi_free = pin_net(cp("74x189", tx, ty, c_rh, addr_pin_name))
        wires_.append(wire(y_free, a_lo_free, color="#16a085"))
        # Need another free hole on the low RAM addr pin to chain to high RAM
        a_lo_free2 = pin_net(cp("74x189", tx, ty, c_rl, addr_pin_name))
        wires_.append(wire(a_lo_free2, a_hi_free, color="#16a085"))
    # 1B..4B (manual switch side) tied LOW
    for n in ["1B", "2B", "3B", "4B"]:
        wires_.append(tie_pin_to_power("74x157", tx, ty, c_mux, n, "gnd"))

    # Write logic 74x00: leave inputs floating tied LOW (write-disable for now)
    for n in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
        wires_.append(tie_pin_to_power("74x00", tx, ty, c_we, n, "gnd"))

    # DIP switches (8 data + 4 addr) packed after chips with 1-hole gap
    sw_col = cols[-1] + PIN_COUNT["74x245"] // 2 + 2
    comps.append(dip_switch(tx, ty, sw_col, count=8))
    sw_col2 = sw_col + 9
    if sw_col2 + 4 <= TILE_COLS:
        comps.append(dip_switch(tx, ty, sw_col2, count=4))

    # Write button — put at very far end if room
    btn_col = sw_col2 + 5
    if btn_col + 2 < TILE_COLS:
        pcol = alloc_power_col(tx, ty, 0, btn_col)
        comps.append(push_button(hole(tx, ty, "main", btn_col, 3),
                                  hole(tx, ty, "power", pcol, 0)))
    return comps, wires_

def m_output_reg(tx, ty):
    """Output: 74x377 + 28C16 (display ROM) + 74x107 + 74x139 + 4x 7-seg."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty,
                                  2, ["74x377", "28C16", "74x107", "74x139"])
    comps += c_comps
    c_lat, c_rom, c_div, c_dec = cols

    # Preload display ROM
    c_comps[1]["ramState"] = {"words": rom_bytes_to_words(build_display_rom())}

    wires_ += power_chip("74x377", tx, ty, c_lat)
    wires_ += power_chip("28C16", tx, ty, c_rom)
    wires_ += power_chip("74x107", tx, ty, c_div)
    wires_ += power_chip("74x139", tx, ty, c_dec)

    # Latch: CLK, En=OI, D from bus
    _CTRL_TAPS["CLK"].append(cp("74x377", tx, ty, c_lat, "CLK"))
    _CTRL_TAPS["OI"].append(cp("74x377", tx, ty, c_lat, "En"))
    for i in range(8):
        _BUS_TAPS[i].append(cp("74x377", tx, ty, c_lat, f"D{i+1}"))

    # ROM control pins
    wires_.append(tie_pin_to_power("28C16", tx, ty, c_rom, "CE", "gnd"))
    wires_.append(tie_pin_to_power("28C16", tx, ty, c_rom, "OE", "gnd"))
    wires_.append(tie_pin_to_power("28C16", tx, ty, c_rom, "WE", "vcc"))
    wires_.append(tie_pin_to_power("28C16", tx, ty, c_rom, "A10", "gnd"))
    # A0..A7 from latch Q1..Q8 (the byte to display)
    for i in range(8):
        q = cp("74x377", tx, ty, c_lat, f"Q{i+1}")
        a = cp("28C16", tx, ty, c_rom, f"A{i}")
        wires_.append(wire(pin_net(q), pin_net(a), color="#16a085"))
    # A8, A9 tied to GND for now (only one digit shown statically)
    wires_.append(tie_pin_to_power("28C16", tx, ty, c_rom, "A8", "gnd"))
    wires_.append(tie_pin_to_power("28C16", tx, ty, c_rom, "A9", "gnd"))

    # 74x107 and 74x139 placeholder — tie unused inputs LOW
    for n in ["1J", "1K", "2J", "2K", "1CLR", "2CLR"]:
        wires_.append(tie_pin_to_power("74x107", tx, ty, c_div, n, "vcc"))
    wires_.append(tie_pin_to_power("74x107", tx, ty, c_div, "1CLK", "gnd"))
    wires_.append(tie_pin_to_power("74x107", tx, ty, c_div, "2CLK", "gnd"))
    for n in ["1A", "1B", "2A", "2B"]:
        wires_.append(tie_pin_to_power("74x139", tx, ty, c_dec, n, "gnd"))
    wires_.append(tie_pin_to_power("74x139", tx, ty, c_dec, "1G", "gnd"))
    wires_.append(tie_pin_to_power("74x139", tx, ty, c_dec, "2G", "gnd"))

    # 4x 7-seg displays packed after chips
    seg_col = cols[-1] + PIN_COUNT["74x139"] // 2 + 2
    for i in range(4):
        if seg_col + 5 > TILE_COLS:
            break
        comps.append(seven_seg(tx, ty, seg_col))
        seg_col += 6
    return comps, wires_

def m_control(tx, ty):
    """Control logic: 74x161 step ctr + 74x138 step decoder + 2x 28C16 + 74x04."""
    comps, wires_ = [], []
    cols, c_comps, _ = lay_chips(tx, ty,
                                  2, ["74x161", "74x138", "28C16", "28C16", "74x04"])
    comps += c_comps
    c_sc, c_sd, c_lsb, c_msb, c_inv = cols

    # Preload control ROMs
    c_comps[2]["ramState"] = {"words": rom_bytes_to_words(build_control_rom(0))}
    c_comps[3]["ramState"] = {"words": rom_bytes_to_words(build_control_rom(1))}

    wires_ += power_chip("74x161", tx, ty, c_sc)
    wires_ += power_chip("74x138", tx, ty, c_sd)
    wires_ += power_chip("28C16", tx, ty, c_lsb)
    wires_ += power_chip("28C16", tx, ty, c_msb)
    wires_ += power_chip("74x04", tx, ty, c_inv)

    # Step counter
    _CTRL_TAPS["CLK"].append(cp("74x161", tx, ty, c_sc, "CLK"))
    _CTRL_TAPS["RST"].append(cp("74x161", tx, ty, c_sc, "CLR"))
    wires_.append(tie_pin_to_power("74x161", tx, ty, c_sc, "ENT", "vcc"))
    wires_.append(tie_pin_to_power("74x161", tx, ty, c_sc, "ENP", "vcc"))
    wires_.append(tie_pin_to_power("74x161", tx, ty, c_sc, "LOAD", "vcc"))

    # Step decoder: QA->A, QB->B, QC->C; G1=VCC; G2A=G2B=GND
    for src, dst in [("QA", "A"), ("QB", "B"), ("QC", "C")]:
        s = pin_net(cp("74x161", tx, ty, c_sc, src))
        d = pin_net(cp("74x138", tx, ty, c_sd, dst))
        wires_.append(wire(s, d, color="#8e44ad"))
    wires_.append(tie_pin_to_power("74x138", tx, ty, c_sd, "G1", "vcc"))
    wires_.append(tie_pin_to_power("74x138", tx, ty, c_sd, "G2A", "gnd"))
    wires_.append(tie_pin_to_power("74x138", tx, ty, c_sd, "G2B", "gnd"))

    # ROMs: CE=OE=GND, WE=VCC
    for c in (c_lsb, c_msb):
        wires_.append(tie_pin_to_power("28C16", tx, ty, c, "CE", "gnd"))
        wires_.append(tie_pin_to_power("28C16", tx, ty, c, "OE", "gnd"))
        wires_.append(tie_pin_to_power("28C16", tx, ty, c, "WE", "vcc"))
        wires_.append(tie_pin_to_power("28C16", tx, ty, c, "A10", "gnd"))
        wires_.append(tie_pin_to_power("28C16", tx, ty, c, "A9", "gnd"))
        # A0..A2 = step counter QA..QC (chain wires; second hole on QA for chain)
        for i, src_name in enumerate(["QA", "QB", "QC"]):
            s = pin_net(cp("74x161", tx, ty, c_sc, src_name))
            d = pin_net(cp("28C16", tx, ty, c, f"A{i}"))
            wires_.append(wire(s, d, color="#8e44ad"))
        # A3..A6 = IR_OP0..3
        for i in range(4):
            _CTRL_TAPS[f"IR_OP{i}"].append(cp("28C16", tx, ty, c, f"A{3+i}"))
        # A7 = ZF_LATCHED, A8 = CF_LATCHED
        _CTRL_TAPS["ZF_LATCHED"].append(cp("28C16", tx, ty, c, "A7"))
        _CTRL_TAPS["CF_LATCHED"].append(cp("28C16", tx, ty, c, "A8"))

    # LSB outputs IO0..IO7 -> control bits 0..7
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO0", "FI")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO1", "J")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO2", "CO_BAR")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO3", "CE")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO4", "OI")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO5", "BI")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO6", "SU")
    ctrl_source_pin("28C16", tx, ty, c_lsb, "IO7", "EO_BAR")
    # MSB outputs IO0..IO7 -> bits 8..15
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO0", "AO")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO1", "AI")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO2", "II")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO3", "IO")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO4", "RO")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO5", "RI")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO6", "MI")
    ctrl_source_pin("28C16", tx, ty, c_msb, "IO7", "HLT")

    # Inverter chip — leave inputs tied LOW (placeholder); outputs unconnected
    for n in ["1A", "2A", "3A", "4A", "5A", "6A"]:
        wires_.append(tie_pin_to_power("74x04", tx, ty, c_inv, n, "gnd"))
    return comps, wires_

# ── Bus and control rails ──────────────────────────────────────────────────

BUS_COLORS = ["#3498db", "#9b59b6", "#e74c3c", "#1abc9c",
              "#f39c12", "#16a085", "#e67e22", "#27ae60"]

def _pin_key(pin_hole):
    """Position key for ordering pins across tiles and columns."""
    tx, ty, _, c, r = parse_hole(pin_hole)
    return (ty, tx * TILE_COLS + c, r)

def m_bus_rails():
    """For each bus bit, chain registered PIN holes left-to-right. Each wire
    endpoint allocates a fresh free hole on its pin column-half — interior
    pins consume 2 free holes (one for incoming, one for outgoing), so no
    wire-on-wire collisions."""
    wires_ = []
    for bit, pins in _BUS_TAPS.items():
        if len(pins) < 2:
            continue
        sorted_pins = sorted(pins, key=_pin_key)
        for i in range(len(sorted_pins) - 1):
            free_a = pin_net(sorted_pins[i])
            free_b = pin_net(sorted_pins[i + 1])
            wires_.append(wire(free_a, free_b, color=BUS_COLORS[bit]))
    return [], wires_

def m_control_rails():
    """Chain source pin -> each tap pin via fresh free holes per wire end."""
    wires_ = []
    for sig, taps in _CTRL_TAPS.items():
        src_pin = _CTRL_SOURCE.get(sig)
        if not src_pin:
            print(f"  (warn) control signal {sig!r} has no source", file=sys.stderr)
            continue
        chain = [src_pin] + sorted(taps, key=_pin_key)
        for i in range(len(chain) - 1):
            free_a = pin_net(chain[i])
            free_b = pin_net(chain[i + 1])
            wires_.append(wire(free_a, free_b, color="#bdc3c7"))
    return [], wires_

# ── Educational module documentation ────────────────────────────────────────
# Each string is shown in an on-canvas panel beside its module, written the way
# Ben Eater narrates his videos: what the module DOES, which 74-series chips do
# it, and how it talks to the rest of the machine. Rendered as innerHTML in a
# pre-wrap box, so '<b>' works and newlines are literal line breaks.

OVERVIEW_DOC = (
    "<b>BEN EATER 8-BIT CPU  (the SAP-1: \"Simple As Possible\")</b>\n"
    "Each breadboard below is ONE module, exactly like the separate boards in\n"
    "Ben Eater's video series. Read them top-to-bottom: that is the path data\n"
    "takes through the machine. The right-hand board of each row is that\n"
    "module's own LED readout.\n"
    "\n"
    "<b>THE BUS — the shared 8-bit highway</b>\n"
    "Every module hangs off ONE common set of 8 wires. The golden rule: only\n"
    "ONE module may DRIVE the bus at a time, but any number may LISTEN and latch\n"
    "from it. The Control Logic enforces this by asserting exactly one\n"
    "'…-out' (output-enable) signal per clock step.\n"
    "\n"
    "<b>HOW AN INSTRUCTION RUNS — fetch, decode, execute</b>\n"
    "Every instruction starts with the same two fetch steps:\n"
    "  T0   CO + MI : Program Counter -> bus -> Memory Address Register\n"
    "                 (point RAM at the next instruction)\n"
    "  T1   RO + II + CE : RAM -> bus -> Instruction Register; counter + 1\n"
    "                 (read the instruction, advance the counter)\n"
    "  T2+  the opcode (top nibble of the IR) plus the step number address the\n"
    "       Control ROMs, which fire the signals that carry out the instruction.\n"
    "\n"
    "<b>CONTROL SIGNAL LEGEND</b>\n"
    "  CO/CE  program counter out / count up      J   jump-load the PC\n"
    "  MI     memory-address-register in          RO/RI  RAM out / in\n"
    "  II     instruction in                      IO  instruction operand out\n"
    "  AI/AO  A register in / out                 BI  B register in\n"
    "  EO     ALU out        SU  subtract         FI  flags in\n"
    "  OI     output in      HLT halt the clock\n"
    "\n"
    "Tip: set the clock to single-step and watch one signal light up per edge."
)

CLOCK_DOC = (
    "<b>CLOCK — the heartbeat</b>\n"
    "Nothing in the CPU moves except on a clock edge, so everything stays in\n"
    "lock-step. In Ben's build a 555 timer (astable) makes the square wave, a\n"
    "74x08 AND gate + 74x04 inverter let the HALT signal freeze the clock, and a\n"
    "second 555 gives a manual single-step button.\n"
    "\n"
    "Here a built-in 1 Hz clock source drives the CLK net directly (the 555/AND/\n"
    "INV chips are placed for visual fidelity). Single-step it to walk the\n"
    "machine one micro-step at a time, or free-run it to watch a program go.\n"
    "Drives CLK -> every register, the program counter, and the step counter."
)

RESET_DOC = (
    "<b>RESET — clear the machine</b>\n"
    "Press the button to pull the RST line LOW. Every register's CLR input and\n"
    "the program counter / step counter clear to zero, so execution restarts\n"
    "from address 0. Use it to re-run the demo program from the top."
)

PC_DOC = (
    "<b>PROGRAM COUNTER — remembers which instruction is next</b>\n"
    "A 74x161 4-bit binary counter holds an address 0-15.\n"
    "  CE (count-enable): +1 each fetch, so the program runs in order.\n"
    "  J  (jump):         load a new address from the bus -> that is a JMP.\n"
    "A 74x245 tri-state buffer gates the count onto the bus only when CO is\n"
    "active, so the PC stays off the bus the rest of the time.\n"
    "Green LEDs show the current address being executed."
)

MAR_DOC = (
    "<b>MEMORY ADDRESS REGISTER — points RAM at one word</b>\n"
    "A single 74x173 latches the low 4 bits of the bus when MI is asserted.\n"
    "Those 4 outputs become RAM's address lines (via the 74x157 address mux\n"
    "inside the RAM module). The on-board DIP switches let you dial an address\n"
    "by hand for loading a program. Amber LEDs show the selected address."
)

RAM_DOC = (
    "<b>RANDOM ACCESS MEMORY (16 x 8) — where the program and data live</b>\n"
    "Two 74x189 (16 x 4 static RAM) chips give 16 bytes of memory. A 74x157 mux\n"
    "picks the address source: the running program (from the MAR) or the manual\n"
    "DIP switches for programming. NOTE the 74x189 outputs are INVERTED, so a\n"
    "74x245 buffer re-inverts and gates the byte onto the bus when RO is active.\n"
    "Writing the bus into RAM (WE) happens when RI is asserted.\n"
    "Pre-loaded with a small program that counts upward on the output display."
)

IR_DOC = (
    "<b>INSTRUCTION REGISTER — holds the instruction being executed</b>\n"
    "Two 74x173s latch a whole byte from the bus when II is asserted.\n"
    "  Top nibble  = OPCODE  -> sent straight to the Control Logic to decide\n"
    "                what this instruction should do.\n"
    "  Bottom nibble = OPERAND (an address or small value); a 74x245 puts it\n"
    "                back on the bus when IO is active (e.g. LDA's address).\n"
    "Red LEDs show the latched instruction byte."
)

CONTROL_DOC = (
    "<b>CONTROL LOGIC — the conductor that drives every other module</b>\n"
    "A 74x161 step counter walks through micro-steps T0..T5; a 74x138 decodes\n"
    "the step number. Two 28C16 EEPROMs hold the MICROCODE: they are addressed\n"
    "by { opcode, step, carry-flag, zero-flag } and output the 16 control\n"
    "signals (MI, RO, II, AI, EO, SU, …) that tell every module what to do on\n"
    "THIS clock edge. This is the table that turns a byte into a sequence of\n"
    "actions — the real 'brain' of the CPU."
)

A_DOC = (
    "<b>A REGISTER — the accumulator</b>\n"
    "Two 74x173s latch a byte from the bus on AI. Its value is ALWAYS fed to the\n"
    "ALU as the 'A' operand, and a 74x245 buffer can drive it back onto the bus\n"
    "when AO is active. Almost every result of a computation ends up here.\n"
    "Red LEDs show its contents."
)

ALU_DOC = (
    "<b>ARITHMETIC LOGIC UNIT — does the math</b>\n"
    "Two 74x283 4-bit adders compute A + B. Two 74x86 XOR banks conditionally\n"
    "flip every bit of B when SU is set: B XOR 1 then + 1 (carry-in) is exactly\n"
    "two's-complement -B, so the SAME adder also SUBTRACTS. A 74x32 OR tree\n"
    "checks for an all-zero result (the Zero flag). A 74x245 drives the result\n"
    "onto the bus when EO is active. Produces the Carry (CF) and Zero (ZF) flags.\n"
    "Yellow LEDs show the live sum."
)

B_DOC = (
    "<b>B REGISTER — the ALU's second operand</b>\n"
    "Two 74x173s latch a byte from the bus on BI. Its value is permanently wired\n"
    "to the ALU's 'B' input. Unlike A, the classic SAP-1 B register has no bus-\n"
    "output buffer — it only ever feeds the adder. Red LEDs show its contents."
)

FLAGS_DOC = (
    "<b>FLAGS REGISTER — remembers the status of the last result</b>\n"
    "A 74x173 latches two bits from the ALU when FI is asserted:\n"
    "  CF (carry): the add overflowed past 8 bits.\n"
    "  ZF (zero):  the result was exactly zero.\n"
    "The Control Logic reads these to make conditional jumps: JC = jump if\n"
    "carry, JZ = jump if zero. That is how the CPU makes decisions."
)

OUTPUT_DOC = (
    "<b>OUTPUT REGISTER — the display</b>\n"
    "A 74x377 latches a byte from the bus when OI is asserted. A 28C16 EEPROM is\n"
    "a decode ROM that converts the byte into 7-segment patterns; a 74x107 +\n"
    "74x139 scan the four digits. The four 7-segment displays show the value in\n"
    "decimal. This is the only way a program can 'print' a result."
)

# ── One-glance module summaries (printed at the TOP of each board) ───────────
# At most three sentences: what the module does AND how it interacts with the
# rest of the machine to make a computer. The detailed DOC panels live to the
# right; these are the captions you read at a glance on each board.

CLOCK_SUMMARY = (
    "The clock is the heartbeat: it ticks once per step and nothing else moves "
    "except on its edge. That single shared tick is what keeps every module in "
    "step so the machine acts as one computer instead of 12 loose chips.")
RESET_SUMMARY = (
    "Pressing reset pulls every register and both counters back to zero. The "
    "whole computer restarts cleanly from the first instruction.")
PC_SUMMARY = (
    "Holds the address of the next instruction and counts up by one each fetch, "
    "so the program runs in order. It puts that address on the bus when asked, "
    "and can be loaded from the bus to perform a jump.")
MAR_SUMMARY = (
    "Latches an address off the bus and hands it to RAM, telling memory which "
    "byte to read or write. It is how the CPU points at the instruction or data "
    "it wants next.")
RAM_SUMMARY = (
    "Stores the 16-byte program and its data. It reads the byte at the MAR's "
    "address onto the bus, or writes the bus back into that address, so it is "
    "the computer's memory.")
IR_SUMMARY = (
    "Latches the current instruction byte from the bus. Its top half (the "
    "opcode) tells the Control Logic what to do; its bottom half (the operand) "
    "can be put back on the bus as an address or value.")
CONTROL_SUMMARY = (
    "The brain: stored microcode reads the opcode and step number and fires the "
    "right control signals every tick. It decides which module drives the bus "
    "and which latches from it, turning a byte into a sequence of actions.")
A_SUMMARY = (
    "The accumulator: holds one operand for the ALU and catches most results. "
    "It latches a value from the bus and can drive that value back onto the bus.")
ALU_SUMMARY = (
    "Adds or subtracts the A and B registers and puts the result on the bus. It "
    "also reports whether the result carried or came out zero, which is what "
    "lets the computer make decisions.")
B_SUMMARY = (
    "Holds the second number for the ALU. It latches a value from the bus and "
    "feeds it straight to the adder, so A+B (or A-B) can be computed.")
FLAGS_SUMMARY = (
    "Remembers whether the last ALU result carried or was zero. The Control "
    "Logic reads these bits so jumps can be conditional - branching only when "
    "carry or zero is set.")
OUTPUT_SUMMARY = (
    "Latches a byte from the bus and shows it as a decimal number on the "
    "7-segment displays. It is the computer's only way to show a result to you.")

# ── Layout ─────────────────────────────────────────────────────────────────
# One module = one breadboard, exactly like Ben Eater's separate boards.
#   Left column (tx=0)  = the data path, read top-to-bottom in execution order.
#   Right column (tx=1) = each module's OWN LED indicator board (+ reset button).
#   A one-glance summary sits at the top of every board; a fuller documentation
#   panel floats to the right of every row.

TILE_PX_W = 1320     # GRID.TILE_WIDTH  in js/constants.js
TILE_PX_H = 420      # GRID.TILE_HEIGHT in js/constants.js

# (builder, module_tile, led_tile_or_None, NAME, SUMMARY, DOC)
MODULE_LAYOUT = [
    (m_clock,      (0, 0),  None,    "CLOCK",                    CLOCK_SUMMARY,   CLOCK_DOC),
    (m_reset,      (1, 0),  None,    "RESET",                    RESET_SUMMARY,   RESET_DOC),
    (m_pc,         (0, 1),  (1, 1),  "PROGRAM COUNTER",          PC_SUMMARY,      PC_DOC),
    (m_mar,        (0, 2),  (1, 2),  "MEMORY ADDRESS REGISTER",  MAR_SUMMARY,     MAR_DOC),
    (m_ram,        (0, 3),  None,    "RANDOM ACCESS MEMORY (16x8)", RAM_SUMMARY,  RAM_DOC),
    (m_ir,         (0, 4),  (1, 4),  "INSTRUCTION REGISTER",     IR_SUMMARY,      IR_DOC),
    (m_control,    (0, 5),  None,    "CONTROL LOGIC",            CONTROL_SUMMARY, CONTROL_DOC),
    (m_a_register, (0, 6),  (1, 6),  "A REGISTER",               A_SUMMARY,       A_DOC),
    (m_alu,        (0, 7),  (1, 7),  "ARITHMETIC LOGIC UNIT",    ALU_SUMMARY,     ALU_DOC),
    (m_b_register, (0, 8),  (1, 8),  "B REGISTER",               B_SUMMARY,       B_DOC),
    (m_flags,      (0, 9),  (1, 9),  "FLAGS REGISTER",           FLAGS_SUMMARY,   FLAGS_DOC),
    (m_output_reg, (0, 10), None,    "OUTPUT",                   OUTPUT_SUMMARY,  OUTPUT_DOC),
]

# ── Self-validation ────────────────────────────────────────────────────────

def chip_pin_holes(c):
    if c.get("type") != "chip":
        return []
    cid = c["chipId"]
    if cid not in PIN_COUNT:
        return []
    pc = PIN_COUNT[cid]
    return [chip_pin_hole(c["tileX"], c["tileY"], c["col"], pin, pc)
            for pin in range(1, pc + 1)]

def component_occupied_holes(c):
    """Return the holes occupied by a component (where another component can't go,
    and where a wire endpoint can't go)."""
    t = c.get("type")
    if t == "chip":
        return chip_pin_holes(c)
    if t in ("led", "resistor", "switch", "push_button", "capacitor", "diode"):
        return [c["startHoleId"], c["endHoleId"]]
    if t == "clock":
        return [hole(c["tileX"], c["tileY"], "main", c["col"], c["row"])]
    if t == "dip_switch":
        holes = []
        for i in range(c.get("count", 4)):
            holes.append(hole(c["tileX"], c["tileY"], "main", c["col"] + i, 4))
            holes.append(hole(c["tileX"], c["tileY"], "main", c["col"] + i, 5))
        return holes
    if t == "seven_seg":
        holes = []
        for r in (2, 3, 4, 5, 6):
            for cc in range(c["col"], c["col"] + 5):
                holes.append(hole(c["tileX"], c["tileY"], "main", cc, r))
        return holes
    return []

def validate(state):
    """Raise on any placement legality violation."""
    errors = []

    # 1) component-occupied hole uniqueness
    occ_owner = {}  # hole -> component id
    for c in state["components"]:
        for h in component_occupied_holes(c):
            if h in occ_owner:
                errors.append(f"hole {h} occupied by component {occ_owner[h]} AND {c['id']} ({c.get('chipId') or c.get('type')})")
            else:
                occ_owner[h] = c["id"]

    # 2) wire endpoints not on component holes, not on other wire endpoints
    wire_endpoints = {}
    for w in state["wires"]:
        for end in (w["startHoleId"], w["endHoleId"]):
            if end in occ_owner:
                errors.append(f"wire {w['id']} endpoint {end} lands on component {occ_owner[end]}")
            if end in wire_endpoints:
                errors.append(f"wire {w['id']} endpoint {end} collides with wire {wire_endpoints[end]}")
            else:
                wire_endpoints[end] = w["id"]

    # 3) no power-rail-gap usage
    def check_hole(h, ctx):
        tx, ty, kind, col, row = parse_hole(h)
        if kind == "power":
            if not is_valid_power_col(col):
                errors.append(f"{ctx}: power hole {h} is in a rail GAP (col {col} not valid)")
        if kind == "main":
            if not (0 <= col < TILE_COLS):
                errors.append(f"{ctx}: hole {h} col {col} out of range")
            if not (0 <= row < 10):
                errors.append(f"{ctx}: hole {h} row {row} out of range")

    for c in state["components"]:
        for h in component_occupied_holes(c):
            check_hole(h, f"component {c['id']}")
        for h in [c.get(k) for k in ("startHoleId", "endHoleId") if k in c]:
            if h:
                check_hole(h, f"component {c['id']} terminal")
    for w in state["wires"]:
        check_hole(w["startHoleId"], f"wire {w['id']}")
        check_hole(w["endHoleId"], f"wire {w['id']}")

    # 4) degenerate 2-terminal parts: start != end, and not same column-half net
    def same_net(h1, h2):
        t1, y1, k1, c1, r1 = parse_hole(h1)
        t2, y2, k2, c2, r2 = parse_hole(h2)
        if t1 != t2 or y1 != y2 or k1 != k2:
            return False
        if k1 == "main":
            return c1 == c2 and (r1 < 5) == (r2 < 5)
        # power: same row across the whole tile
        return r1 == r2
    for c in state["components"]:
        if c.get("type") in ("led", "resistor"):
            a, b = c["startHoleId"], c["endHoleId"]
            if a == b:
                errors.append(f"{c['type']} {c['id']}: start == end ({a})")
            elif same_net(a, b):
                errors.append(f"{c['type']} {c['id']}: terminals on same net ({a} -- {b}) — short")

    # 5) basic VCC/GND reachability per chip
    # Build a union-find over (column-half ties + power-row-per-tile ties + wires)
    parent = {}
    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    # Add all known holes first (chip pins, component terminals, wire endpoints)
    all_holes = set(wire_endpoints.keys())
    for h in occ_owner.keys():
        all_holes.add(h)
    for h in all_holes:
        find(h)
    # Column-half ties for every main hole we've seen: any two holes in same
    # (tx,ty,col,top_half) are connected — but we only need to union pairs we have.
    by_col_half = defaultdict(list)
    for h in all_holes:
        tx, ty, k, c, r = parse_hole(h)
        if k == "main":
            half = 0 if r < 5 else 1
            by_col_half[(tx, ty, c, half)].append(h)
    for group in by_col_half.values():
        for h in group[1:]:
            union(group[0], h)
    # Power-row ties per tile
    by_power_row = defaultdict(list)
    for h in all_holes:
        tx, ty, k, c, r = parse_hole(h)
        if k == "power":
            by_power_row[(tx, ty, r)].append(h)
    for group in by_power_row.values():
        for h in group[1:]:
            union(group[0], h)
    # Wires
    for w in state["wires"]:
        union(w["startHoleId"], w["endHoleId"])

    # Tag nets as VCC/GND based on touching a power rail row
    net_tags = defaultdict(lambda: {"vcc": False, "gnd": False})
    for h in all_holes:
        tx, ty, k, c, r = parse_hole(h)
        if k == "power":
            root = find(h)
            if r in (1, 3):
                net_tags[root]["vcc"] = True
            else:
                net_tags[root]["gnd"] = True

    # Check each chip's VCC and GND pin
    for c in state["components"]:
        if c.get("type") != "chip": continue
        cid = c["chipId"]
        if cid not in PIN_MAPS: continue
        pm = PIN_MAPS[cid]
        if "VCC" in pm:
            vcc_hole = chip_pin_hole(c["tileX"], c["tileY"], c["col"], pm["VCC"], PIN_COUNT[cid])
            # Only check if pin hole appeared in our hole set
            if vcc_hole in all_holes:
                root = find(vcc_hole)
                if not net_tags[root]["vcc"]:
                    errors.append(f"chip {c['id']} {cid}: VCC pin not reaching a VCC rail")
        if "GND" in pm:
            gnd_hole = chip_pin_hole(c["tileX"], c["tileY"], c["col"], pm["GND"], PIN_COUNT[cid])
            if gnd_hole in all_holes:
                root = find(gnd_hole)
                if not net_tags[root]["gnd"]:
                    errors.append(f"chip {c['id']} {cid}: GND pin not reaching a GND rail")

    return errors

# ── Build orchestration ────────────────────────────────────────────────────

def _reset_registries():
    _next_id[0] = 1
    _PIN_FREE.clear()
    _POWER_USED.clear()
    for b in _BUS_TAPS: _BUS_TAPS[b].clear()
    _CTRL_TAPS.clear()
    _CTRL_SOURCE.clear()
    _LED_REQUESTS.clear()
    _CURRENT_LED_TILE[0] = None

def build():
    _reset_registries()

    components = []
    wires = []
    text_boxes = []

    # Title / description (parsed by backend/examples.py for the gallery card)
    text_boxes.append(text_box(10, -780, "Title: Ben Eater 8-bit CPU", w=700, h=24))
    text_boxes.append(text_box(10, -750,
        "Description: A working recreation of Ben Eater's SAP-1 breadboard "
        "computer - one breadboard per module (clock, program counter, RAM, "
        "registers, ALU, microcoded control, output). Single-step the clock and "
        "watch a real program run.", w=1290, h=24))

    # Big overview banner, floating above the first board (negative Y).
    text_boxes.append(text_box(10, -710, OVERVIEW_DOC, w=1290, h=690))

    # Doc panels sit to the right of the 2-wide board (x > 2 tiles).
    DOC_X0 = 2 * TILE_PX_W + 30
    DOC_W  = 900

    # Module builders + per-board labels + documentation panels
    for builder, (mtx, mty), led_tile, name, summary, doc in MODULE_LAYOUT:
        # One-glance header across the top of the module board: bold name + a
        # <=3-sentence summary of what it does and how it ties into the computer.
        header = f"<b>{name}</b>\n{summary}"
        text_boxes.append(text_box(mtx * TILE_PX_W + 10, mty * TILE_PX_H + 4,
                                    header, w=TILE_PX_W - 20, h=96))
        # Fuller documentation panel to the right of the row (mtx shifts the rare
        # 2nd module on a row — only the CLOCK/RESET row has two modules)
        text_boxes.append(text_box(DOC_X0 + mtx * (DOC_W + 30), mty * TILE_PX_H + 14,
                                    doc, w=DOC_W, h=TILE_PX_H - 40))
        # LED indicator board label
        if led_tile is not None:
            ltx, lty = led_tile
            text_boxes.append(text_box(ltx * TILE_PX_W + 8, lty * TILE_PX_H + 6,
                                        f"<b>{name} - value (LEDs)</b>", w=540, h=26))
        # Route this module's request_led() calls onto its own indicator board
        _CURRENT_LED_TILE[0] = led_tile
        c, w = builder(mtx, mty)
        components += c
        wires += w
    _CURRENT_LED_TILE[0] = None

    # Per-module LED boards — must run after all request_led calls
    led_comps, led_wires = build_led_panel()
    components += led_comps
    wires += led_wires

    # Bus + control rails
    bc, bw = m_bus_rails()
    components += bc
    wires += bw
    cc, cw = m_control_rails()
    components += cc
    wires += cw

    # Extra tiles (everything beyond the default 2x2 grid)
    used_tiles = set()
    for _, mtile, ltile, _, _, _ in MODULE_LAYOUT:
        used_tiles.add(mtile)
        if ltile is not None:
            used_tiles.add(ltile)
    extra_tiles = []
    for (tx, ty) in sorted(used_tiles):
        if tx < 2 and ty < 2:
            continue
        extra_tiles.append({"tx": tx, "ty": ty})

    return {
        "version": 1,
        "components": components,
        "wires": wires,
        "extraTiles": extra_tiles,
        "showNetPower": False,
        "showRealisticBoard": False,
        "lastUsedChips": [],
        "textBoxes": text_boxes,
    }

# ── Per-module boards (onramp "Ben Eater 8-bit CPU" course) ─────────────────
# Each lesson in the onramp course shows ONE module in isolation: the module's
# chips on tile (0,0) and its indicator LEDs stacked below on tile (0,1) so the
# board fits the lesson player's narrow canvas. Bus/control rails are NOT run —
# a lone module has nothing to chain to — so these are read-only "anatomy"
# views: real placement, real intra-module wiring, real power.

MODULE_KEYS = {
    "CLOCK": "clock",
    "RESET": "reset",
    "PROGRAM COUNTER": "pc",
    "MEMORY ADDRESS REGISTER": "mar",
    "RANDOM ACCESS MEMORY (16x8)": "ram",
    "INSTRUCTION REGISTER": "ir",
    "CONTROL LOGIC": "control",
    "A REGISTER": "a",
    "ARITHMETIC LOGIC UNIT": "alu",
    "B REGISTER": "b",
    "FLAGS REGISTER": "flags",
    "OUTPUT": "output",
}

def build_module(builder, has_led_board):
    _reset_registries()
    _CURRENT_LED_TILE[0] = (0, 1) if has_led_board else None
    components, wires = builder(0, 0)
    led_comps, led_wires = build_led_panel()
    components += led_comps
    wires += led_wires
    _CURRENT_LED_TILE[0] = None
    return {
        "version": 1,
        "components": components,
        "wires": wires,
        "extraTiles": [],
        "showNetPower": False,
        "showRealisticBoard": False,
        "lastUsedChips": [],
        "textBoxes": [],
    }

def build_modules():
    boards = {}
    for builder, _mtile, led_tile, name, _summary, _doc in MODULE_LAYOUT:
        key = MODULE_KEYS[name]
        state = build_module(builder, led_tile is not None)
        errors = validate(state)
        if errors:
            print(f"MODULE {key!r} VALIDATION FAILED with {len(errors)} error(s):",
                  file=sys.stderr)
            for e in errors[:20]:
                print(f"  {e}", file=sys.stderr)
            sys.exit(1)
        boards[key] = state
    return boards

MODULES_JS_HEADER = """\
// ── Ben Eater 8-bit CPU — per-module lesson boards ───────────────────────────
// GENERATED by helperscripts/generate_ben_eater_cpu.py --modules. DO NOT EDIT.
// Each board is one SAP-1 module in isolation: its chips + intra-module wiring
// on tile (0,0), its indicator LEDs on tile (0,1). Loaded read-only by the
// onramp "Ben Eater 8-bit CPU" course (js/onramp-lessons-beneater.js).
// Regenerate:  python3 helperscripts/generate_ben_eater_cpu.py --modules
"""

def write_modules_js():
    boards = build_modules()
    out_path = pathlib.Path(__file__).parent.parent / "js" / "onramp-beneater-boards.js"
    lines = [MODULES_JS_HEADER, "export const BENEATER_MODULE_BOARDS = {"]
    for key, state in boards.items():
        lines.append(f"  {key}: {json.dumps(state, separators=(',', ':'))},")
    lines.append("};")
    out_path.write_text("\n".join(lines) + "\n")
    print(f"Wrote {out_path}")
    for key, state in boards.items():
        print(f"  {key:8s} components: {len(state['components']):3d}  wires: {len(state['wires']):3d}")

def main():
    if "--modules" in sys.argv:
        write_modules_js()
        return
    state = build()
    errors = validate(state)
    if errors:
        print(f"VALIDATION FAILED with {len(errors)} error(s):", file=sys.stderr)
        for e in errors[:50]:
            print(f"  {e}", file=sys.stderr)
        if len(errors) > 50:
            print(f"  ... and {len(errors) - 50} more", file=sys.stderr)
        sys.exit(1)
    out_path = pathlib.Path(__file__).parent.parent / "js" / "examples" / "BenEater8BitCPU.json"
    out_path.write_text(json.dumps(state, separators=(",", ":")))
    n_tiles = len(state["extraTiles"]) + 4
    print(f"Wrote {out_path}")
    print(f"  components: {len(state['components'])}")
    print(f"  wires:      {len(state['wires'])}")
    print(f"  tiles:      {n_tiles}")

if __name__ == "__main__":
    main()
