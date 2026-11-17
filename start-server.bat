@echo off
chcp 65001 >nul
setlocal

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: 检查 node 是否可用
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js。
    pause
    exit /b 1
)

:: 检查 8000 端口是否已有服务器在运行
curl -s -o nul -m 2 http://localhost:8000/index.html
if not errorlevel 1 (
    echo 检测到服务器已在运行（端口 8000），无需重复启动。
) else (
    echo 正在启动本地服务器，端口 8000 ...
    start "风险管控本地服务器" cmd /k "node server.js"

    :: 等待服务器启动
    timeout /t 2 /nobreak >nul
)

:: 打开浏览器（优先 Chrome，避免“如何打开此文件”弹窗）
echo 正在打开浏览器 ...
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Bin\chrome.exe"
if exist "%CHROME%" (
    start "" "%CHROME%" http://localhost:8000/index.html
) else (
    start "" http://localhost:8000/index.html
)

endlocal
