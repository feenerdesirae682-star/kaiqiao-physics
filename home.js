document.getElementById('nav').innerHTML = renderNav('home');
document.getElementById('footer').innerHTML = renderFooter();
document.querySelectorAll('[data-stat]').forEach(el => {
  el.dataset.target = KQ.stats[el.dataset.stat];
  el.textContent = el.dataset.target;
});
const picks = ['运动学知三求二法','圆锥摆等高等时律','弹性碰撞双极值定论','人船模型位移反比律','天体高低轨定性口诀','理想气体温体双看法','冰化水液面升降速判','电表示数变化量比值法'];
document.getElementById('tech-preview').innerHTML = picks.map((name,i) => `<a class="preview-tech" href="${KQ.escape(KQ.techHref(name))}">
  <div class="kicker">${KQ.gradeOf(name)==='junior'?'初中':'高中'} · ${String(i+1).padStart(2,'0')}</div><h3>${KQ.escape(name)}</h3>
  <p>${KQ.escape(KAIQIAO.techDetail[name].tagline)}</p><span class="detail-tagline">公开详解 · 阅读 →</span></a>`).join('');
document.getElementById('modules-list').innerHTML = KAIQIAO.modules.slice(0,6).map(m=>`<a class="module-card" href="questions.html?${new URLSearchParams({g:m.level,module:m.title})}#knowledge"><span class="kicker">${m.level==='junior'?'初中':'高中'} · ${m.points.length} 个知识点</span><h3>${KQ.escape(m.title)}</h3><p>${m.points.slice(0,3).map(p=>KQ.escape(p.name)).join(' · ')}</p><span>浏览知识点 →</span></a>`).join('');
const featured = KAIQIAO.questions.find(q=>q.id==='conical-pendulum');
document.getElementById('featured-question').innerHTML=`<a class="featured-card" href="${KQ.escape(KQ.questionHref(featured))}"><span class="chip red">高中 · 学习示例</span><h3>${KQ.escape(featured.topic)}</h3><p>${KQ.escape(featured.content)}</p><span>先独立尝试，再展开解析 →</span></a>`;
document.getElementById('testi').innerHTML=KAIQIAO.testimonials.map(t=>`<figure class="testimonial"><blockquote>“${KQ.escape(t.quote)}”</blockquote><figcaption>— ${KQ.escape(t.name)}<small>${KQ.escape(t.school)}</small></figcaption></figure>`).join('');
const items=[`${KQ.stats.details} 个公开大招详解`,`${KQ.stats.questions} 道学习示例`,`${KQ.stats.modules} 个知识模块`,'先看条件 · 再学方法 · 最后练习','初中与高中分学段浏览'];
document.getElementById('ticker').innerHTML=Array(2).fill(items.map(t=>`<span>${t}<span class="dot"> ◆ </span></span>`).join('')).join('');

