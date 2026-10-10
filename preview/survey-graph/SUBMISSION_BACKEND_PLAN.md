# Submission backend — next deployment step

The preview form is ready, but uploading is **not enabled** until the Google Apps Script deployment is configured and tested.

## Why the existing deployment cannot work for students
The existing web app is restricted to **Only myself**. A student on the public GitHub Pages site cannot call it. An embedded iframe also produced Google authentication errors.

## Recommended next implementation
Create a **separate** Apps Script web-app deployment, running as the owner, with access **Anyone**, dedicated to submissions. This exposes a public URL, so the script must validate the classroom password or a short-lived server-issued session token **on every upload**. Never trust the student name, activity, MIME type, or file size supplied by the browser. Apply rate limits, an allowlist of students, a PDF header check, maximum file size, and an upload quota. Keep all Drive permissions private.

The browser can submit an HTML form via POST to the Apps Script URL in a **hidden iframe**. This avoids fetch CORS preflight; Apps Script can return HtmlService containing a tiny script that posts a result to the parent GitHub Pages origin. The browser must verify the returned message origin and a per-request nonce. **Test this transport before enabling uploads**, because Apps Script's Google redirects, cookies, and embedding behavior may still interfere. If blocked, use a CORS-capable backend (e.g. Cloud Run) instead of weakening security.

## Student privacy
Obtain school authorization before sending identifiable student work to a separate Google account/Drive. Use a school-managed account if policy requires it. A shared classroom password provides only modest protection and should not be treated as student identity verification.

## Test checklist
1. Keep existing standalone Apps Script deployment unchanged and working.
2. Deploy the new endpoint, verify owner account and anonymous/student-browser POST handling.
3. Test incorrect password, wrong student, oversized PDF, expired token, repeated submissions, and malformed PDF.
4. Verify successful PDF is stored in Test Student folder.
5. Enable preview button only after success and failure messages are reliably received.
6. Obtain approval before merging the preview into the live Survey & Graph app.
