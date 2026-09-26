const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateSources } = require('./source-policy.cjs');
const example = () => ({ id: 'test', grade: 'senior', source: { status: 'unverified', originalLabel: { year: '2025', paper: '历史标签' } } });
const bank = status => ({ id: 'bank', grade: 'senior', source: { status, originalLabel: { year: '2025', paper: '历史标签' }, bankRef: { bank: '维护者题库', id: 1, label: '2025·某卷', checkedOn: '2026-09-25' }, ...(status === 'bank-adapted' ? { adaptation: '选项改写' } : {}) } });
const confirmed = () => ({ id: 'exam', grade: 'senior', source: { status: 'exam-confirmed', originalLabel: { year: '2024', paper: '某卷' } } });
test('允许明确标注的待核对题目和本站示例', () => {
  validateSources([example(), { id: 'local', source: { status: 'teaching-example' } }]);
});
test('允许带完整 bankRef 的题库核对题目与维护者确认的高考题', () => {
  validateSources([bank('bank-original'), bank('bank-adapted'), confirmed()]);
});
test('阻止未提供来源状态的题目', () => assert.throws(() => validateSources([{ id: 'missing' }])));
test('阻止把状态直接改成官方核验', () => {
  for (const status of ['verified', 'verified-original', 'verified-adapted', 'official-verified']) {
    const q = example(); q.source.status = status;
    assert.throws(() => validateSources([q]));
  }
});
test('阻止恢复误导性的顶层年份、卷名及自由文本状态', () => {
  for (const key of ['year', 'province', 'sourceStatus']) {
    const q = example(); q[key] = '原卷原题';
    assert.throws(() => validateSources([q]));
  }
});
test('阻止丢失年份卷名标签或把带标签题目改称本站原创', () => {
  const q = example(); delete q.source.originalLabel;
  assert.throws(() => validateSources([q]));
  const other = example(); other.source.status = 'teaching-example';
  assert.throws(() => validateSources([other]));
  const c = confirmed(); delete c.source.originalLabel;
  assert.throws(() => validateSources([c]));
});
test('维护者确认高考真题只用于高中题，且不带题库字段', () => {
  const a = confirmed(); a.grade = 'junior';
  assert.throws(() => validateSources([a]));
  const b = confirmed(); b.source.bankRef = bank('bank-original').source.bankRef;
  assert.throws(() => validateSources([b]));
});
test('题库核对题目缺少 bankRef、日期格式错误或丢失历史标签都被拒绝', () => {
  const a = bank('bank-original'); delete a.source.bankRef;
  assert.throws(() => validateSources([a]));
  const b = bank('bank-original'); b.source.bankRef.checkedOn = '2026/9/25';
  assert.throws(() => validateSources([b]));
  const c = bank('bank-original'); delete c.source.originalLabel;
  assert.throws(() => validateSources([c]));
});
test('据题库改编必须写差异；与题库一致不得带改编说明；待核对题不得带题库字段', () => {
  const a = bank('bank-adapted'); delete a.source.adaptation;
  assert.throws(() => validateSources([a]));
  const b = bank('bank-original'); b.source.adaptation = '多余';
  assert.throws(() => validateSources([b]));
  const c = example(); c.source.bankRef = bank('bank-original').source.bankRef;
  assert.throws(() => validateSources([c]));
});
