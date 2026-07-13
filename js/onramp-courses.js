// ── 74Sim Onramp course registry ─────────────────────────────────────────────
// The onramp system hosts N guided courses. Each course is an ordered array of
// lessons in the shape onramp.js expects (see onramp-lessons.js). Both the
// catalog page (onramp-lessons-page.js) and the player (onramp.js) resolve the
// active course from the `?course=` query parameter through this registry;
// an unknown or missing value falls back to the original intro course, so all
// pre-existing URLs behave exactly as before.

import { LESSONS as INTRO_LESSONS } from './onramp-lessons.js';
import { BENEATER_LESSONS } from './onramp-lessons-beneater.js';

export const COURSES = {
  intro: {
    id: 'intro',
    title: 'Introduction to Digital Hardware',
    blurb: 'New to digital logic or the 74 series? This introduction walks you through the '
      + 'fundamentals step by step. No prior experience required. Each lesson builds on the '
      + 'last, from a single logic gate all the way to flip flops and counters.',
    lessons: INTRO_LESSONS,
  },
  beneater: {
    id: 'beneater',
    title: 'Ben Eater 8-bit CPU',
    blurb: 'A module-by-module tour of Ben Eater’s SAP-1 breadboard computer, rebuilt '
      + 'from real 74-series chips inside 74Sim. One lesson per module — clock, bus, '
      + 'registers, ALU, RAM, control logic — then a final lesson on how they combine '
      + 'into a working CPU, and why every CPU ever built does the same dance.',
    lessons: BENEATER_LESSONS,
  },
};

export const DEFAULT_COURSE = 'intro';

export function resolveCourse(param) {
  return COURSES[param] ? param : DEFAULT_COURSE;
}

// Query-string fragment that pins a course in links. Empty for the default
// course so existing intro-course URLs stay byte-identical.
export function courseQuery(courseId) {
  return courseId === DEFAULT_COURSE ? '' : `course=${courseId}&`;
}
