# 风险管控项目全量备份脚本
# 功能：
#   1. 自动提交当前所有改动
#   2. 打 Git 标签并推送到 GitHub
#   3. 生成本地 zip 压缩包到 backups/ 目录

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
$commitMessage = "backup: $timestamp 全量备份"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  风险管控项目全量备份" -ForegroundColor Cyan
Write-Host "  项目路径: $projectRoot" -ForegroundColor Cyan
Write-Host "  备份时间: $timestamp" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 检查 Git 仓库
if (-not (Test-Path ".git")) {
    throw "当前目录不是 Git 仓库，请先初始化 Git。"
}

# 2. 检查远程仓库
$remotes = git remote -v 2>$null
if (-not $remotes) {
    throw "未配置远程仓库，请先关联 GitHub。"
}

# 3. 提交当前所有改动（如果有）
$status = git status --short
if ($status) {
    Write-Host "检测到未提交改动，正在自动提交..." -ForegroundColor Yellow
    git add -A
    git commit -m "$commitMessage" 2>&1 | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "工作区干净，没有需要提交的改动。" -ForegroundColor Green
}

# 4. 打 Git 标签（如果已存在则先删除）
$existingTag = git tag -l $tagName
if ($existingTag) {
    Write-Host "标签 $tagName 已存在，删除旧标签..." -ForegroundColor Yellow
    git tag -d $tagName | ForEach-Object { Write-Host $_ }
    git push origin --delete $tagName 2>$null | ForEach-Object { Write-Host $_ }
}

Write-Host "正在创建 Git 标签: $tagName" -ForegroundColor Cyan
git tag -a $tagName -m "全备 $dateStr" | ForEach-Object { Write-Host $_ }

# 5. 推送到远程
Write-Host "正在推送到 GitHub..." -ForegroundColor Cyan
git push origin master | ForEach-Object { Write-Host $_ }
git push origin $tagName | ForEach-Object { Write-Host $_ }

# 6. 生成本地 zip 压缩包
$backupDir = Join-Path $projectRoot "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$zipPath = Join-Path $backupDir "full_backup_$timestamp.zip"

Write-Host "正在生成本地压缩包: $zipPath" -ForegroundColor Cyan
$itemsToBackup = @("index.html", "server.js", "pages", "js", "tools", "data", ".gitignore")
Compress-Archive -Path $itemsToBackup -DestinationPath $zipPath -Force

Write-Host "========================================" -ForegroundColor Green
Write-Host "  全量备份完成！" -ForegroundColor Green
Write-Host "  Git 标签: $tagName" -ForegroundColor Green
Write-Host "  本地压缩: $zipPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
