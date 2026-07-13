document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.querySelector('.btn-submit');
  const statusEl = document.getElementById('submit-status');

  const description = document.getElementById('description').value.trim();
  if (!description) {
    showStatus('Please add a description before submitting.', 'error');
    return;
  }

  const fileInput = document.querySelector('input[name="project-file"]');
  if (!fileInput.files.length) {
    showStatus('Please select a project file to upload.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('description', description);
  formData.append('project_file', fileInput.files[0]);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const res = await fetch('/api/submissions', { method: 'POST', body: formData });
    if (res.ok) {
      showStatus('Thanks! Your project was submitted successfully.', 'success');
      document.querySelector('form').reset();
    } else {
      const data = await res.json().catch(() => ({}));
      showStatus('Submission failed: ' + (data.detail || res.statusText), 'error');
    }
  } catch (err) {
    showStatus('Network error   please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Project';
  }
});

function showStatus(msg, type) {
  const el = document.getElementById('submit-status');
  el.textContent = msg;
  el.className = 'status-msg ' + type;
}
