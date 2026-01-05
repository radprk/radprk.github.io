# Setup Windows Task Scheduler for Journal Sync
# Run this script as Administrator

$TaskName = "JournalSync"
$Description = "Sync journal from Google Docs to GitHub Pages"

# Get the path to the batch file
$ScriptPath = Join-Path $PSScriptRoot "run_sync.bat"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task '$TaskName' already exists. Removing old task..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create the action (run the batch file)
$Action = New-ScheduledTaskAction -Execute $ScriptPath -WorkingDirectory $PSScriptRoot

# Create trigger - Daily at 9 PM
$Trigger = New-ScheduledTaskTrigger -Daily -At 9PM

# Optional: Add a second trigger at 9 AM
$Trigger2 = New-ScheduledTaskTrigger -Daily -At 9AM

# Settings
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries

# Register the task
Register-ScheduledTask -TaskName $TaskName `
    -Description $Description `
    -Action $Action `
    -Trigger $Trigger, $Trigger2 `
    -Settings $Settings `
    -RunLevel Highest

Write-Host ""
Write-Host "Task '$TaskName' created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Schedule:"
Write-Host "  - Daily at 9:00 AM"
Write-Host "  - Daily at 9:00 PM"
Write-Host ""
Write-Host "To manage the task:"
Write-Host "  - View: Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "  - Run now: Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  - Disable: Disable-ScheduledTask -TaskName '$TaskName'"
Write-Host "  - Remove: Unregister-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
