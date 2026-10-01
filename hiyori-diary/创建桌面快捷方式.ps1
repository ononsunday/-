$ErrorActionPreference = 'Stop'
$desktopPath = [Environment]::GetFolderPath('Desktop')
$linkPath = Join-Path $desktopPath '日和 · 每日计划与日记.lnk'
$shellObject = New-Object -ComObject WScript.Shell
$shortcut = $shellObject.CreateShortcut($linkPath)
$shortcut.TargetPath = Join-Path $PSScriptRoot '日和.exe'
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = (Join-Path $PSScriptRoot '日和.ico') + ',0'
$shortcut.Description = '把日子，慢慢写下来'
$shortcut.Save()
Write-Output ('桌面快捷方式已创建：' + $linkPath)
