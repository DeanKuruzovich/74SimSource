const VIEWS = ['view-home', 'view-education', 'view-bug', 'view-feedback'];

function showView(id) {
  VIEWS.forEach(v => {
    document.getElementById(v).style.display = (v === id) ? '' : 'none';
  });
}

document.getElementById('link-report-bug').addEventListener('click', e => {
  e.preventDefault();
  const isShowing = document.getElementById('view-bug').style.display !== 'none';
  isShowing ? showView('view-home') : showView('view-bug');
});

document.getElementById('link-feedback').addEventListener('click', e => {
  e.preventDefault();
  const isShowing = document.getElementById('view-feedback').style.display !== 'none';
  isShowing ? showView('view-home') : showView('view-feedback');
});

document.getElementById('link-education').addEventListener('click', e => {
  e.preventDefault();
  const isShowing = document.getElementById('view-education').style.display !== 'none';
  isShowing ? showView('view-home') : showView('view-education');
});

// Bug report form
document.getElementById('bug-project-file').addEventListener('change', e => {
  const file = e.target.files[0];
  document.getElementById('bug-project-label').textContent = file ? file.name : 'No file selected';
});

document.getElementById('bug-report-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('bug-submit-btn');
  const statusEl = document.getElementById('bug-status-msg');
  statusEl.className = 'status-msg';
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const description = document.getElementById('bug-description').value.trim();

  // 5 MB per-file limit, unless the description is the bypass phrase.
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const bypassLimits = description.toLowerCase() === 'issiautng';
  if (!bypassLimits) {
    const attached = [
      ...document.getElementById('bug-images').files,
      ...document.getElementById('bug-project-file').files,
    ];
    const tooBig = attached.find(f => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      statusEl.textContent = `File "${tooBig.name}" is over the 5 MB limit.`;
      statusEl.className = 'status-msg error';
      btn.disabled = false;
      btn.textContent = 'Submit Bug Report';
      return;
    }
  }

  const fd = new FormData();
  fd.append('report_type', 'bug');
  fd.append('description', description);
  for (const file of document.getElementById('bug-images').files) fd.append('images', file);
  const projectFile = document.getElementById('bug-project-file').files[0];
  if (projectFile) fd.append('project_file', projectFile);

  try {
    const res = await fetch('/api/reports', { method: 'POST', body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Server error ${res.status}`);
    }
    statusEl.textContent = 'Bug report submitted thank you!';
    statusEl.className = 'status-msg success';
    document.getElementById('bug-report-form').reset();
    document.getElementById('bug-project-label').textContent = 'No file selected';
    btn.textContent = 'Submitted';
  } catch (err) {
    statusEl.textContent = `Failed to submit: ${err.message}`;
    statusEl.className = 'status-msg error';
    btn.disabled = false;
    btn.textContent = 'Submit Bug Report';
  }
});

// Feedback form
document.getElementById('feedback-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('feedback-submit-btn');
  const statusEl = document.getElementById('feedback-status-msg');
  statusEl.className = 'status-msg';
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const fd = new FormData();
  fd.append('report_type', 'feedback');
  fd.append('description', document.getElementById('feedback-description').value.trim());


  try {
    const res = await fetch('/api/reports', { method: 'POST', body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Server error ${res.status}`);
    }
    statusEl.textContent = 'Feedback submitted thank you!';
    statusEl.className = 'status-msg success';
    document.getElementById('feedback-form').reset();
    btn.textContent = 'Submitted';
  } catch (err) {
    statusEl.textContent = `Failed to submit: ${err.message}`;
    statusEl.className = 'status-msg error';
    btn.disabled = false;
    btn.textContent = 'Submit Feedback';
  }
});

