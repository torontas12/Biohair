(() => {
  const base = document.querySelector('script[src$="shared.js"]').src;
  const url = path => new URL(path, base).pathname;
  const link = (path, text) => `<a href="${url(path)}">${text}</a>`;
  const logo = `<a class="bh-logo" href="${url('index.html')}" aria-label="BioHair X home"><span role="img" aria-label="BioHair X — The Ultimate Hair Loss Treatment"></span></a>`;
  document.querySelector('site-header').innerHTML = `<header class="bh-header"><div class="bh-header-inner">${logo}<button class="bh-menu" aria-expanded="false" aria-controls="bh-links" aria-label="Open navigation" type="button">☰</button><nav id="bh-links" aria-label="Main navigation">${link('index.html','Home')}${link('science.html','Science &amp; Research')}${link('physicians.html','For Physicians')}${link('blog.html','Blog')}${link('contact.html','Contact')}<a class="bh-button" href="${url('find-my-treatment/')}">Find My Treatment</a></nav></div></header>`;
  document.querySelector('site-footer').innerHTML = `<footer class="bh-footer"><div class="bh-footer-grid"><div>${logo}<p>Physician-directed topical hair restoration</p><p class="bh-legal">BioHair X® is a compounded formulation and not an FDA-approved finished drug. Published studies of individual ingredients do not establish safety or efficacy of the complete combination.</p></div><nav aria-label="Footer explore"><h2>Explore</h2>${link('index.html','Home')}${link('blog.html','Blog')}${link('clinical-research.html','Research & Clinical Evidence')}${link('physicians.html','For Physicians')}</nav><nav aria-label="Footer support"><h2>Support</h2>${link('find-my-treatment/','Find My Treatment')}${link('physician-inquiry/','Physician Inquiry')}${link('contact.html','Contact')}${link('privacy.html','Privacy Policy')}${link('terms.html','Terms')}</nav></div><div class="bh-footer-bottom"><p>Review preview: illustrative results and testimonials pending validation.</p><small>© 2026 BioHair X®. All rights reserved.</small></div></footer>`;
  const button = document.querySelector('.bh-menu'), nav = document.querySelector('#bh-links');
  const close = () => { button.setAttribute('aria-expanded','false'); button.setAttribute('aria-label','Open navigation'); nav.classList.remove('bh-open'); };
  button.addEventListener('click', () => {const open=button.getAttribute('aria-expanded')!=='true'; button.setAttribute('aria-expanded',String(open)); button.setAttribute('aria-label',open?'Close navigation':'Open navigation'); nav.classList.toggle('bh-open',open);});
  nav.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && nav.classList.contains('bh-open')){close();button.focus();}});
  matchMedia('(min-width: 1000px)').addEventListener('change',close);
  nav.querySelectorAll('a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page');});
})();
