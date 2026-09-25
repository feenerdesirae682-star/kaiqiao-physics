const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateSources } = require('./source-policy.cjs');
const example = () => ({ id: 'test', source: { status: 'unverified', originalLabel: { year: '2025', paper: '历史标签' } } });
test('允许明确标注的待核对题目和本站示例', () => {
  validateSources([example(), { id: 'local', source: { status: 'teaching-example' } }]);
});
test('阻止未提供来源状态的题目', () => assert.throws(() => validateSources([{ id: 'missing' }])));
test('阻止把状态直接改成已核对', () => {
  const q = example(); q.source.status = 'verified';
  assert.throws(() => validateSources([q]));
});
test('阻止恢复误导性的顶层年份、卷名及自由文本状态', () => {
  for (const key of ['year', 'province', 'sourceStatus']) {
    const q = example(); q[key] = '原卷原题';
    assert.throws(() => validateSources([q]));
  }
});
test('阻止丢失核对线索或把待核对原卷改称本站原创', () => {
  const q = example(); delete q.source.originalLabel;
  assert.throws(() => validateSources([q]));
  const other = example(); other.source.status = 'teaching-example';
  assert.throws(() => validateSources([other]));
});

