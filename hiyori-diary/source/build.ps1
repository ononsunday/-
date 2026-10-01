$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$compiler = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $compiler /nologo /target:winexe /platform:x64 /codepage:65001 "/win32icon:$appRoot\日和.ico" "/win32manifest:$PSScriptRoot\app.manifest" "/out:$appRoot\日和.exe" /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll /reference:System.Web.Extensions.dll "/reference:$appRoot\Microsoft.Web.WebView2.Core.dll" "/reference:$appRoot\Microsoft.Web.WebView2.WinForms.dll" "$PSScriptRoot\Program.cs"
if ($LASTEXITCODE -ne 0) { throw '编译失败' }
Write-Output '日和.exe 编译完成'
