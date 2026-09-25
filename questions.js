document.getElementById('nav').innerHTML = renderNav('questions');
document.getElementById('footer').innerHTML = renderFooter();
const params=new URLSearchParams(location.search);
let grade=['junior','senior'].includes(params.get('g'))?params.get('g'):'all';
let query=params.get('q')||'';
let technique=params.get('tech')||'';
let moduleName=params.get('module')||'';
const search=document.getElementById('question-search');
search.value=query;
function sync(){
  params.set('g',grade);
  for(const [key,val] of [['q',query],['tech',technique],['module',moduleName]])val?params.set(key,val):params.delete(key);
  history.replaceState(null,'',`${location.pathname}?${params}${location.hash}`);
}
function render(){
  document.querySelectorAll('[data-grade]').forEach(b=>{const selected=b.dataset.grade===grade;b.classList.toggle('on',selected);b.setAttribute('aria-pressed',selected);});
  const list=KAIQIAO.questions.filter(q=>(grade==='all'||q.grade===grade)&&(!technique||q.techniques.includes(technique))&&(!moduleName||q.knowledgeModule===moduleName)&&`${q.topic} ${q.module} ${q.content}`.toLowerCase().includes(query.toLowerCase()));
  document.getElementById('question-count').textContent=`找到 ${list.length} 道学习示例`;
  document.getElementById('qgrid').innerHTML=list.map(q=>`<button class="qcard" data-question="${q.id}" aria-haspopup="dialog"><span class="chip ${q.grade==='senior'?'red':''}">${q.grade==='junior'?'初中':'高中'} · ${KQ.escape(KQ.sourceLabel(q))}</span><h2>${KQ.escape(q.topic)}</h2><p>${KQ.escape(q.content.split('\n')[0].slice(0,110))}${q.content.length>110?'…':''}</p><span class="card-end">${q.techniques.length?'已关联大招':'含解题过程'} <b>开始练习 →</b></span></button>`).join('');
  document.getElementById('empty').hidden=list.length>0;
  document.getElementById('active-filter').hidden=!technique&&!moduleName;
  document.getElementById('active-filter-label').textContent=technique?`关联大招：${technique}`:`知识模块：${moduleName}`;
  document.getElementById('modules').innerHTML=KAIQIAO.modules.filter(m=>grade==='all'||m.level===grade).map(m=>`<details class="module-card" ${m.title===moduleName?'open':''}><summary><span class="kicker">${m.level==='junior'?'初中':'高中'} · ${m.points.length} 个知识点</span><h3>${KQ.escape(m.title)}</h3></summary><dl>${m.points.map(p=>`<dt>${KQ.escape(p.name)}</dt><dd>${KQ.escape(p.desc)}</dd>`).join('')}</dl><button class="btn ghost module-filter" data-module="${KQ.escape(m.title)}">查看本模块例题 →</button></details>`).join('');
}
function openQuestion(id){
  const q=KAIQIAO.questions.find(q=>q.id===id);
  if(!q){document.getElementById('page-notice').hidden=false;params.delete('question');sync();return;}
  params.set('question',q.id);sync();
  KQ.show(q.topic,`<p class="reading-note">${q.grade==='junior'?'初中':'高中'} · ${KQ.escape(q.module)} · ${KQ.escape(KQ.sourceLabel(q))}</p>
    <p class="source-note">${KQ.escape(KQ.sourceNotice(q))}</p>
    <div class="condition-box"><h3>先独立尝试</h3><p>先读题并写出思路，准备好后再展开解析。</p></div>
    <div class="modal-section"><h3>题目</h3><div class="pre">${KQ.escape(q.content)}</div></div>
    <details class="answer"><summary>我已尝试，展开解析</summary><div class="pre">${KQ.escape(q.analysis)}</div></details>
    <div class="practice-next"><div class="kicker">下一步 · 复盘方法</div><h3>${q.techniques.length?'回到对应大招':'回顾相关知识模块'}</h3>${q.techniques.length?q.techniques.map(n=>`<a class="related-link" href="${KQ.escape(KQ.techHref(n))}"><span>${KQ.escape(n)}</span><span>阅读 →</span></a>`).join(''):`<a class="related-link" href="questions.html?${new URLSearchParams({g:q.grade,module:q.knowledgeModule})}#knowledge"><span>${KQ.escape(q.knowledgeModule)}</span><span>复习 →</span></a>`}</div>`,()=>{params.delete('question');sync();});
}
function clear(){query='';technique='';moduleName='';search.value='';sync();render();}
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{grade=b.dataset.grade;technique='';moduleName='';sync();render();}));
search.addEventListener('input',()=>{query=search.value.trim();sync();render();});
document.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',clear));
document.getElementById('qgrid').addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(b)openQuestion(b.dataset.question);});
document.getElementById('modules').addEventListener('click',e=>{const b=e.target.closest('[data-module]');if(!b)return;moduleName=b.dataset.module;query='';technique='';search.value='';sync();render();document.getElementById('practice').scrollIntoView();document.getElementById('question-search').focus({preventScroll:true});});
render();
if(params.has('question'))openQuestion(params.get('question'));

