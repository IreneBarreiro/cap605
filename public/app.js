import {tailor} from './tailor.js';
const el = id => document.getElementById(id);
let importing = false;
el('file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file || importing) return;
  importing = true;
  el('file').disabled = true;
  const submit = el('form').querySelector('button[type="submit"]');
  submit.disabled = true;
  el('status').textContent = 'Reading your resume…';
  try {
    const {importResume} = await import('./vendor/import.js');
    const text = await importResume(file);
    el('resume').value = text;
    el('status').textContent = 'Resume imported. Review the extracted text and line breaks before tailoring.';
  } catch (error) {
    el('status').textContent = error.message?.includes('PDF') || error.message?.includes('Please') || error.message?.includes('file') || error.message?.includes('text') ? error.message : 'Could not read this file. Try saving it again as PDF or .docx, or paste your resume.';
  } finally {
    importing = false; el('file').disabled = false; submit.disabled = false; el('file').value = '';
  }
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
