const menu=document.querySelector('.nav-menu'), nav=document.querySelector('.navlinks');
function closeMenu(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('is-open',open);});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('is-open')){closeMenu();menu.focus();}});
window.matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
document.querySelectorAll('#science .read-toggle').forEach(button=>button.addEventListener('click',()=>{const content=document.getElementById(button.getAttribute('aria-controls'));const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));content.hidden=!open;button.closest('.ingredient-card').classList.toggle('is-expanded',open);button.textContent=open?'Read Less  −':'Read More  +';}));
document.querySelector('.inquiry-form')?.addEventListener('submit',e=>e.preventDefault());
