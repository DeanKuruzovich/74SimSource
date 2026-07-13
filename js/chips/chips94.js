// CMOS 4000-series coverage — Batch 8 (counter + 7-segment display).
// CD4026B: decade counter / divider with decoded 7-segment display outputs and
// a DISPLAY ENABLE (blanking) control. Shipped in its own standalone block
// (CHIPS_BLOCK_94) to avoid colliding with other agents adding chips in the
// same working tree.

export const CHIPS_BLOCK_94 = {
  // ── CD4026B: Decade counter + decoded 7-segment driver (display enable) ──
  /* Primary source: Texas Instruments / Harris CD4026B datasheet (SCHS031B,
     "CMOS Decade Counters/Dividers with Decoded 7-Segment Display Outputs"),
     read directly from the rendered PDF pages — Terminal Diagram (Top View),
     Fig.1 logic diagram, and Fig.3 timing diagram — NOT via a text summarizer
     (see issues.md C4). The pinout was verified against the CD4026B's own
     datasheet rather than cloned from the 74x143/144 COUNTER_7SEG parts, which
     have an entirely different pinout and control scheme (see issues.md C2):
     CLOCK=1, CLOCK INHIBIT=2, DISPLAY ENABLE IN=3, DISPLAY ENABLE OUT=4,
     CARRY OUT=5, f=6, g=7, VSS=8, d=9, a=10, e=11, b=12, c=13,
     UNGATED "C" SEGMENT=14, RESET=15, VDD=16. Uses a new COUNTER_7SEG_4026
     engine primitive — the hinted COUNTER_7SEG (74x143/144) does not fit (it
     has BCD QA..QD pins the CD4026 lacks, ENP/ENT enables, a STROBE latch
     rather than a DISPLAY-ENABLE blank, and a count==9 RCO rather than the
     CD4026's divide-by-10 CARRY OUT). See issues.md D13. */
  'CD4026': {
    name: 'CD4026',
    simpleName: 'Decade Counter + 7-Seg',
    description: 'Decade counter/divider, decoded 7-seg + display enable (16-pin CMOS)',
    guideOverview: 'The CD4026B is a 5-stage Johnson decade counter whose internal decoder drives seven active-HIGH outputs (a–g) that directly light a 7-segment LED display 0–9. The counter advances one count on each positive CLOCK transition while CLOCK INHIBIT is low (CLOCK INHIBIT held high freezes the count; with CLOCK held high it doubles as a negative-edge clock). A high RESET clears the counter to zero. A divide-by-10 CARRY OUT (one cycle per ten clocks) lets you cascade decades. A DISPLAY ENABLE IN input blanks the seven segment outputs (forces them low) for power saving / display multiplexing without disturbing the count, and DISPLAY ENABLE OUT passes the enable on to the next stage. The UNGATED "C" SEGMENT output gives the c-segment continuously (it is never blanked), useful for divide-by-12 / divide-by-60 clock dividers. The companion CD4033B replaces the display-enable feature with ripple-blanking.',
    guidePinDescriptions: {
      'CLOCK':  'Clock input. The counter advances one count on each positive (rising) transition while CLOCK INHIBIT is low.',
      'CLKINH': 'Clock inhibit, active HIGH. When high, CLOCK transitions are ignored (count frozen). With CLOCK held high it can serve as a negative-edge clock input.',
      'DEI':    'Display Enable In. HIGH = the seven segment outputs (a–g) show the decoded digit. LOW = all seven segment outputs are forced low (display blanked) for power saving / multiplexing; the count is unaffected.',
      'DEO':    'Display Enable Out. Buffered copy of Display Enable In, for cascading the enable to the next digit.',
      'CARRY':  'Carry Out (CLOCK ÷ 10). Completes one cycle every ten clock inputs (HIGH for counts 0–4, LOW for 5–9); its rising edge at the 9→0 rollover clocks the next decade. Not affected by Display Enable.',
      'f':      'Segment f driver output (active HIGH).',
      'g':      'Segment g driver output (active HIGH).',
      'VSS':    'Negative supply / ground (pin 8).',
      'd':      'Segment d driver output (active HIGH).',
      'a':      'Segment a driver output (active HIGH).',
      'e':      'Segment e driver output (active HIGH).',
      'b':      'Segment b driver output (active HIGH).',
      'c':      'Segment c driver output (active HIGH).',
      'UC':     'Ungated "C" segment output. The c-segment decode, available continuously regardless of Display Enable. Used in divide-by-12 / divide-by-60 counter/display chains.',
      'RESET':  'Master reset, active HIGH and asynchronous. Clears the decade counter to count 0.',
      'VDD':    'Positive supply (+3 V to +18 V; modeled at +5 V) at pin 16.',
    },
    guideSections: [
      {
        title: 'Counter and 7-Segment Decoder',
        paragraphs: [
          'Inside is a 5-stage Johnson (twisted-ring) decade counter that steps through ten states 0–9 and wraps. A built-in decoder converts each state into the seven segment-driver signals a–g, so the chip drives a 7-segment display directly without an external BCD-to-7-segment decoder.',
          'The counter advances on the rising edge of CLOCK when CLOCK INHIBIT is low. Holding CLOCK INHIBIT high freezes the count; alternatively, holding CLOCK high lets CLOCK INHIBIT act as a negative-edge clock (the chip counts on its falling edge). A high RESET asynchronously forces the count back to 0.',
        ],
        note: 'Segment outputs are active HIGH — they suit a common-cathode display (a high output lights its segment).',
      },
      {
        title: 'Display Enable, Carry Out and the Ungated C Segment',
        paragraphs: [
          'DISPLAY ENABLE IN low forces all seven segment outputs low (blank) so the digit goes dark — handy for leading-zero blanking, brightness control, and time-multiplexing several digits. The count keeps running underneath; only the seven gated segments are affected. DISPLAY ENABLE OUT repeats the enable for the next stage.',
          'CARRY OUT divides the clock by ten (one cycle per ten input clocks) and is used to clock the next decade in a multi-digit chain. Both CARRY OUT and the UNGATED "C" SEGMENT are taken ahead of the display-enable gating, so they remain available even while the display is blanked — which is what makes divide-by-12 and divide-by-60 timer chains possible.',
        ],
      },
    ],
    pins: 16,
    vcc: 16,
    gnd: 8,
    datasheet: 'https://www.ti.com/lit/ds/symlink/cd4026b.pdf',
    tags: ['counter', 'decade', 'divider', '7 segment', 'decoder', 'display', 'johnson', 'sequential', 'cmos', '4000'],
    pinout: [
      { pin: 1,  name: 'CLOCK',  type: 'input' },
      { pin: 2,  name: 'CLKINH', type: 'input' },
      { pin: 3,  name: 'DEI',    type: 'input' },
      { pin: 4,  name: 'DEO',    type: 'output' },
      { pin: 5,  name: 'CARRY',  type: 'output' },
      { pin: 6,  name: 'f',      type: 'output' },
      { pin: 7,  name: 'g',      type: 'output' },
      { pin: 8,  name: 'VSS',    type: 'power' },
      { pin: 9,  name: 'd',      type: 'output' },
      { pin: 10, name: 'a',      type: 'output' },
      { pin: 11, name: 'e',      type: 'output' },
      { pin: 12, name: 'b',      type: 'output' },
      { pin: 13, name: 'c',      type: 'output' },
      { pin: 14, name: 'UC',     type: 'output' },
      { pin: 15, name: 'RESET',  type: 'input' },
      { pin: 16, name: 'VDD',    type: 'power' },
    ],
    gates: [
      {
        type: 'COUNTER_7SEG_4026',
        inputs: ['CLOCK', 'CLKINH', 'RESET', 'DEI'],
        outputs: ['CARRY', 'DEO', 'UC', 'a', 'b', 'c', 'd', 'e', 'f', 'g'],
      },
    ],
    sequential: true,
  },
};
