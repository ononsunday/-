# 日和 · 每日计划与日记

日和是 Windows 64 位桌面软件，用来记录每日计划、日记和心情，也可以查看历史、月历，或在「今晚」页抽取活动。

## 下载与运行

在本仓库的 Releases 页面下载 `Hiyori-v1.2.1-Windows-x64.zip`，解压整个文件夹后双击 `日和.exe`。请保留随附的 DLL 文件和 `ui` 文件夹。

需要 .NET Framework 4.8 和 [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)。下载版是免安装 ZIP，不是安装向导。私有仓库的下载需要登录具有仓库访问权限的 GitHub 账号。

## 数据与备份

记录保存在 `%LOCALAPPDATA%\HiyoriDiary`，没有账号和云同步。数据文件未加密。可在设置中导出 JSON 备份；导入会在确认后替换当前记录。源码和下载包不包含个人日记及运行缓存。

详细操作见 [使用说明](使用说明.md)。

## 源码与构建

- `source/`：C# Windows 窗口、文件保存和构建脚本。
- `ui/`：HTML、CSS、JavaScript 和本地图片。
- `tests/`：数据模型、日期状态、活动筛选和每日一句测试。
- `licenses/`：WebView2 许可与声明。

在 Windows PowerShell 中执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\source\build.ps1
```

构建需要 Windows 的 .NET Framework C# 编译器，脚本生成根目录中的 `日和.exe`。随仓库保留的 WebView2 DLL 用于编译和运行。

安装 Node.js 后可执行测试，无需安装 npm 依赖：

```powershell
npm test
```

## 图片与第三方内容

项目所有者已确认图片获授权用于本次 GitHub 整理与发布。图片来源和原署名保留在 [素材来源](ui/assets/SOURCES.md) 中。这一确认不表示向仓库访问者授予额外的图片使用权。每日一句的出处见 [引用来源](ui/QUOTE_SOURCES.md)，WebView2 条款见 `licenses/`。

本仓库未为项目代码另行指定开源许可证。
