const assert = require('node:assert/strict');

// 当前发布流程只允许学习示例；原卷认证必须另行评审，不能只改一个显示字符串。
function validateSources(questions) {
  for (const q of questions) {
    assert(q.source && ['unverified', 'teaching-example'].includes(q.source.status), `${q.id}: 非法或缺失的来源状态`);
    for (const key of ['year', 'province', 'sourceStatus']) {
      assert(!Object.hasOwn(q, key), `${q.id}: ${key} 必须从公开题目字段移除`);
    }
    if (q.source.status === 'unverified') {
      const label = q.source.originalLabel;
      assert(label && /^\d{4}$/.test(label.year) && typeof label.paper === 'string' && label.paper.trim(), `${q.id}: 缺少待核对的历史标签`);
    } else {
      assert(!q.source.originalLabel, `${q.id}: 本站教学示例不得携带原卷标签`);
    }
  }
}
module.exports = { validateSources };
