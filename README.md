# Debadatta Dutta – portfolio

Files: `index.html` (the page) and `vercel.json` (optional security headers for Vercel). The page has no build step and no external files.

A single-page portfolio (`index.html`) with a left-hand table of contents, light and dark mode, a WhatsApp link, and an "Ask Debadatta" chat bot. It has no build step and no external files.

## Publish on GitHub Pages

1. Sign in to GitHub and create a new **public** repository.
   - Name it `<username>.github.io` to get the address `https://<username>.github.io/`.
   - Any other name works too, and gives `https://<username>.github.io/<repository-name>/`.
2. Upload `index.html` to the root of the repository.
3. Open **Settings > Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then select **Save**.
4. Wait one to two minutes. GitHub shows the live address at the top of the Pages screen.

## Profile picture

Her photo is embedded in `index.html`, so there is no separate image file to upload. To change it later, send the new picture to Claude and upload the updated `index.html`.

## Update the page later

- Edit or replace `index.html` in the repository and commit. GitHub Pages republishes the site within a minute or two.
- To change the text, send the changes to Claude and upload the new `index.html`.

## Add the link to the resume

- Use the final address as plain text in the contact line, for example `debadatta.github.io`. Resume scanners read plain text more reliably than hyperlinks.
- Open the live address on a phone and in a private browser window to check it before you share it.

## Publish on Vercel (public HTTPS address)

Vercel gives the page a free `https://<project-name>.vercel.app` address that works on computers and phones.

**Option A: from GitHub (no command line)**
1. Put `index.html` and `vercel.json` in the root of a GitHub repository.
2. Sign in at vercel.com with GitHub, choose **Add New > Project**, and import the repository.
3. Leave **Framework Preset** as **Other**, leave the build command and output directory empty, and select **Deploy**.
4. Open the address Vercel shows. To get a cleaner name, rename the project under **Settings > General**.

**Option B: from your computer**
1. Put `index.html` and `vercel.json` in one folder.
2. Run `npm install -g vercel`, then `vercel login`.
3. In that folder, run `vercel --prod`. Vercel prints the public address.

**Check before sharing:** open the address on a phone and in a private browser window, and test the WhatsApp button, the email dialog, and the chat.
