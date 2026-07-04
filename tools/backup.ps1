# Risk Control Project Full Backup Script
# Steps:
#   1. Auto commit current changes
#   2. Create and push Git tag to GitHub
#   3. Generate local zip archive in backups/ folder

param(
    [string]$TagPrefix = "backup"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $projectRoot
Set-Location $projectRoot

$dateStr = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tagName = "$TagPrefix-$dateStr"
$commitMessage = "backup: $timestamp full backup"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Risk Control Project Full Backup" -ForegroundColor Cyan
Write-Host "  Project: $projectRoot" -ForegroundColor Cyan
Write-Host "  Time: $timestamp" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check Git repository
if (-not (Test-Path ".git")) {
    throw "Current directory is not a Git repository. Please init Git first."
}

# 2. Check remote repository
$remotes = git remote -v 2>$null
if (-not $remotes) {
    throw "Remote repository not configured. Please link GitHub first."
}

# 3. Commit current changes if any
$status = git status --short
if ($status) {
    Write-Host "Uncommitted changes detected, auto committing..." -ForegroundColor Yellow
    git add -A
    git commit -m "$commitMessage" 2>&1 | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "Working tree clean. No changes to commit." -ForegroundColor Green
}

# 4. Create Git tag (replace local tag if exists)
$existingTag = git tag -l $tagName
if ($existingTag) {
    Write-Host "Tag $tagName already exists locally, replacing..." -ForegroundColor Yellow
    git tag -d $tagName | ForEach-Object { Write-Host $_ }
}

Write-Host "Creating Git tag: $tagName" -ForegroundColor Cyan
git tag -a $tagName -m "Full backup $dateStr" | ForEach-Object { Write-Host $_ }

# 5. Push to remote
try {
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push origin master | ForEach-Object { Write-Host $_ }
    git push origin $tagName | ForEach-Object { Write-Host $_ }
} catch {
    Write-Host "Git push encountered an issue, continuing to local zip backup." -ForegroundColor Yellow
}

# 6. Generate local zip archive
$backupDir = Join-Path $projectRoot "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$zipPath = Join-Path $backupDir "full_backup_$timestamp.zip"

Write-Host "Generating local zip archive: $zipPath" -ForegroundColor Cyan
$itemsToBackup = @("index.html", "server.js", "pages", "js", "tools", "data", ".gitignore")
Compress-Archive -Path $itemsToBackup -DestinationPath $zipPath -Force

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Full backup completed!" -ForegroundColor Green
Write-Host "  Git tag: $tagName" -ForegroundColor Green
Write-Host "  Local zip: $zipPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
