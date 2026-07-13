import { COURSES, resolveCourse, courseQuery } from '/js/onramp-courses.js';
import { i18nReady, loadLessons, localizeCourse } from '/js/i18n.js';

// Wait for the i18n catalog so lesson prose renders in the active locale.
// English is the source of truth, so these resolve instantly when locale === 'en'.
await i18nReady;
await loadLessons();

// ── Active course ────────────────────────────────────────────────────────────
// /onramp/lessons?course=<id> picks the course; no param = the intro course,
// so all pre-existing links keep working unchanged.
const params = new URLSearchParams(window.location.search);
const courseId = resolveCourse(params.get('course'));
const course = localizeCourse(COURSES[courseId]);
const LESSONS = course.lessons;
const qs = courseQuery(courseId); // '' for the default course

document.title = `74Sim — ${course.title}`;
document.getElementById('course-title').textContent = course.title;
document.getElementById('course-blurb').textContent = course.blurb;

// Cross-link the other courses so every catalog page shows what else exists.
const others = Object.values(COURSES).filter(c => c.id !== courseId).map(localizeCourse);
document.getElementById('course-switch').innerHTML = others.map(c =>
  `Also available: <a href="/onramp/lessons${c.id === 'intro' ? '' : `?course=${c.id}`}">${c.title} →</a>`
).join('<br>');

// ── Lesson catalog ───────────────────────────────────────────────────────────
const listEl = document.getElementById('lesson-list');
listEl.innerHTML = LESSONS.map((lesson, i) => `
  <a href="/onramp/lesson?${qs}lesson=${i}" class="lesson-card">
    <h3>${lesson.title}</h3>
    <p>${lesson.description}</p>
  </a>
`).join('');

// ── Lesson-complete popup ────────────────────────────────────────────────────
// Arriving as /onramp/lessons?completed=<idx> means the player just finished
// that lesson. Congratulate, then offer to start the next one.
const completedRaw = params.get('completed');
const completedIdx = completedRaw !== null ? parseInt(completedRaw, 10) : NaN;

if (Number.isInteger(completedIdx) && completedIdx >= 0 && completedIdx < LESSONS.length) {
  const overlay = document.getElementById('lesson-complete-overlay');
  const titleEl = document.getElementById('lc-title');
  const bodyEl = document.getElementById('lc-body');
  const actionsEl = document.getElementById('lc-actions');

  const finished = LESSONS[completedIdx];
  const next = LESSONS[completedIdx + 1];

  titleEl.textContent = '🎉 Congrats — lesson finished';
  bodyEl.textContent = finished.title;

  if (next) {
    actionsEl.innerHTML = `
      <a class="modal-btn primary" href="/onramp/lesson?${qs}lesson=${completedIdx + 1}">Start next: ${next.title}</a>
      <button class="modal-btn" id="lc-dismiss">Back to lessons</button>
    `;
  } else {
    bodyEl.textContent = `${finished.title} — you've completed every lesson!`;
    actionsEl.innerHTML = `
      <a class="modal-btn primary" href="/">Open the simulator</a>
      <button class="modal-btn" id="lc-dismiss">Back to lessons</button>
    `;
  }

  overlay.hidden = false;

  const dismiss = () => {
    overlay.hidden = true;
    // Drop the completed param so a refresh doesn't re-trigger the popup
    // (but keep the course pinned).
    history.replaceState(null, '', '/onramp/lessons' + (qs ? `?course=${courseId}` : ''));
  };
  document.getElementById('lc-dismiss').addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
}
