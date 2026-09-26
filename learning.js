/* 学习页面的公共能力：链接、统计与原生对话框。 */
window.KQ = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gradeOf = name => KAIQIAO.juniorCategories.some(c => c.items.includes(name)) ? 'junior' : 'senior';
  const techHref = name => `techniques.html?${new URLSearchParams({g:gradeOf(name),tech:name})}`;
  const questionHref = question => `questions.html?${new URLSearchParams({g:question.grade,question:question.id})}`;
  const related = name => KAIQIAO.questions.filter(q => q.techniques.includes(name));
  // 未知状态按待核对处理；原始年份/卷名、题库条目仅供维护者记录，不对学生展示。来源分层见 SOURCE_POLICY.md。
  const SOURCE_LABEL = { 'teaching-example': '本站教学示例', 'exam-confirmed': '高考真题 · 维护者确认', 'bank-original': '高考真题 · 与维护者题库一致', 'bank-adapted': '高考真题改编 · 据维护者题库整理' };
  const SOURCE_NOTICE = {
    'teaching-example': '本题为本站编写的教学示例，不标称试卷原题。',
    'exam-confirmed': '该题由本站维护者确认为高考真题。目前未附官方原卷链接；年份和卷名按维护者资料记录。',
    'bank-original': '该题由本站维护者确认为高考真题，并已与维护者自有题库中的同卷题目逐字核对，题干、选项与答案一致。目前未附官方原卷链接；年份和卷名按维护者资料记录。',
    'bank-adapted': '该题据高考真题改编，母题按维护者自有题库整理，设问或选项有改动，改动后的答案已重新验算。目前未附官方原卷链接；年份和卷名按维护者资料记录。'
  };
  const sourceLabel = q => SOURCE_LABEL[q.source?.status] || '出处待核对';
  const sourceNotice = q => SOURCE_NOTICE[q.source?.status] || '本题按本站现有题干整理，尚未核对原卷、题号及原卷答案；请作为学习示例使用。';
  const stats = {details:Object.keys(KAIQIAO.techDetail).length,questions:KAIQIAO.questions.length,modules:KAIQIAO.modules.length};
  let onClose = null;
  let trigger = null;
  function finishClose() {
    document.body.classList.remove('dialog-open');
    const callback = onClose;
    onClose = null;
    callback?.();
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
    trigger = null;
  }
  function closeDetail(dialog) {
    if (typeof dialog.showModal === 'function') dialog.close();
    else { dialog.removeAttribute('open'); finishClose(); }
  }
  function show(title, content, closeCallback) {
    const dialog = document.getElementById('detail-dialog');
    if (!dialog.hasAttribute('open')) trigger = document.activeElement;
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-body').innerHTML = content;
    onClose = closeCallback;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('dialog-open');
    } else {
      // 无原生 dialog 时降级为可关闭的页内阅读区，不伪装成模态窗口。
      dialog.classList.add('dialog-fallback');
      dialog.setAttribute('role', 'region');
      dialog.setAttribute('open', '');
      dialog.scrollIntoView({block:'start'});
      dialog.querySelector('[data-close]').focus({preventScroll:true});
    }
    dialog.querySelector('.dialog-body').scrollTop = 0;
  }
  function techBody(name) {
    const d = KAIQIAO.techDetail[name];
    if (!d) return '<p class="notice">此条目目前仅作目录展示，暂无公开详解。可关闭后选择标注“公开详解”的方法开始学习。</p>';
    const qs = related(name);
    return `${d.reviewStatus === 'draft' ? '<p class="source-note">此方法来自内容扩充批次，尚未完成适用条件和推导的逐条教研审校；当前作为方法草稿展示。</p>' : ''}<p class="detail-tagline">${escape(d.tagline)}</p>
      <div class="condition-box"><h3>先看适用条件</h3><p>${escape(d.conditions)}</p></div>
      <div class="modal-section"><h3>解决什么问题</h3><p>${escape(d.explanation)}</p></div>
      <div class="modal-section"><h3>母题与推导</h3><div class="pre">${escape(d.example).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div></div>
      <div class="modal-section summary"><h3>方法小结</h3><div class="pre">${escape(d.summary)}</div></div>
      ${d.reference ? `<p class="reading-note">推导参考：<a href="${escape(d.reference.url)}" target="_blank" rel="noopener noreferrer">${escape(d.reference.title)} ↗</a></p>` : ''}
      <div class="practice-next"><div class="kicker">下一步 · 独立练习</div><h3>${qs.length ? '用一道例题检验理解' : '先独立重做上面的母题'}</h3>
      ${qs.length ? qs.map(q=>`<a class="related-link" href="${escape(questionHref(q))}"><span>${escape(q.topic)}</span><span>去练习 →</span></a>`).join('') : '<p>此方法暂未配套独立例题。遮住推导重做母题，检查自己是否能说明每一步的条件。</p>'}</div>`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-count]').forEach(el => el.textContent = stats[el.dataset.count]);
    const dialog = document.getElementById('detail-dialog');
    if (!dialog) return;
    dialog.querySelector('[data-close]').addEventListener('click',()=>closeDetail(dialog));
    dialog.addEventListener('click',event=>{ if(event.target===dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDetail(dialog);} });
    dialog.addEventListener('close',finishClose);
    dialog.addEventListener('keydown',event=>{if(event.key==='Escape' && dialog.classList.contains('dialog-fallback'))closeDetail(dialog);});
  });
  return {escape,gradeOf,techHref,questionHref,related,stats,show,techBody,sourceLabel,sourceNotice};
})();

