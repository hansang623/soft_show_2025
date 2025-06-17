@echo off
:: 软件开发项目大数据展示屏启动脚本
:: 功能：自动启动本地HTTP服务器并打开浏览器
:: 作者：CTO级工程师
:: 兼容性：Windows系统

echo ========================================
echo  软件开发项目大数据展示屏
echo  启动服务器中...
echo ========================================
echo.

:: 检查Python是否可用
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] 检测到Python，使用Python启动HTTP服务器
    echo [INFO] 服务器地址：http://localhost:8000
    echo [INFO] 按Ctrl+C停止服务器
    echo.
    start http://localhost:8000
    python -m http.server 8000
) else (
    :: 检查Node.js是否可用
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo [INFO] 检测到Node.js，使用http-server启动服务器
        echo [INFO] 正在安装http-server...
        npm install -g http-server
        echo [INFO] 服务器地址：http://localhost:8080
        echo [INFO] 按Ctrl+C停止服务器
        echo.
        start http://localhost:8080
        http-server -p 8080
    ) else (
        echo [ERROR] 未检测到Python或Node.js
        echo [INFO] 请安装Python 3.x或Node.js后重试
        echo [INFO] 或者直接用浏览器打开index.html文件
        echo.
        echo [INFO] 正在尝试直接打开index.html文件...
        start index.html
        echo.
        echo [INFO] 如果页面无法正常显示，请：
        echo [INFO] 1. 安装Python：https://python.org
        echo [INFO] 2. 或安装Node.js：https://nodejs.org
        echo [INFO] 3. 然后重新运行此脚本
    )
)

echo.
echo ========================================
echo  展示屏启动完成
echo  如有问题请查看README.md文档
echo ========================================
pause 