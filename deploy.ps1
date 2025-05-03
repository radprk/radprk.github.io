# Build the Next.js site
npm run build

# Ensure .nojekyll exists in the root and output directory
New-Item -Path ".nojekyll" -ItemType File -Force
New-Item -Path "out/.nojekyll" -ItemType File -Force

# Copy all files from the out directory to root
Get-ChildItem -Path "out/*" -Recurse | ForEach-Object {
     = .FullName.Replace("C:\Users\radha\radprk.github.io\out\", "C:\Users\radha\radprk.github.io\")
    if (-not (Test-Path -Path (Split-Path -Path  -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path -Path  -Parent) -Force
    }
    Copy-Item -Path .FullName -Destination  -Force
}

# Add, commit, and push all changes
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
