/* 学习页面的公共能力：链接、统计与原生对话框。 */
window.KQ = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gradeOf = name => KAIQIAO.juniorCategories.some(c => c.items.includes(name)) ? 'junior' : 'senior';
  const techHref = name => `techniques.html?${new URLSearchParams({g:gradeOf(name),tech:name})}`;
  const questionHref = question => `questions.html?${new URLSearchParams({g:question.grade,question:question.id})}`;
  const related = name => KAIQIAO.questions.filter(q => q.techniques.includes(name));
  const stats = {details:Object.keys(KAIQIAO.techDetail).length,questions:KAIQIAO.questions.length,modules:KAIQIAO.modules.length};
  let onClose = null;
  function show(title, content, closeCallback) {
    const dialog = document.getElementById('detail-dialog');
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-body').innerHTML = content;
    onClose = closeCallback;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.dialog-body').scrollTop = 0;
    document.body.classList.add('dialog-open');
  }
  function techBody(name) {
    const d = KAIQIAO.techDetail[name];
    if (!d) return '<p class="notice">此条目目前仅作目录展示，暂无公开详解。可关闭后选择标注“公开详解”的方法开始学习。</p>';
    const qs = related(name);
    return `<p class="detail-tagline">${escape(d.tagline)}</p>
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
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{ if(event.target===dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} });
    dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');onClose?.();onClose=null;});
  });
  return {escape,gradeOf,techHref,questionHref,related,stats,show,techBody};
})();
