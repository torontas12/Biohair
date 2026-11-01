(() => {
 const data=JSON.parse(document.querySelector('#publication-data').textContent), form=document.querySelector('#library-filters'), search=document.querySelector('#publication-search');
 const labels={bimatoprost:'Bimatoprost',tofacitinib:'Tofacitinib / JAK Inhibitors',finasteride:'Finasteride',melatonin:'Melatonin'};
 const images={bimatoprost:'research-bimatoprost.webp',tofacitinib:'research-tofacitinib.webp',finasteride:'research-finasteride.webp',melatonin:'research-melatonin.webp'};
 const fields={year:'year',route:'route',type:'study_type',indication:'indication'};
 const params=new URLSearchParams(location.search);let ingredient=Object.hasOwn(labels,params.get('ingredient'))?params.get('ingredient'):'';let page=1;
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normalize=v=>String(v??'').toLocaleLowerCase().normalize('NFKD');
 const verified=x=>x.verification.startsWith('Verified from');
 Object.entries(fields).forEach(([name,key])=>{const select=document.querySelector('#filter-'+name);select.replaceChildren(new Option('All '+(name==='type'?'study types':name+'s'),''));[...new Set(data.map(x=>x[key]).filter(Boolean))].sort((a,b)=>name==='year'?b-a:String(a).localeCompare(String(b))).forEach(v=>select.add(new Option(v,v)));});
 const card=x=>`<article class="publication-card" id="study-${escape(x.id)}"><div class="publication-thumb art-${escape(x.ingredient)}" aria-hidden="true"></div><div class="publication-content"><div class="publication-meta"><span>${escape(labels[x.ingredient])}</span><span>${escape(x.year||'Year unresolved')}</span><span>${escape(x.journal)}</span></div><h3>${escape(x.title)}</h3><div class="evidence-tags"><span>${escape(x.evidence_label)}</span><span class="${verified(x)?'verified':'pending'}">${verified(x)?'Full-text PDF checked':'Primary verification pending'}</span></div>${x.provisional_category?'<p class="provisional-note">Temporary Melatonin filing only — this citation is not established as melatonin research.</p>':''}<p class="publication-excerpt">${escape(x.study_type==='Unresolved citation'?'Recovered secondary citation; publication identity, evidence type and bibliographic details require primary verification.':x.summary)}</p><p class="doi">${x.doi?'DOI: '+escape(x.doi):'DOI / PMID: not verified'}</p><div class="publication-actions">${x.url?`<a href="${escape(x.url)}" target="_blank" rel="noopener noreferrer">Read Publication ↗</a>`:'<span>Publication URL unresolved</span>'}<details><summary>View Summary</summary><p>${escape(x.authors)}</p><p>${escape(x.summary)}</p><dl><dt>Route / indication</dt><dd>${escape(x.route+' · '+x.indication)}</dd><dt>Population</dt><dd>${escape(x.population)}</dd><dt>Concentration / regimen</dt><dd>${escape(x.concentration)}</dd></dl><p><strong>Limitations:</strong> ${escape(x.limitations)}</p><p>${escape(x.verification)}</p><p>Source: ${escape(x.source)}</p>${x.doi_candidate?'<p>Unverified OCR DOI candidate: '+escape(x.doi_candidate)+'</p>':''}</details></div></div></article>`;
 function eligible(x){const q=normalize(search.value.trim());return (!q||normalize([x.title,x.authors,x.doi,x.pmid,x.summary,x.ingredient].join(' ')).includes(q))&&Object.entries(fields).every(([name,key])=>!document.querySelector('#filter-'+name).value||String(x[key])===document.querySelector('#filter-'+name).value)&&(!document.querySelector('#verified-only').checked||verified(x));}
 function render(){
  const pool=data.filter(eligible),matches=pool.filter(x=>!ingredient||x.ingredient===ingredient),pages=Math.max(1,Math.ceil(matches.length/5));page=Math.max(1,Math.min(page,pages));const start=(page-1)*5,shown=matches.slice(start,start+5);
  document.querySelector('#publication-results').innerHTML=shown.length?shown.map(card).join(''):'<p>No matching publications. Try clearing the filters.</p>';
  document.querySelector('#results-count').textContent=matches.length?`Showing ${start+1}–${start+shown.length} of ${matches.length} candidate records`:'No matching records';
  document.querySelector('#page-status').textContent=`Page ${page} of ${pages}`;
  document.querySelector('#active-ingredient').textContent=ingredient?labels[ingredient]:'All ingredients';
  document.querySelector('#previous-page').disabled=page===1;document.querySelector('#next-page').disabled=page===pages;
  document.querySelector('#numbered-pages').innerHTML=Array.from({length:pages},(_,i)=>i+1).filter(n=>pages<=7||n===1||n===pages||Math.abs(n-page)<=1).map((n,i,a)=>(i&&n-a[i-1]>1?'<span aria-hidden="true">…</span>':'')+`<button type="button" data-page="${n}" aria-label="Page ${n}" ${n===page?'aria-current="page"':''}>${n}</button>`).join('');
  document.querySelectorAll('.ingredient-filter').forEach(b=>{const key=b.dataset.ingredient;b.setAttribute('aria-pressed',String(key===ingredient));b.querySelector('.category-count').textContent=key?pool.filter(x=>x.ingredient===key).length:pool.length;});
  document.querySelector('#library-total').textContent=data.length+' Candidate Records';
  document.querySelector('#verified-total').textContent=data.filter(verified).length+' full-text PDFs checked';
  document.querySelectorAll('[data-category-count]').forEach(el=>el.textContent=data.filter(x=>x.ingredient===el.dataset.categoryCount).length);
 }
 function update(){page=1;render();const q=new URLSearchParams();if(ingredient)q.set('ingredient',ingredient);if(search.value.trim())q.set('q',search.value.trim());history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash);}
 search.value=params.get('study')||params.get('q')||'';
 form.addEventListener('submit',e=>{e.preventDefault();update();});form.addEventListener('input',update);form.addEventListener('change',update);form.addEventListener('reset',()=>{ingredient='';setTimeout(update,0);});
 document.querySelectorAll('.ingredient-filter').forEach(b=>b.addEventListener('click',()=>{ingredient=b.dataset.ingredient;update();}));
 function turn(n){page=n;render();document.querySelector('.library-status').scrollIntoView({block:'start',behavior:'instant'});}
 document.querySelector('#previous-page').addEventListener('click',()=>turn(page-1));document.querySelector('#next-page').addEventListener('click',()=>turn(page+1));document.querySelector('#numbered-pages').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)turn(Number(b.dataset.page));});
 render();
})();
