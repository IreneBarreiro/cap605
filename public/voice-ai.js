import {initializeApp, getApps} from 'firebase/app';
import {getAI, GoogleAIBackend, getGenerativeModel} from 'firebase/ai';
import {prepareVoiceRequest, applyVoiceResponse, VOICE_INSTRUCTIONS} from './voice.js';
const setupMessage = 'Voice rewriting needs Firebase AI Logic enabled for this project. Open Firebase Console → AI Logic → Get started and select the Gemini Developer API. Keep using the standard tailoring option while setup is completed.';
export async function rewriteInYourVoice(resume, job, sample) {
  const request = prepareVoiceRequest(resume, job, sample);
  let config;
  try {
    const response = await fetch('/__/firebase/init.json');
    if (!response.ok) throw new Error('No Firebase web configuration');
    config = await response.json();
    if (config.projectId !== 'project-demo-c7a0d' || !config.apiKey || !config.appId) throw new Error('Missing web app configuration');
  } catch {
    throw new Error('Firebase web app configuration is unavailable. Register a Web app in Firebase Project settings, then redeploy Hosting. Standard tailoring still works.');
  }
  try {
    const app = getApps().find(app => app.name === 'resume-voice') || initializeApp(config, 'resume-voice');
    const ai = getAI(app, {backend: new GoogleAIBackend()});
    const model = getGenerativeModel(ai, {model: 'gemini-2.5-flash', systemInstruction: VOICE_INSTRUCTIONS, generationConfig: {responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 16000}});
    const result = await model.generateContent(request.payload);
    let data;
    try { data = JSON.parse(result.response.text()); }
    catch { throw new Error('The AI did not return a complete draft. Try a shorter resume or try again.'); }
    return applyVoiceResponse(request, data);
  } catch (error) {
    const code = String(error.code || '');
    if (/api-not-enabled|api-key|permission|fetch-error/.test(code)) throw new Error(setupMessage);
    if (/quota|resource-exhausted|429/.test(code) || /429/.test(error.message)) throw new Error('The AI service is busy or its quota was reached. Try again later, or use standard tailoring.');
    if (code.startsWith('AI/') || code.startsWith('ai/') || /^AI:/.test(error.message || '')) throw new Error('Voice rewriting could not complete. Check Firebase AI Logic setup and quota, or use standard tailoring.');
    throw error;
  }
}
