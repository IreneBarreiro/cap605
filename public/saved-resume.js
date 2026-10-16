const key = 'in-your-words:base-resume:v1';
export function readSavedResume(storage) {
  const raw = storage.getItem(key);
  if (!raw) return null;
  const data = JSON.parse(raw);
  if (data.version !== 1 || typeof data.resume !== 'string' || typeof data.voice !== 'string' || typeof data.useVoice !== 'boolean') throw new Error('Invalid saved resume');
  return data;
}
export function saveResume(storage, resume, voice, useVoice) {
  if (!resume.trim() && !voice.trim()) { storage.removeItem(key); return false; }
  storage.setItem(key, JSON.stringify({version: 1, resume, voice, useVoice: Boolean(useVoice)}));
  return true;
}
export function forgetResume(storage) { storage.removeItem(key); }
