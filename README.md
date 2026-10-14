# In Your Words

A browser-based resume tailoring app for Firebase project `project-demo-c7a0d`.

Paste a resume and job description, or import a PDF, Word (.docx), or plain-text resume. The app prioritizes consecutive bullet points within each original role based on shared job-description terms, preserves the original wording, and lists missing terms for review. Edit the draft and download it as plain text.

Standard tailoring uses keyword matching and preserves your original sentences. Optional **Your voice** rewriting uses a writing sample of at least 40 words to guide Gemini's tone, vocabulary, and sentence style. Only experience bullets are rewritten. Contact details, headings, skills lists, and other non-bullet lines remain unchanged. The app rejects incomplete responses and changed numeric claims; the user must still review all rewritten claims for factual accuracy.

Imports and standard tailoring run locally. Selecting voice rewriting sends the resume, job description, and writing sample to Google's Gemini service through Firebase AI Logic. Inputs are held in the tab and cleared on refresh, but AI requests are subject to the provider's data policies. There is no app database or account. The writing sample is used for style only, not as a source of experience.

Scanned PDFs require a text-based copy; password-protected PDFs require an unlocked copy. Older .doc files should be saved as .docx. Review extracted text, especially multi-column PDF layouts. Downloads remain plain text.

## Enable voice rewriting

In Firebase Console for `project-demo-c7a0d`, open **AI Logic → Get started**, choose **Gemini Developer API**, and finish enabling the service. Review the provider's terms, quotas, and data-use settings. The app uses `gemini-2.5-flash`.

Register a **Web app** in Firebase Project settings if one does not exist. The deployed app reads the public web configuration from Hosting's reserved `/__/firebase/init.json` endpoint and checks the project ID. Redeploy Hosting after registering the app if the endpoint lacks an `appId`. Never put a service-account key or Gemini secret in frontend code. Set up Firebase App Check enforcement and appropriate API restrictions and quotas before sharing AI access broadly.

Voice rewriting requires the live Firebase service; plain local hosting does not supply the reserved config endpoint. Missing setup displays an actionable error and preserves the prior draft. Unit tests validate the rewrite boundaries and changed-number rejection. Browser checks exercised the Firebase SDK with a mocked response, not the live model; a real end-to-end rewrite remains to be verified after project configuration.

## Local development

Requires Node.js 24 and Python 3. Install the locked dependencies first. Document parsers are bundled and served from the app itself.

```sh
npm ci
npm test
npm start
```

The local server serves `public/` on port 3000.

## Firebase deployment

The repository is configured for Firebase Hosting project `project-demo-c7a0d`. The GitHub workflow tests and deploys on every push to `main`, or when manually triggered.

Before the first successful deployment, configure GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT_PROJECT_DEMO_C7A0D` with a Firebase deployment service-account JSON credential for this project. Use secure GitHub repository settings, never commit the credential. Firebase Hosting must be enabled for the project. Scope the account to the permissions required by Firebase Hosting deployments (see Firebase's official Hosting GitHub integration instructions). The workflow cannot deploy without this configuration.

Alternatively, an authenticated developer can deploy with the Firebase CLI:

```sh
npx firebase-tools deploy --only hosting --project project-demo-c7a0d
```

Local edits reach Firebase after they are committed and pushed to `main` and the deployment workflow succeeds. Firebase serves the app; it does not sync edits back into the repository.
