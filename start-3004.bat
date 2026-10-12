@echo off
cd /d "%~dp0"
set PORT=3004
node dist\src\index.js
