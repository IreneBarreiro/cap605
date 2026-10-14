import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tailor} from './public/tailor.js';
test('prioritizes relevant experience within the original role without changing wording', () => {
  const resume = 'Irene\nDesigner — A\n• Created illustrations.\n• Led customer research.\n\nDesigner — B\n• Built prototypes.';
  const result = tailor(resume, 'Customer research and prototypes');
  assert.equal(result.text, 'Irene\nDesigner — A\n• Led customer research.\n• Created illustrations.\n\nDesigner — B\n• Built prototypes.');
  assert.deepEqual(result.text.split('\n').sort(), resume.split('\n').sort());
});
test('reports missing terms without inserting unsupported skills', () => {
  const result = tailor('• Built prototypes.', 'Prototypes and Python');
  assert.deepEqual(result.matched, ['prototypes']);
  assert.deepEqual(result.missing, ['python']);
  assert.equal(result.text, '• Built prototypes.');
});
test('preserves stable order for equal scores and rejects empty input', () => {
  assert.equal(tailor('• First task.\n• Second task.', 'Design').text, '• First task.\n• Second task.');
  assert.throws(() => tailor('', 'Design'));
  assert.throws(() => tailor('Resume', '  '));
});
