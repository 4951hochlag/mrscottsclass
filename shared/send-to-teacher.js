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
function token(){
  const t=sessionStorage.getItem(TOKEN_KEY);
  const at=Number(sessionStorage.getItem(TIME_KEY)||0);
  if(!t||!at||Date.now()-at>=SESSION_MS){sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(TIME_KEY);return null;}
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
function mount(options){
  if(!options||!options.button||typeof options.getPdfBase64!=='function'||!options.activity)throw Error('Specify button, activity and getPdfBase64.');
  const button=typeof options.button==='string'?document.querySelector(options.button):options.button;
  if(!button)throw Error('Send to Teacher button not found.');
  const dialog=document.createElement('dialog');
  dialog.setAttribute('aria-label','Send to Teacher');
  dialog.style.cssText='border:0;border-radius:16px;padding:24px;max-width:min(430px,94vw);width:100%;box-shadow:0 14px 50px #0003;font-family:Arial,sans-serif;color:#172033';
  dialog.innerHTML='<h2 style="margin-top:0">Send to Teacher</h2><p data-role="status" role="status" aria-live="polite">Preparing your work…</p>'+
    '<div style="display:grid;gap:12px"><label for="mrscott-student">Student initials</label><select data-role="student" id="mrscott-student" style="padding:12px"><option value="">Choose your initials</option>'+
    STUDENTS.map(s=>'<option value="'+s+'">'+s+'</option>').join('')+'</select>'+
    '<div data-role="login" style="display:grid;gap:10px"><label for="mrscott-password">Classroom password</label><input data-role="password" id="mrscott-password" type="password" autocomplete="off" style="padding:12px" placeholder="Classroom password"><button data-role="unlock" type="button">Unlock Sending</button></div>'+
    '<button data-role="send" type="button">Send My Work</button><button data-role="close" type="button">Close</button></div>';
  document.body.append(dialog);
  const el=role=>dialog.querySelector('[data-role="'+role+'"]');
  const status=text=>{el('status').textContent=text;};
  let pdf=null,busy=false;
  function refresh(){el('login').style.display=token()?'none':'grid';el('send').disabled=busy||!pdf||!token();}
  el('close').onclick=()=>{if(!busy)dialog.close();};
  el('unlock').onclick=async()=>{
    const password=el('password').value;
    if(!password){status('Enter the classroom password.');return;}
    el('unlock').disabled=true;
    try{
      const r=await request({action:'login',password},'mrscott-login-result');
      el('password').value='';
      if(r.success&&typeof r.token==='string'&&r.token.length>20){
        sessionStorage.setItem(TOKEN_KEY,r.token);
        sessionStorage.setItem(TIME_KEY,String(Date.now()));
        status('Classroom unlocked. Choose your initials and send your work.');
      }else status('Login unsuccessful: '+String(r.message||'Check the password.'));
    }catch(e){el('password').value='';status('Could not verify login: '+e.message);}
    finally{el('unlock').disabled=false;refresh();}
  };
  el('send').onclick=async()=>{
    const student=el('student').value;
    if(!STUDENTS.includes(student)){status('Choose your initials first.');return;}
    const t=token();if(!t){status('Session expired. Enter the password again.');refresh();return;}
    if(!pdf){status('PDF is not ready.');return;}
    busy=true;refresh();status('Sending your work…');
    try{
      const r=await request({action:'submit',token:t,student,activity:String(options.activity).slice(0,60),pdfBase64:pdf},'mrscott-submit-result');
      if(r.success){pdf=null;status('Your work was sent successfully!');if(typeof options.onSuccess==='function')options.onSuccess(r);}
      else{
        status('Could not save your work: '+String(r.message||'Unknown error'));
        if(/session expired/i.test(String(r.message||''))){sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(TIME_KEY);}
      }
    }catch(e){status(e.message);}
    finally{busy=false;refresh();}
  };
  async function open(){
    if(busy)return;
    pdf=null;el('student').value='';el('password').value='';status('Preparing your completed work…');
    dialog.showModal();refresh();
    try{
      const output=await options.getPdfBase64();
      pdf=typeof output==='string'?output.replace(/^data:application\/pdf;base64,/i,''):null;
      if(!pdf||!pdf.startsWith('JVBER'))throw Error('The activity did not produce a valid PDF.');
      if(pdf.length>Math.ceil(5*1024*1024*4/3)+100)throw Error('The PDF is over the 5 MB limit.');
      status('Your PDF is ready. Choose your initials and send your work.');
    }catch(e){status('Could not prepare the PDF: '+e.message);}
    refresh();
  }
  button.addEventListener('click',open);
  return {open,close:()=>dialog.close(),destroy:()=>{button.removeEventListener('click',open);dialog.remove();}};
}
global.MrScottSendToTeacher=Object.freeze({mount,students:STUDENTS.slice()});
})(window);
