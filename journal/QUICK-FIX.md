# Quick Fix for Blank Screen

If you're seeing a blank black screen, try these steps in order:

## Step 1: Check Browser Console

1. Open your browser
2. Press F12 to open DevTools
3. Go to the Console tab
4. Look for any red error messages
5. Share the error message if you see one

## Step 2: Verify Dev Server

Make sure the dev server is running:

```powershell
cd journal
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/journal/
```

## Step 3: Check the URL

Make sure you're visiting:
- `http://localhost:3000/journal/` (with trailing slash)

NOT:
- `http://localhost:3000/journal` (without trailing slash)
- `http://localhost:3000/` (wrong path)

## Step 4: Verify Data Files

Run this to check if data files are in the right place:

```powershell
cd journal
.\setup-dev.ps1
```

Or manually check:
- `public/data/entries.json` exists
- `public/data/stats.json` exists
- `public/data/weeks.json` exists
- `public/config/books.json` exists

## Step 5: Clear and Reinstall

If nothing works:

```powershell
cd journal
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

## Step 6: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for failed requests (red)
5. Check if `entries.json`, `stats.json`, etc. are loading

## Most Common Issue

The most common cause is **data files not in the right location**. 

Make sure you've run:
```powershell
.\setup-dev.ps1
```

This creates symlinks so the dev server can find your data files.

## Still Not Working?

1. Check the browser console for specific errors
2. Check the Network tab for failed requests
3. Try visiting `http://localhost:3000/journal/` directly
4. Make sure you're not blocking JavaScript in your browser

