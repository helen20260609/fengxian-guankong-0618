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

echo 正在启动本地服务器，端口 8000 ...
start "风险管控本地服务器" cmd /k "node server.js"

:: 等待服务器启动
timeout /t 2 /nobreak >nul

:: 打开默认浏览器
echo 正在打开浏览器 ...
start http://localhost:8000/index.html

endlocal
