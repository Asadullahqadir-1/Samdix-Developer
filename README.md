# Samdix Developer Website

Static portfolio and agency-style landing page ready for Vercel deployment.

## Deploy On Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project**.
3. Import `Asadullahqadir-1/Samdix-Developer`.
4. Keep defaults (no build command needed for this static site).
5. Deploy.

Vercel will serve `index.html` from the project root.

## Contact Form With Gmail

This project includes a Vercel serverless contact form endpoint at `/api/contact`.

### Required Gmail Setup

1. Use the Gmail account that should receive the messages.
2. Turn on Google 2-Step Verification for that account.
3. Create an App Password in Google Account settings.
4. In Vercel, open `Project Settings -> Environment Variables`.
5. Add these variables:
	- `GMAIL_USER` = `samdixdev@gmail.com`
	- `GMAIL_APP_PASSWORD` = your 16-character Google App Password
6. Redeploy the project.

### Important Notes

- Do not use your normal Gmail password.
- Gmail App Passwords require 2-Step Verification to be enabled.
- The form sends mail to `GMAIL_USER` and sets the visitor email as `replyTo`.
