const assert = require('node:assert/strict');

// 来源分层（见 SOURCE_POLICY.md）：本站教学示例 / 维护者确认高考真题 / 与维护者题库一致 / 据维护者题库改编 / 出处待核对。
// 官方原卷核验状态仍未启用；没有官方材料时不能只改一个显示字符串就宣称"官方核验"。
const STATUSES = ['unverified', 'teaching-example', 'exam-confirmed', 'bank-original', 'bank-adapted'];
function validateSources(questions) {
  for (const q of questions) {
    assert(q.source && STATUSES.includes(q.source.status), `${q.id}: 非法或缺失的来源状态`);
    for (const key of ['year', 'province', 'sourceStatus']) {
      assert(!Object.hasOwn(q, key), `${q.id}: ${key} 必须从公开题目字段移除`);
    }
    const label = q.source.originalLabel;
    if (q.source.status === 'teaching-example') {
      assert(!label, `${q.id}: 本站教学示例不得携带原卷标签`);
      assert(!q.source.bankRef && !q.source.adaptation, `${q.id}: 本站教学示例不得携带题库核对字段`);
      continue;
    }
    assert(label && /^\d{4}$/.test(label.year) && typeof label.paper === 'string' && label.paper.trim(), `${q.id}: 缺少年份与卷名标签`);
    if (q.source.status === 'unverified' || q.source.status === 'exam-confirmed') {
      assert(!q.source.bankRef && !q.source.adaptation, `${q.id}: 该状态不得携带题库核对字段`);
      if (q.source.status === 'exam-confirmed') assert(q.grade === 'senior', `${q.id}: 维护者确认高考真题只用于高中题`);
      continue;
    }
    const ref = q.source.bankRef;
    assert(ref && typeof ref.bank === 'string' && ref.bank.trim() && Number.isInteger(ref.id) && typeof ref.label === 'string' && ref.label.trim() && /^\d{4}-\d{2}-\d{2}$/.test(ref.checkedOn), `${q.id}: 题库核对题目缺少 bankRef（bank / id / label / checkedOn）`);
    if (q.source.status === 'bank-adapted') {
      assert(typeof q.source.adaptation === 'string' && q.source.adaptation.trim(), `${q.id}: 据题库改编的题目必须写明差异（adaptation）`);
    } else {
      assert(!q.source.adaptation, `${q.id}: 与题库一致的题目不应有改编说明`);
    }
  }
}
module.exports = { validateSources, STATUSES };
