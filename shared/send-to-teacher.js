/* Mr. Scott's Class — reusable Send to Teacher component.
   Usage: MrScottSendToTeacher.mount({button, activity, getPdfBase64});
   getPdfBase64 must return a raw base64 PDF string, a data:application/pdf;base64,
   URL, or a Promise of either. Passwords are never stored. */
(function(global){
'use strict';
const ENDPOINT='https://script.google.com/macros/s/AKfycbzPmBdDMatCWREnwl0yLK8rwIM6sLdflmPjLw6rftyf-Kjt1ihtD3H0-tE3yT-F_2rr/exec';
const ORIGIN=/^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|google\.com)$/;
const STUDENTS=['A.D.','A.D.A.','G.A.','E.P.','G.M.','V.P.','M.F.','L.T.'];
const TOKEN_KEY='mrscottSubmissionToken';
const TIME_KEY='mrscottSubmissionLoginAt';
const SESSION_MS=2*60*60*1000;
function token(anonymous){
  const tokenKey=anonymous?'mrscottSurveyToken':TOKEN_KEY;
  const timeKey=anonymous?'mrscottSurveyLoginAt':TIME_KEY;
  const t=sessionStorage.getItem(tokenKey);
  const at=Number(sessionStorage.getItem(timeKey)||0);
  if(!t||!at||Date.now()-at>=SESSION_MS){sessionStorage.removeItem(tokenKey);sessionStorage.removeItem(timeKey);return null;}
  return t;
}
function request(fields,expectedType){
  return new Promise((resolve,reject)=>{
    const nonce=crypto.randomUUID();
    const frame=document.createElement('iframe');
    frame.name='mrscott_'+nonce.replace(/-/g,'');
    frame.title='Submission connection';
    frame.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
    const form=document.createElement('form');
    form.method='POST';form.action=ENDPOINT;form.target=frame.name;
    for(const [key,value] of Object.entries({...fields,nonce})){
      const input=document.createElement('input');input.type='hidden';input.name=key;input.value=String(value);form.append(input);
    }
    let done=false;
    const cleanup=()=>{window.removeEventListener('message',receive);clearTimeout(timer);form.remove();frame.remove();};
    const finish=(err,result)=>{if(done)return;done=true;cleanup();err?reject(err):resolve(result);};
    const receive=event=>{
      if(!ORIGIN.test(event.origin))return;
      const d=event.data;
      if(!d||d.type!==expectedType||d.nonce!==nonce)return;
      finish(null,d);
    };
    window.addEventListener('message',receive);
    const timer=setTimeout(()=>finish(new Error('No confirmation received. Check Google Drive before trying again.')),25000);
    document.body.append(frame,form);
    try{form.submit();}catch(e){finish(e);}
  });
}
function subjectForPage(){
  const section=location.pathname.split('/').filter(Boolean).map(s=>s.toLowerCase())[1]||'';
  return ({english:'English',math:'Math',french:'French','world-of-work':'World of Work'})[section]||'';
}
function mount(options){
  if(!options||!options.button||typeof options.getPdfBase64!=='function'||!options.activity)throw Error('Specify button, activity and getPdfBase64.');
  const button=typeof options.button==='string'?document.querySelector(options.button):options.button;
  if(!button)throw Error('Send to Teacher button not found.');
  const anonymous=options.anonymous===true;
  const dialog=document.createElement('dialog');
  dialog.setAttribute('aria-label','Send to Teacher');
  dialog.style.cssText='border:0;border-radius:16px;padding:24px;max-width:min(430px,94vw);width:100%;box-shadow:0 14px 50px #0003;font-family:Arial,sans-serif;color:#172033';
  dialog.innerHTML='<h2 style="margin-top:0">Send to Teacher</h2><p data-role="status" role="status" aria-live="polite">Preparing your work…</p>'+
    '<div style="display:grid;gap:12px"><label for="mrscott-student">Student initials</label><select data-role="student" id="mrscott-student" style="padding:12px"><option value="">Choose your initials</option>'+
    STUDENTS.map(s=>'<option value="'+s+'">'+s+'</option>').join('')+'</select>'+
    '<div data-role="login" style="display:grid;gap:10px"><label for="mrscott-password">Classroom password</label><input data-role="password" id="mrscott-password" type="password" autocomplete="off" style="padding:12px" placeholder="Classroom password"><button data-role="unlock" type="button">Unlock Sending</button></div>'+
    '<button data-role="send" type="button">Send My Work</button><button data-role="close" type="button">Close</button></div>';
  document.body.append(dialog);
  if(anonymous)dialog.querySelector('[data-role="student"]').parentElement.querySelector('label[for="mrscott-student"]').remove();
  if(anonymous){dialog.querySelector('[data-role="student"]').remove();dialog.querySelector('label[for="mrscott-password"]').textContent='Survey password';}
  const el=role=>dialog.querySelector('[data-role="'+role+'"]');
  const status=text=>{el('status').textContent=text;};
  let pdf=null,busy=false;
  function refresh(){el('login').style.display=token(anonymous)?'none':'grid';el('send').disabled=busy||!pdf||!token(anonymous);}
  el('close').onclick=()=>{if(!busy)dialog.close();};
  el('unlock').onclick=async()=>{
    const password=el('password').value;
    if(!password){status(anonymous?'Enter the survey password.':'Enter the classroom password.');return;}
    el('unlock').disabled=true;
    try{
      const r=await request({action:anonymous?'survey-login':'login',password},'mrscott-login-result');
      el('password').value='';
      if(r.success&&typeof r.token==='string'&&r.token.length>20){
        sessionStorage.setItem(anonymous?'mrscottSurveyToken':TOKEN_KEY,r.token);
        sessionStorage.setItem(anonymous?'mrscottSurveyLoginAt':TIME_KEY,String(Date.now()));
        status(anonymous?'Classroom unlocked. Send your anonymous survey.':'Classroom unlocked. Choose your initials and send your work.');
      }else status('Login unsuccessful: '+String(r.message||'Check the password.'));
    }catch(e){el('password').value='';status('Could not verify login: '+e.message);}
    finally{el('unlock').disabled=false;refresh();}
  };
  el('send').onclick=async()=>{
    const student=anonymous?'SURVEY_ANONYMOUS':el('student').value;
    if(!anonymous&&!STUDENTS.includes(student)){status('Choose your initials first.');return;}
    const t=token(anonymous);if(!t){status('Session expired. Enter the password again.');refresh();return;}
    if(!pdf){status('PDF is not ready.');return;}
    if(typeof options.beforeSend==='function'){
      try{if(!(await options.beforeSend({student})))return;}
      catch(e){status('Cannot send: '+e.message);return;}
    }
    busy=true;refresh();status('Sending your work…');
    try{
      const r=await request({action:'submit',token:t,student,activity:(()=>{const name=String(typeof options.activity==='function'?options.activity():options.activity);const subject=subjectForPage();return (subject&&!name.toLowerCase().startsWith(subject.toLowerCase()+' - ')?subject+' - '+name:name).slice(0,60);})(),pdfBase64:pdf},'mrscott-submit-result');
      if(r.success){pdf=null;status('Your work was sent successfully!');if(typeof options.onSuccess==='function')options.onSuccess(r);}
      else{
        status('Could not save your work: '+String(r.message||'Unknown error'));
        if(/session expired/i.test(String(r.message||''))){sessionStorage.removeItem(anonymous?'mrscottSurveyToken':TOKEN_KEY);sessionStorage.removeItem(anonymous?'mrscottSurveyLoginAt':TIME_KEY);}
      }
    }catch(e){status(e.message);}
    finally{busy=false;refresh();}
  };
  async function open(){
    if(busy)return;
    pdf=null;if(!anonymous)el('student').value='';el('password').value='';status('Preparing your completed work…');
    dialog.showModal();refresh();
    try{
      const output=await options.getPdfBase64();
      pdf=typeof output==='string'?(output.startsWith('data:application/pdf')?output.substring(output.indexOf(',')+1):output):null;
      if(!pdf||!pdf.startsWith('JVBER'))throw Error('The activity did not produce a valid PDF.');
      if(pdf.length>Math.ceil(5*1024*1024*4/3)+100)throw Error('The PDF is over the 5 MB limit.');
      status(anonymous?'Your anonymous PDF is ready. Send your survey.':'Your PDF is ready. Choose your initials and send your work.');
    }catch(e){status('Could not prepare the PDF: '+e.message);}
    refresh();
  }
  button.addEventListener('click',open);
  return {open,close:()=>dialog.close(),destroy:()=>{button.removeEventListener('click',open);dialog.remove();}};
}
global.MrScottSendToTeacher=Object.freeze({mount,students:STUDENTS.slice()});
})(window);
