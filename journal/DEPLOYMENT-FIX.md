# Why Journal Doesn't Show on Portfolio Website

## The Problem

Your React app is built and the files exist, but there are a few issues preventing it from working on GitHub Pages:

1. **Asset Paths**: The built `index.html` references `/journal/assets/...` which should work, but GitHub Pages might need a different setup
2. **Data Files**: The React app needs to access `data/` and `config/` files at the same level
3. **React Router**: Client-side routing needs special handling for GitHub Pages

## Current Structure

```
radprk.github.io/
├── index.html (main portfolio)
├── journal/
│   ├── index.html (React app entry)
│   ├── assets/ (built JS/CSS)
│   ├── data/ (JSON files)
│   └── config/ (books.json)
└── journal/frontend/ (source code)
```

## The Issue

When you visit `radprk.github.io/journal/`, GitHub Pages serves `journal/index.html`, which tries to load:
- `/journal/assets/index-CMKw_A6l.js` ✅ (should work)
- `/journal/data/entries.json` ✅ (should work)

But React Router might not work correctly because GitHub Pages doesn't support client-side routing by default.

## Solutions

### Option 1: Use Hash Router (Easiest)

Change React Router to use HashRouter instead of BrowserRouter. This works on GitHub Pages without any server configuration.

**In `journal/frontend/src/App.jsx`**:
```jsx
import { HashRouter, Routes, Route } from 'react-router-dom'

// Change BrowserRouter to HashRouter
<HashRouter>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/blog" element={<BlogList />} />
  </Routes>
</HashRouter>
```

Then rebuild:
```bash
cd journal/frontend
npm run build
```

### Option 2: Add 404.html Redirect (Better for SEO)

Create a `journal/404.html` file that redirects to `index.html`. This allows React Router to work.

**Create `journal/404.html`**:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Journal - Radha Parikh</title>
    <script>
      // Single Page Apps for GitHub Pages
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### Option 3: Check Build Output Location

Make sure the build is outputting to the right place. Your `vite.config.js` has:
```js
outDir: '..',  // Builds to journal/ directory
```

This should work, but verify:
1. After `npm run build`, check that `journal/index.html` exists
2. Check that `journal/assets/` has the JS/CSS files
3. Check that `journal/data/` and `journal/config/` exist

## Quick Fix Steps

1. **Rebuild the app**:
   ```bash
   cd journal/frontend
   npm run build
   ```

2. **Verify files exist**:
   - `journal/index.html` ✅
   - `journal/assets/*.js` ✅
   - `journal/data/*.json` ✅
   - `journal/config/books.json` ✅

3. **Test locally**:
   ```bash
   cd journal/frontend
   npm run preview
   ```
   Visit `http://localhost:4173/journal/`

4. **If it works locally but not on GitHub Pages**:
   - Use HashRouter (Option 1) - easiest
   - Or add 404.html (Option 2) - better for URLs

5. **Commit and push**:
   ```bash
   git add journal/
   git commit -m "Rebuild journal frontend"
   git push
   ```

## Debugging

If it still doesn't work:

1. **Open browser DevTools** (F12)
2. **Check Console** for errors
3. **Check Network tab**:
   - Are `assets/*.js` loading? (should be 200)
   - Are `data/*.json` loading? (should be 200)
   - Any 404 errors?

4. **Check the URL**:
   - Should be: `https://radprk.github.io/journal/`
   - NOT: `https://radprk.github.io/journal` (no trailing slash)

## Most Likely Issue

The most common problem is **React Router not working on GitHub Pages**. Use HashRouter (Option 1) - it's the quickest fix and works immediately.

