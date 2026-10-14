const stopWords = new Set('the and for with you your our are will this that from have has work role team job about into their they able experience required requirements preferred skills responsibilities years strong excellent including using looking ability must can all not but who what how more other position company candidate'.split(' '));
export function keywords(text) {
  return [...new Set((text.toLowerCase().match(/[a-z][a-z0-9+#.-]*/g) || []).map(w => w.replace(/[.-]+$/g, '')).filter(w => w.length > 2 && !stopWords.has(w)))];
}
export function tailor(resume, description) {
  if (!resume.trim() || !description.trim()) throw new Error('Add both your resume and a job description.');
  const terms = keywords(description);
  const score = line => terms.filter(term => keywords(line).includes(term)).length;
  const lines = resume.replace(/\r\n/g, '\n').split('\n');
  const bullet = line => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line);
  // Only reorder consecutive bullets: never move experience between employers.
  for (let i = 0; i < lines.length;) {
    if (!bullet(lines[i])) { i++; continue; }
    let end = i + 1;
    while (end < lines.length && bullet(lines[end])) end++;
    const group = lines.slice(i, end).map((line, index) => ({line, index, score: score(line)}));
    group.sort((a, b) => b.score - a.score || a.index - b.index);
    lines.splice(i, end - i, ...group.map(item => item.line));
    i = end;
  }
  const present = new Set(keywords(resume));
  return {text: lines.join('\n'), matched: terms.filter(term => present.has(term)), missing: terms.filter(term => !present.has(term)), changed: lines.join('\n') !== resume.replace(/\r\n/g, '\n')};
}
