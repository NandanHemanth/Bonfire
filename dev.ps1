# BonFire Development Server Launcher
# This script sets the execution policy and starts all development servers

Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
npm run dev:all
