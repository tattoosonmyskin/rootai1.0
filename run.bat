@echo off
REM RootAI startup script for Windows
REM Double-click this file or run it from cmd.

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌  python not found.
    echo     Install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

python run.py
pause
