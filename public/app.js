import {tailor} from './tailor.js';
const el = id => document.getElementById(id);
el('file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2_000_000 || !/\.txt$/i.test(file.name)) { el('status').textContent = 'Please import a .txt file smaller than 2 MB.'; return; }
  try { el('resume').value = await file.text(); el('status').textContent = 'Resume imported.'; }
  catch { el('status').textContent = 'Could not read that file. Please paste your resume instead.'; }
});
el('form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const result = tailor(el('resume').value, el('job').value);
    el('draft').value = result.text;
    el('matched').textContent = result.matched.join(' · ') || 'No shared terms found. Review the description and your experience.';
    el('missing').textContent = result.missing.slice(0, 35).join(' · ') || 'No additional terms to review.';
    el('explanation').textContent = result.changed ? 'Relevant bullets now appear first within their original roles. Every sentence comes from your resume.' : 'Your wording is preserved. No bullet order changes were needed; use the shared terms below to guide your review.';
    el('result').hidden = false;
    el('status').textContent = 'Your draft is ready to review.';
    el('result').scrollIntoView({behavior: 'smooth', block: 'start'});
  } catch (error) { el('status').textContent = error.message; }
});
el('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([el('draft').value], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'tailored-resume.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
