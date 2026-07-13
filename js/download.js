function detectOS() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  if (ua.includes('mac') || platform.includes('mac')) return 'mac';
  if (ua.includes('win') || platform.includes('win')) return 'windows';
  if (ua.includes('linux') || platform.includes('linux')) return 'linux';
  return 'unknown';
}

const os = detectOS();

document.querySelectorAll('.download-item').forEach(item => {
  if (item.dataset.os === os) {
    item.classList.add('detected');
  } else {
    item.querySelector('.btn-download')?.classList.add('btn-download-secondary');
  }
});

async function wireUpDownloads() {
  let version;
  try {
    const res = await fetch('/desktop-latest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest fetch failed: ' + res.status);
    version = (await res.json()).version;
    if (!version) throw new Error('manifest has no version field');
  } catch (err) {
    document.querySelectorAll('.download-item .btn-download').forEach(btn => {
      btn.textContent = 'Unavailable';
      btn.setAttribute('aria-disabled', 'true');
    });
    console.error('[74Sim download] cannot resolve installer version:', err);
    return;
  }

  document.querySelectorAll('.download-item').forEach(item => {
    const template = item.dataset.installer;
    if (!template) return;
    const filename = template.replace('{version}', version);
    const btn = item.querySelector('.btn-download');
    if (!btn) return;
    btn.href = '/releases/' + filename;
    btn.textContent = 'Download';
    btn.removeAttribute('aria-disabled');
  });
}

wireUpDownloads();
