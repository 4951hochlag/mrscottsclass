# Apps Script changes for Survey & Graph integration

Do not enable public access until you have reviewed the risks of an anonymous upload service. This is a prototype.

## Code.gs

Replace doGet with:

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Submission')
    .setTitle("Mr. Scott's Class — Submit Work")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

## Submission.html

In the existing <script> block, add:

```javascript
const CLASSROOM_ORIGIN = 'https://4951hochlag.github.io';
let pendingPdf = null;
let pendingActivity = 'Survey and Graph';

window.addEventListener('message', function(event) {
  if (event.origin !== CLASSROOM_ORIGIN) return;
  if (!event.data || event.data.type !== 'mrscott-pdf') return;
  if (typeof event.data.pdf !== 'string' || event.data.pdf.length > 7 * 1024 * 1024) return;
  pendingPdf = event.data.pdf;
  pendingActivity = String(event.data.activity || 'Survey and Graph').slice(0, 60);
  document.getElementById('pdf').style.display = 'none';
  showMessage('Your completed graph is ready. Choose your name and submit.');
});

function notifyParentReady() {
  if (window.parent !== window) {
    window.parent.postMessage({type:'mrscott-ready'}, CLASSROOM_ORIGIN);
  }
}
window.addEventListener('load', notifyParentReady);
```

Inside sendWork(), replace:

```javascript
const file = document.getElementById('pdf').files[0];
```

with:

```javascript
const file = document.getElementById('pdf').files[0];
```

Change the initial validation to:

```javascript
if (!student || (!pendingPdf && !file)) {
  showMessage('Choose your name and a PDF.');
  return;
}
if (!pendingPdf && file.size > 5 * 1024 * 1024) {
  showMessage('PDF must be smaller than 5 MB.');
  return;
}
```

Change the existing FileReader onload callback so it becomes a named function:

```javascript
function submitBase64(base64) {
  google.script.run
    .withSuccessHandler(function(result) {
      button.disabled = false;
      document.getElementById('pdf').value = '';
      if (result.success) {
        pendingPdf = null;
        showMessage('Your work has been sent successfully!');
        if (window.parent !== window) {
          window.parent.postMessage({type:'mrscott-success'}, CLASSROOM_ORIGIN);
        }
      } else {
        showMessage('Submission failed.');
      }
    })
    .withFailureHandler(function(error) {
      button.disabled = false;
      if (error.message.includes('Session expired')) {
        sessionStorage.removeItem('classToken');
        token = '';
        document.getElementById('login').style.display = 'block';
        document.getElementById('submission').style.display = 'none';
      }
      showMessage(error.message);
    })
    .saveSubmission(token, student, pendingActivity, base64);
}
if (pendingPdf) {
  submitBase64(pendingPdf);
} else {
  const reader = new FileReader();
  reader.onload = () => submitBase64(reader.result.split(',')[1]);
  reader.onerror = () => {button.disabled=false;showMessage('Could not read the PDF.');};
  reader.readAsDataURL(file);
}
```

Keep the remaining functions and HTML as they are. Deploy a **new version** of the web app after changes. For public classroom use, access would need to be Anyone, but first complete security review, school approval, and testing.

## Security considerations

The existing CacheService login-attempt counter is global and does not provide strong rate limiting. Shared passwords and browser-side session tokens can be copied. Anyone with the deployment URL can access the public form. ALLOWALL permits embedding the form on other sites, so the origin check must be applied to messages, and clickjacking remains a concern. Google Apps Script quotas can be exhausted by abuse. Use a dedicated account and monitor storage; consider a stronger backend for production.
