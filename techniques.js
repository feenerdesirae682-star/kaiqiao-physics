document.getElementById('nav').innerHTML = renderNav('techniques');
document.getElementById('footer').innerHTML = renderFooter();
const params = new URLSearchParams(location.search);
let grade = params.get('g')==='junior'?'junior':'senior';
let query = params.get('q') || '';
let onlyPublic = params.get('scope')!=='all';
const search = document.getElementById('search');
const scope = document.getElementById('only-public');
search.value=query; scope.checked=onlyPublic;
function sync() {
  params.set('g',grade);
  query ? params.set('q',query) : params.delete('q');
  onlyPublic ? params.delete('scope') : params.set('scope','all');
  history.replaceState(null,'',`${location.pathname}?${params}`);
}
function render() {
  document.querySelectorAll('[data-grade]').forEach(b=>{const selected=b.dataset.grade===grade;b.classList.toggle('on',selected);b.setAttribute('aria-pressed',selected);});
  const categories=grade==='junior'?KAIQIAO.juniorCategories:KAIQIAO.seniorCategories;
  const all=categories.flatMap(c=>c.items);
  document.getElementById('availability').textContent=`本学段 ${all.filter(n=>KAIQIAO.techDetail[n]).length} 个公开详解 / ${all.length} 个目录条目`;
  let count=0;
  document.getElementById('cats').innerHTML=categories.map(cat=>{
    const items=cat.items.filter(name=>{
      const d=KAIQIAO.techDetail[name];
      return (!onlyPublic||d) && `${name} ${d?.tagline||''} ${cat.title}`.toLowerCase().includes(query.toLowerCase());
    });
    count+=items.length;
    if(!items.length)return '';
    return `<section class="category"><h2>${KQ.escape(cat.title)} <small>${items.length}</small></h2><p>${KQ.escape(cat.sub)}</p><ul>${items.map(name=>`<li><a class="tech-row" data-tech="${KQ.escape(name)}" href="${KQ.escape(KQ.techHref(name))}"><span><strong>${KQ.escape(name)}</strong><small>${KQ.escape(KAIQIAO.techDetail[name]?.tagline||'当前仅作目录展示，暂无公开详解')}</small></span><span class="status-label ${KAIQIAO.techDetail[name]?'published':''}">${KAIQIAO.techDetail[name]?'公开详解 →':'目录'}</span></a></li>`).join('')}</ul></section>`;
  }).join('');
  document.getElementById('count').textContent=`找到 ${count} 个条目`;
  document.getElementById('empty').hidden=count>0;
}
function openTech(name) {
  const all=[...KAIQIAO.juniorCategories,...KAIQIAO.seniorCategories].flatMap(c=>c.items);
  if(!all.includes(name)) { document.getElementById('page-notice').hidden=false; params.delete('tech'); sync();return; }
  grade=KQ.gradeOf(name);params.set('tech',name);sync();render();
  KQ.show(name,KQ.techBody(name),()=>{params.delete('tech');sync();});
}
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{grade=b.dataset.grade;sync();render();}));
search.addEventListener('input',()=>{query=search.value.trim();sync();render();});
scope.addEventListener('change',()=>{onlyPublic=scope.checked;sync();render();});
document.getElementById('reset-filters').addEventListener('click',()=>{query='';search.value='';onlyPublic=true;scope.checked=true;sync();render();search.focus();});
document.getElementById('cats').addEventListener('click',e=>{const a=e.target.closest('[data-tech]');if(a && !e.ctrlKey && !e.metaKey && !e.shiftKey){e.preventDefault();openTech(a.dataset.tech);}});
render();
if(params.has('tech'))openTech(params.get('tech'));
