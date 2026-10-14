# In Your Words

A browser-based resume tailoring app for Firebase project `project-demo-c7a0d`.

Paste a resume and job description, or import a PDF, Word (.docx), or plain-text resume. The app prioritizes consecutive bullet points within each original role based on shared job-description terms, preserves the original wording, and lists missing terms for review. Edit the draft and download it as plain text.

This version uses keyword matching, not AI rewriting or semantic analysis. It does not invent experience or add missing skills. Resume and job-description contents remain in memory in the browser tab; there is no database, account, or external AI request. Refreshing clears the contents. Imports are processed locally in your browser. Scanned PDFs require a text-based copy; password-protected PDFs require an unlocked copy. Older .doc files should be saved as .docx. Review extracted text, especially multi-column PDF layouts. Downloads remain plain text.

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
