(() => {
 const form=document.querySelector('.contact-form'), status=document.querySelector('#form-status'), button=form.querySelector('button[type=submit]');
 let token='';
 const message=(text,error=false)=>{status.textContent=text;status.dataset.error=String(error);};
 async function initialize(){
  try{
   const response=await fetch('/api/form-session',{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error();
   const config=await response.json();token=config.token;
   if(config.calendar_url){const a=document.createElement('a');a.href=config.calendar_url;a.textContent='Book a conversation on Google Calendar';a.target='_blank';a.rel='noopener noreferrer';document.querySelector('#booking').replaceChildren(a);}
   message(config.ready[form.dataset.kind]?'Your contact details will be sent securely to the appropriate BioHair X team.':'Staging: delivery is unavailable until the recipient endpoint and privacy policy are approved. No contact details will be sent.');
  }catch{message('Staging: the local form service is unavailable. No contact details will be sent.',true);}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  if(!token){message('The form service is unavailable. Please try again later.',true);return;}
  button.disabled=true;message('Sending your contact request…');
  try{
   const response=await fetch('/api/forms/'+form.dataset.kind,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':token},credentials:'same-origin',body:JSON.stringify(Object.fromEntries(new FormData(form)))});
   const result=await response.json();message(result.message,!response.ok);
   if(response.ok){form.reset();token='';await initialize();message(result.message);}
  }catch{message('Delivery could not be confirmed. Please try again later.',true);}
  finally{button.disabled=false;}
 });
 initialize();
})();
