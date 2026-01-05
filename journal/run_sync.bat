@echo off
REM Journal Sync Script for Windows
REM Run this manually or via Task Scheduler

cd /d "%~dp0"

echo [%date% %time%] Starting journal sync...

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Run the sync
python pipeline\sync.py

echo [%date% %time%] Sync complete!
