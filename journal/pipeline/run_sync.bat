@echo off
REM Journal Sync Pipeline - Windows Batch Script
REM Run this manually or via Task Scheduler

REM Configuration - Update these paths for your system
SET REPO_PATH=C:\Users\YourUsername\radprk.github.io
SET PYTHON_PATH=python
SET OLLAMA_PATH=ollama

REM Change to repository directory
cd /d "%REPO_PATH%"

REM Check if Ollama is running
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo Starting Ollama...
    start "" "%OLLAMA_PATH%" serve
    timeout /t 5 /nobreak >NUL
)

REM Activate virtual environment if it exists
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)

REM Run the sync script
echo Running journal sync...
%PYTHON_PATH% journal\pipeline\sync.py %*

REM Check result
if %ERRORLEVEL% NEQ 0 (
    echo Sync failed with error code %ERRORLEVEL%
    echo Check logs at: %REPO_PATH%\journal\logs\sync.log
    exit /b %ERRORLEVEL%
)

echo Sync completed successfully!
