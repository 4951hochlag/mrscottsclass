# Shared Send to Teacher component

File: `shared/send-to-teacher.js`

This is a reusable client-side component for classroom activities. It uses the existing Google Apps Script deployment and student folders. It does **not** replace the tested Survey & Graph implementation yet.

## Integrate into an activity

Include the script (adjust the relative path to the site root):

```html
<button id="sendTeacher" type="button">Send to Teacher</button>
<script src="../../shared/send-to-teacher.js"></script>
<script>
  MrScottSendToTeacher.mount({
    button: '#sendTeacher',
    activity: 'Picture Sentences',
    getPdfBase64: async () => {
      // Return the completed activity PDF as raw base64,
      // or a data:application/pdf;base64,... URL.
      return await createActivityPdf();
    }
  });
</script>
```

The activity is responsible for generating its own accurate PDF. The component handles initials, password login, tab-scoped session token, POST requests, and confirmation messages. A timeout is **not** proof of failure: check Google Drive before resending.

Security/privacy: This uses a public Apps Script web app protected by a shared classroom password, not individual student authentication. Avoid sensitive student information; follow school privacy policy. The component never hardcodes the password. Do not deploy an app before testing PDF layout and folder delivery.

**Next step:** Integrate into one simpler app on a preview first; once validated, migrate Survey & Graph to use this common component.
