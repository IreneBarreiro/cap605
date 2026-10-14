import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareVoiceRequest, applyVoiceResponse, VOICE_INSTRUCTIONS} from './public/voice.js';
const sample = 'I like to explain my work in plain language. When I talk about a project, I start with what the team needed and how I helped. I keep things practical and clear so someone can follow along without knowing all the details.';
const resume = 'Irene\nDesigner — Example\n• Helped 12 customers.\n• Built prototypes.\n\nSKILLS\nResearch';
test('keeps the writing sample separate from factual resume evidence', () => {
  const request = prepareVoiceRequest(resume, 'Customer research', sample);
  const payload = JSON.parse(request.payload);
  assert.equal(payload.writingSampleForStyleOnly, sample);
  assert.equal(payload.resume, resume);
  assert.match(VOICE_INSTRUCTIONS, /STYLE ONLY/);
  assert.deepEqual(request.bullets, [{id: 2, text: 'Helped 12 customers.'}, {id: 3, text: 'Built prototypes.'}]);
});
test('applies only bullet rewrites and keeps headings, skills, and numbers', () => {
  const request = prepareVoiceRequest(resume, 'Customer research', sample);
  const response = {voiceSummary:'Direct and practical.', rewrites:[{id:3,text:'Created prototypes.'},{id:2,text:'Supported 12 customers.'}]};
  assert.equal(applyVoiceResponse(request,response).text,'Irene\nDesigner — Example\n• Supported 12 customers.\n• Created prototypes.\n\nSKILLS\nResearch');
});
test('rejects changed metrics, missing bullets, duplicate IDs, and multiline replacements', () => {
  const request = prepareVoiceRequest(resume, 'Customer research', sample);
  const result = rewrites => ({voiceSummary:'Direct.',rewrites});
  assert.throws(()=>applyVoiceResponse(request,result([{id:2,text:'Helped 20 customers.'},{id:3,text:'Built prototypes.'}])));
  assert.throws(()=>applyVoiceResponse(request,result([{id:2,text:'Helped 12 customers.'}])));
  assert.throws(()=>applyVoiceResponse(request,result([{id:2,text:'Helped 12 customers.'},{id:2,text:'Helped 12 customers.'}])));
  assert.throws(()=>applyVoiceResponse(request,result([{id:2,text:'Helped 12 customers.'},{id:3,text:'Built prototypes.\nNew employer'}])));
});
test('requires a useful sample and experience bullets before contacting the AI',()=>{
  assert.throws(()=>prepareVoiceRequest(resume,'Design','Too short'));
  assert.throws(()=>prepareVoiceRequest('No bullets','Design',sample));
});
