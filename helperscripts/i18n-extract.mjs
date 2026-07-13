// ── 74Sim onramp lesson-prose extractor ──────────────────────────────────────
// Walks the course registry (the single source of truth for lesson text) and
// emits js/i18n/lessons.en.json: a flat, stable-keyed catalog of every
// translatable field. Translators (or a translation workflow) turn this into
// lessons.<locale>.json, which js/i18n.js overlays back onto the source objects
// at runtime via localizeCourse().
//
// Keys mirror exactly what localizeCourse() looks up:
//   <course>.title | <course>.blurb
//   <course>.<lessonId>.title | .description
//   <course>.<lessonId>.<stepId>.title | .content
//   <course>.<lessonId>.<stepId>.hint.<i>.label
//
// Run:  node helperscripts/i18n-extract.mjs
// Safe to re-run any time lesson prose changes; keys are stable across runs.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { COURSES } from '../js/onramp-courses.js';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'js', 'i18n', 'lessons.en.json');

const out = {};
const put = (key, val) => {
  if (typeof val === 'string' && val.trim() !== '') out[key] = val;
};

for (const course of Object.values(COURSES)) {
  const cid = course.id;
  put(`${cid}.title`, course.title);
  put(`${cid}.blurb`, course.blurb);

  for (const lesson of course.lessons || []) {
    const lid = lesson.id;
    put(`${cid}.${lid}.title`, lesson.title);
    put(`${cid}.${lid}.description`, lesson.description);

    for (const step of lesson.steps || []) {
      const sid = step.id;
      put(`${cid}.${lid}.${sid}.title`, step.title);
      put(`${cid}.${lid}.${sid}.content`, step.content);
      if (step.hint && Array.isArray(step.hint.targets)) {
        step.hint.targets.forEach((tg, i) => {
          put(`${cid}.${lid}.${sid}.hint.${i}.label`, tg && tg.label);
        });
      }
    }
  }
}

// Stable key order → clean git diffs.
const sorted = {};
for (const k of Object.keys(out).sort()) sorted[k] = out[k];

writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
console.log(`Wrote ${Object.keys(sorted).length} lesson strings to ${outPath}`);
