# Diploconnect11 - professional network for Bihar diploma engineers

A LinkedIn-style website for students, diploma holders and engineers from polytechnic
colleges affiliated with SBTE Bihar. Built with plain HTML, CSS and JavaScript. No build
step, no dependencies.

## Features
- Sign up limited to a list of SBTE Bihar affiliated colleges
- Professional profile: headline, about, education, skills, certifications (with credential links)
- Profile strength meter and "Save as PDF" (browser print)
- Feed with posts, likes and comments
- Network: search and filter by college, branch or skill, send and accept connection requests
- Responsive layout, keyboard friendly, accessible focus styles

## Project structure
```
diploconnect11/
  index.html        page shell
  css/style.css     all styles
  js/data.js        college list, branches, sample profiles (edit this to change colleges)
  js/store.js       data layer (localStorage)
  js/app.js         routing, views and events
  vercel.json       Vercel settings
```

## Run locally
Open `index.html` in a browser, or run `npx serve .` in this folder.

## Deploy: GitHub then Vercel
1. Create an empty repository on github.com (for example `diploconnect11`).
2. In this folder run:
   ```
   git init
   git add .
   git commit -m "Diploconnect11: Bihar diploma network"
   git branch -M main
   git remote add origin https://github.com/<your-username>/diploconnect11.git
   git push -u origin main
   ```
3. Go to vercel.com, click **Add New > Project**, import the repository.
4. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.

Every later `git push` redeploys automatically.

## How data works (important)
Data is stored in each visitor's own browser (localStorage). That means accounts, posts and
connections are not shared between different devices or users. Eight fictional sample profiles
are included so the network is not empty, and new members receive two sample connection requests.
Passwords are hashed in the browser, which is fine for a demo but not real security.

To turn this into a real multi-user network, replace the functions in `js/store.js` with calls to
Firebase (Auth + Firestore) or Supabase. The rest of the app only uses the `Store` object.

## Checking SBTE membership
The site limits sign-up to SBTE colleges and asks for the SBTE registration number, but it cannot
verify either. For real verification add an admin approval step that checks the registration
number against college records.

## Customising
- Site name: `APP_NAME` in `js/data.js` (also update the `<title>` in `index.html`)
- Colleges and branches: `js/data.js`
- Colours and fonts: variables at the top of `css/style.css`
