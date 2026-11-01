(() => {
  const data = JSON.parse(document.getElementById('publication-data').textContent);
  const form = document.getElementById('library-filters');
  const search = document.getElementById('publication-search');
  const fields = {year:'year',route:'route',type:'study_type',indication:'indication'};
  const ingredientButtons = [...document.querySelectorAll('.ingredient-filter')];
  const results = document.getElementById('publication-results');
  const params = new URLSearchParams(location.search);
  let ingredient = ingredientButtons.some(b=>b.dataset.ingredient===params.get('ingredient')) ? params.get('ingredient') : '';
  let page = 1;
  const perPage = 6;
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = v => String(v ?? '').toLocaleLowerCase().normalize('NFKD');
  const titleCase = v => v.charAt(0).toUpperCase()+v.slice(1);
  const isVerified = x => x.verification.startsWith('Verified from');
  const card = x => `<article class="publication-card" id="study-${escape(x.id)}"><div class="publication-meta"><span>${escape(titleCase(x.ingredient))}</span><span>${escape(x.year||'Year pending')}</span><span>${escape(x.study_type)}</span></div><h3>${escape(x.title)}</h3><p class="citation-authors">${escape(x.authors)}</p><p class="journal">${escape(x.journal)}</p><p class="verification ${isVerified(x)?'verified':'pending'}">${isVerified(x)?'Full-text PDF checked':'Citation verification pending'}</p><dl class="study-facts"><div><dt>Route / indication</dt><dd>${escape(x.route+' · '+x.indication)}</dd></div><div><dt>Population</dt><dd>${escape(x.population)}</dd></div><div><dt>Concentration / regimen</dt><dd>${escape(x.concentration)}</dd></div></dl><p>${escape(x.summary)}</p><div class="study-limitations"><strong>Limitations</strong><p>${escape(x.limitations)}</p></div><p class="doi">${x.doi?'DOI: '+escape(x.doi):'DOI / PMID: not yet verified'}</p><a class="publication-link" href="${escape(x.url)}" target="_blank" rel="noopener noreferrer">${x.doi?'Original publication':'Find original citation on PubMed'} <span aria-hidden="true">↗</span><span class="sr-only"> (opens a new tab)</span></a></article>`;
  function render() {
    const q = normalize(search.value.trim());
    const matches = data.filter(x => (!ingredient || x.ingredient===ingredient) && (!q || normalize([x.title,x.authors,x.doi,x.pmid,x.ingredient,x.indication,x.summary].join(' ')).includes(q)) && Object.entries(fields).every(([name,key])=>{const value=document.getElementById('filter-'+name).value;return !value||String(x[key])===value}) && (!document.getElementById('verified-only').checked || isVerified(x)));
    const pages = Math.max(1,Math.ceil(matches.length/perPage));page=Math.min(page,pages);
    const start=(page-1)*perPage, shown=matches.slice(start,start+perPage);
    results.innerHTML=shown.length ? shown.map(card).join('') : '<div class="empty-results"><h3>No matching publications</h3><p>Try another search term or clear the filters.</p></div>';
    document.getElementById('results-count').textContent=matches.length?`Showing ${start+1}–${start+shown.length} of ${matches.length} records`:'No matching records';
    document.getElementById('page-status').textContent=`Page ${page} of ${pages}`;
    document.getElementById('previous-page').disabled=page===1;
    document.getElementById('next-page').disabled=page===pages;
    document.getElementById('active-ingredient').textContent=ingredient?titleCase(ingredient)+(ingredient==='tofacitinib'?' / JAK':''):'All ingredients';
    ingredientButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ingredient===ingredient)));
  }
  function resetPage(){page=1;render()}
  function updateQuery(){const q=new URLSearchParams();if(ingredient)q.set('ingredient',ingredient);if(search.value.trim())q.set('q',search.value.trim());try{history.replaceState(null,'',location.pathname+(q.size?'?'+q.toString():'')+location.hash)}catch{}}
  search.value=params.get('study')||params.get('q')||'';
  form.addEventListener('submit',e=>{e.preventDefault();resetPage();updateQuery()});
  form.addEventListener('input',()=>{resetPage();updateQuery()});
  form.addEventListener('change',resetPage);
  form.addEventListener('reset',()=>{ingredient='';setTimeout(()=>{resetPage();updateQuery()},0)});
  ingredientButtons.forEach(b=>b.addEventListener('click',()=>{ingredient=ingredient===b.dataset.ingredient?'':b.dataset.ingredient;resetPage();updateQuery();document.getElementById('publications').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
  document.getElementById('previous-page').addEventListener('click',()=>{page--;render();document.querySelector('.library-status').scrollIntoView({block:'start'});});
  document.getElementById('next-page').addEventListener('click',()=>{page++;render();document.querySelector('.library-status').scrollIntoView({block:'start'});});
  render();
})();
