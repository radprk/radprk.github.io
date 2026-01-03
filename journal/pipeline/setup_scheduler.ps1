# Journal Sync - Windows Task Scheduler Setup
# Run this script as Administrator to create the scheduled task

param(
    [string]$RepoPath = "C:\Users\$env:USERNAME\radprk.github.io",
    [string]$Time = "23:00",  # 11 PM
    [switch]$Remove
)

$TaskName = "JournalSync"
$TaskDescription = "Daily sync of journal from Google Docs to GitHub Pages"

# Remove existing task if requested
if ($Remove) {
    Write-Host "Removing scheduled task: $TaskName"
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Task removed."
    exit 0
}

# Verify paths
$BatchScript = Join-Path $RepoPath "journal\pipeline\run_sync.bat"
if (-not (Test-Path $BatchScript)) {
    Write-Error "Batch script not found: $BatchScript"
    Write-Host "Make sure the repository is cloned to: $RepoPath"
    exit 1
}

Write-Host "Setting up Journal Sync scheduled task..."
Write-Host "Repository: $RepoPath"
Write-Host "Sync time: $Time daily"
Write-Host ""

# Create the action
$Action = New-ScheduledTaskAction -Execute $BatchScript -WorkingDirectory $RepoPath

# Create the trigger (daily at specified time)
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time

# Additional trigger: run on wake if missed
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# Create principal (run as current user)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Register the task
try {
    # Remove existing task if it exists
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Description $TaskDescription `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Principal $Principal

    Write-Host ""
    Write-Host "SUCCESS! Scheduled task created: $TaskName" -ForegroundColor Green
    Write-Host ""
    Write-Host "The sync will run daily at $Time"
    Write-Host "If your laptop was asleep, it will run when you wake it."
    Write-Host ""
    Write-Host "To test the task now:"
    Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host ""
    Write-Host "To check task status:"
    Write-Host "  Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo"
    Write-Host ""
    Write-Host "To remove the task:"
    Write-Host "  .\setup_scheduler.ps1 -Remove"
}
catch {
    Write-Error "Failed to create scheduled task: $_"
    exit 1
}
