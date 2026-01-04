# How to Get Started with Your Journal Frontend

## Step 1: Install Dependencies

Open PowerShell or Terminal in your project root (`radprk.github.io`), then:

```powershell
cd journal
npm install
```

This will install React, Vite, and all other dependencies. It may take a minute or two.

## Step 2: Set Up Data Files for Development

The React app needs access to your data files. Run the setup script:

**Windows (PowerShell):**
```powershell
.\setup-dev.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

This creates symlinks so the dev server can access your `data/` and `config/` files.

> **Note:** If symlinks don't work (Windows may require admin or Developer Mode), you can manually copy the files:
> ```powershell
> Copy-Item data\*.json public\data\
> Copy-Item config\*.json public\config\
> ```

## Step 3: Start the Development Server

```powershell
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/journal/
  ➜  Network: use --host to expose
```

## Step 4: Open in Browser

Visit: **http://localhost:3000/journal/**

You should see your journal with all the components:
- Header stats
- Practice streaks
- Activity heatmap
- Reading progress
- Goals section
- Exploring tag cloud
- Daily entry cards

## Step 5: Test Features

- **Click a date on the heatmap** → Should scroll to that day's entry
- **Click a tag in the tag cloud** → Should filter entries by that topic
- **Use filter buttons** → Filter by Practice/Building/Reading/Exploring
- **Click a day card** → Should expand to show full entry
- **Resize browser** → Should be responsive on mobile

## Building for Production

When you're ready to deploy:

```powershell
npm run build
```

This creates a `dist/` folder with:
- Built React app
- Copied `data/` directory
- Copied `config/` directory

Then you can deploy the `dist/` contents to GitHub Pages.

## Troubleshooting

### "Cannot find module" errors
- Make sure you ran `npm install` in the `journal/` directory
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Data files not loading
- Make sure you ran the setup script (`setup-dev.ps1`)
- Or manually copy files to `public/data/` and `public/config/`
- Check browser console for 404 errors

### Port 3000 already in use
- Change the port in `vite.config.js`:
  ```js
  server: {
    port: 3001  // or any other port
  }
  ```

### Build fails
- Make sure Node.js version is 18 or higher: `node --version`
- Check for syntax errors in the console
- Try deleting `dist/` folder and rebuilding

## Quick Commands Reference

```powershell
# Install dependencies
cd journal
npm install

# Set up dev environment
.\setup-dev.ps1

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## What's Next?

Once you've verified everything works locally:
1. Test all the features
2. Customize styling if needed (colors in `index.css`, component styles in `src/components/*.css`)
3. Deploy to GitHub Pages (see `QUICKSTART.md` for deployment options)

