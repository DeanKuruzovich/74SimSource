document.getElementById('feedback-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('status-msg');
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
