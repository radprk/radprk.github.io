# Troubleshooting Blank Screen

If you're seeing a blank black screen, try these steps:

## 1. Install Dependencies

Make sure all dependencies are installed:

```bash
cd journal
npm install
```

This will install:
- react-router-dom (for routing)
- recharts (for charts)

## 2. Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors. Common issues:

- **Module not found**: Dependencies not installed
- **Failed to fetch**: Data files not accessible
- **Syntax errors**: Code issues

## 3. Verify Data Files

Make sure these files exist:
- `journal/public/data/entries.json` (for dev)
- `journal/public/data/stats.json`
- `journal/public/data/weeks.json`
- `journal/public/config/books.json`
- `journal/public/data/blog.json`

## 4. Check Dev Server

Make sure the dev server is running:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/journal/
```

## 5. Clear Cache

Try:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Restart dev server

## 6. Check Network Tab

In DevTools → Network tab, check if:
- `entries.json` loads (should be 200 OK)
- `stats.json` loads
- `weeks.json` loads
- `books.json` loads

If any fail, check the file paths.

## 7. Temporary Fix: Remove Charts

If recharts is causing issues, temporarily comment out PracticeCharts:

In `journal/src/App.jsx`, comment out:
```jsx
// <section className="section">
//   <PracticeCharts entries={entries} stats={stats} />
// </section>
```

And the import:
```jsx
// import PracticeCharts from './components/PracticeCharts'
```

## 8. Check Routes

Make sure you're visiting the correct URL:
- Main journal: `http://localhost:3000/journal/`
- Blog: `http://localhost:3000/journal/blog`

## Common Errors

### "Cannot find module 'recharts'"
```bash
npm install recharts
```

### "Cannot find module 'react-router-dom'"
```bash
npm install react-router-dom
```

### "Failed to load data"
- Check that data files exist in `public/data/`
- Run the setup script: `.\setup-dev.ps1`

### Blank screen with no errors
- Check if `#root` element exists in `index.html`
- Check if React is rendering (look for React DevTools)
- Try adding a simple test component

