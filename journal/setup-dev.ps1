# PowerShell setup script for development on Windows
# Creates symlinks so data files are accessible during dev

$ErrorActionPreference = "Stop"

Write-Host "Setting up development environment..." -ForegroundColor Cyan

# Change to script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Create symlinks for data files
$links = @(
    @{Source = "..\data\entries.json"; Target = "public\data\entries.json"}
    @{Source = "..\data\stats.json"; Target = "public\data\stats.json"}
    @{Source = "..\data\weeks.json"; Target = "public\data\weeks.json"}
    @{Source = "..\config\books.json"; Target = "public\config\books.json"}
)

foreach ($link in $links) {
    $targetPath = Join-Path $scriptDir $link.Target
    $sourcePath = Join-Path $scriptDir $link.Source
    
    if (Test-Path $targetPath) {
        Write-Host "  Link already exists: $($link.Target)" -ForegroundColor Yellow
    } else {
        try {
            $targetDir = Split-Path -Parent $targetPath
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            New-Item -ItemType SymbolicLink -Path $targetPath -Target $sourcePath -Force | Out-Null
            Write-Host "  ✓ Linked $($link.Target)" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to create link: $($link.Target)" -ForegroundColor Red
            Write-Host "    Error: $_" -ForegroundColor Red
            Write-Host "    Note: You may need to run as Administrator or enable Developer Mode" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Development setup complete!" -ForegroundColor Green
Write-Host "Run 'npm run dev' to start the development server" -ForegroundColor Cyan

