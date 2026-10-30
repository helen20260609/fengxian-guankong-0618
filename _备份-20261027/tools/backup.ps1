# Risk Control Project Full Backup Script
# Steps:
#   1. Auto commit current changes
#   2. Create and push Git tag to GitHub
#   3. Generate local zip archive in backups/ folder

param(
    [string]$TagPrefix = "backup"
)

$ErrorActionPreference = "Continue"
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

# 5. Push to remote (do not abort on push failure)
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
cmd /c "git push origin master 2>&1" | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { Write-Host "master push exit code: $LASTEXITCODE" -ForegroundColor Yellow }
# Delete remote tag if exists, then push new tag (avoids rejection)
cmd /c "git push origin :refs/tags/$tagName 2>&1" | Out-Null
cmd /c "git push origin $tagName 2>&1" | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) { Write-Host "Tag push exit code: $LASTEXITCODE" -ForegroundColor Yellow }

# 6. Generate local zip archive
$backupDir = Join-Path $projectRoot "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$zipPath = Join-Path $backupDir "full_backup_$timestamp.zip"

Write-Host "Generating local zip archive: $zipPath" -ForegroundColor Cyan
# Backup all first-level dirs/files except known heavy/derived folders
$excludeDirs = @('.git', '.venv', '.vscode', '.backups', 'backups', 'node_modules', 'temp', 'temp_restore')
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
    $items = Get-ChildItem -Path $projectRoot -Force |
        Where-Object { -not ($_.PSIsContainer -and ($excludeDirs -contains $_.Name)) }
    $fileCount = 0
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            $files = Get-ChildItem -Path $item.FullName -Recurse -File -Force -ErrorAction SilentlyContinue
            foreach ($f in $files) {
                $rel = $f.FullName.Substring($projectRoot.Length).TrimStart('\')
                $entry = $zip.CreateEntry($rel.Replace('\', '/'))
                $stream = $entry.Open()
                $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
                $stream.Write($bytes, 0, $bytes.Length)
                $stream.Close()
                $fileCount++
            }
        } else {
            $rel = $item.FullName.Substring($projectRoot.Length).TrimStart('\')
            $entry = $zip.CreateEntry($rel.Replace('\', '/'))
            $stream = $entry.Open()
            $bytes = [System.IO.File]::ReadAllBytes($item.FullName)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Close()
            $fileCount++
        }
    }
    $zip.Dispose()
    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host "Zip created: $zipSize MB ($fileCount files)" -ForegroundColor Green
} catch {
    Write-Host "Zip creation failed: $_" -ForegroundColor Red
    if ($zip) { try { $zip.Dispose() } catch {} }
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Full backup completed!" -ForegroundColor Green
Write-Host "  Git tag: $tagName" -ForegroundColor Green
Write-Host "  Local zip: $zipPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

exit 0
