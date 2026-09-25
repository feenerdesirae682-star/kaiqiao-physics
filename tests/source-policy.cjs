const assert = require('node:assert/strict');

// 当前发布流程只允许学习示例：待核对 / 本站教学示例 / 与维护者题库一致 / 据维护者题库改编。
// 官方原卷认证必须另行评审，不能只改一个显示字符串。
const STATUSES = ['unverified', 'teaching-example', 'bank-original', 'bank-adapted'];
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
    assert(label && /^\d{4}$/.test(label.year) && typeof label.paper === 'string' && label.paper.trim(), `${q.id}: 缺少待核对的历史标签`);
    if (q.source.status === 'unverified') {
      assert(!q.source.bankRef && !q.source.adaptation, `${q.id}: 待核对题目不得携带题库核对字段`);
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
