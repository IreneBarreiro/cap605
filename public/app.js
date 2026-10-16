import {tailor} from './tailor.js';
const el = id => document.getElementById(id);
let importing = false;
let tailoring = false;
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
el('form').addEventListener('submit', async event => {
  event.preventDefault();
  if (tailoring || importing) return;
  const resume = el('resume').value;
  const job = el('job').value;
  const sample = el('voice').value;
  const useVoice = el('use-voice').checked;
  const submit = el('form').querySelector('button[type="submit"]');
  tailoring = true; submit.disabled = true; el('file').disabled = true;
  el('status').textContent = useVoice ? 'Reading your writing style and preparing a draft…' : 'Preparing your draft…';
  try {
    let source = resume, summary = '';
    if (useVoice) {
      const {rewriteInYourVoice} = await import('./vendor/voice-ai.js');
      const rewritten = await rewriteInYourVoice(resume, job, sample);
      source = rewritten.text; summary = rewritten.summary;
    }
    const result = tailor(source, job);
    el('draft').value = result.text;
    el('matched').textContent = result.matched.join(' · ') || 'No shared terms found. Review the description and your experience.';
    el('missing').textContent = result.missing.slice(0, 35).join(' · ') || 'No additional terms to review.';
    el('explanation').textContent = result.changed ? 'Relevant bullets now appear first within their original roles. Every sentence comes from your resume.' : 'Your wording is preserved. No bullet order changes were needed; use the shared terms below to guide your review.';
    if (useVoice) el('explanation').textContent = 'AI rewrote your experience bullets using your writing sample, then prioritized relevant bullets within each role. Review every claim before applying. Headings and other details were preserved.';
    el('voice-summary').textContent = summary ? 'Your writing style: ' + summary : '';
    el('voice-summary').hidden = !summary;
    el('result').hidden = false;
    el('status').textContent = 'Your draft is ready to review.';
    el('result').scrollIntoView({behavior: 'smooth', block: 'start'});
  } catch (error) { el('status').textContent = error.message; }
  finally { tailoring = false; submit.disabled = false; el('file').disabled = false; }
});
el('download-pdf').addEventListener('click', async () => {
  const button = el('download-pdf');
  button.disabled = true;
  button.textContent = 'Preparing PDF…';
  try {
    const {downloadResumePdf} = await import('./vendor/pdf.js');
    await downloadResumePdf(el('draft').value);
    el('status').textContent = 'Your tailored PDF is ready.';
    el('pdf-status').textContent = 'PDF prepared from your current draft.';
  } catch (error) {
    el('pdf-status').textContent = error.message?.includes('empty') ? error.message : 'Could not create the PDF. Please try again or download the text version.';
  } finally { button.disabled = false; button.textContent = 'Download PDF'; }
});
el('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([el('draft').value], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'tailored-resume.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

el('use-voice').addEventListener('change', () => {
  el('form').querySelector('button[type=submit]').textContent = el('use-voice').checked ? 'Tailor in my voice ↗' : 'Tailor my resume ↗';
});
