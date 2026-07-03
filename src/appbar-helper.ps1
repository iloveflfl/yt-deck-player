param(
  [Parameter(Mandatory=$true)][ValidateSet('register','remove')][string]$Action,
  [Parameter(Mandatory=$true)][string]$Hwnd,
  [ValidateSet('bottom','right','left')][string]$Edge = 'bottom',
  [int]$MonitorLeft = 0,
  [int]$MonitorTop = 0,
  [int]$MonitorRight = 0,
  [int]$MonitorBottom = 0,
  [int]$Thickness = 0,
  [string]$StatusFile = '',
  [string]$StopFile = '',
  [int]$ParentPid = 0,
  [switch]$KeepAlive
)

$ErrorActionPreference = 'Stop'

$source = @"
using System;
using System.Runtime.InteropServices;

public static class YTDeckAppBarNative {
  public const UInt32 ABM_NEW = 0x00000000;
  public const UInt32 ABM_REMOVE = 0x00000001;
  public const UInt32 ABM_QUERYPOS = 0x00000002;
  public const UInt32 ABM_SETPOS = 0x00000003;
  public const UInt32 ABM_WINDOWPOSCHANGED = 0x00000009;

  public const UInt32 ABE_LEFT = 0;
  public const UInt32 ABE_TOP = 1;
  public const UInt32 ABE_RIGHT = 2;
  public const UInt32 ABE_BOTTOM = 3;

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public Int32 left;
    public Int32 top;
    public Int32 right;
    public Int32 bottom;
  }

  [StructLayout(LayoutKind.Sequential)]
  public struct APPBARDATA {
    public UInt32 cbSize;
    public IntPtr hWnd;
    public UInt32 uCallbackMessage;
    public UInt32 uEdge;
    public RECT rc;
    public IntPtr lParam;
  }

  [DllImport("shell32.dll", SetLastError=true)]
  public static extern IntPtr SHAppBarMessage(UInt32 dwMessage, ref APPBARDATA pData);

  [DllImport("user32.dll", CharSet=CharSet.Auto)]
  public static extern UInt32 RegisterWindowMessage(string lpString);

  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool IsWindow(IntPtr hWnd);

  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool SetProcessDpiAwarenessContext(IntPtr dpiContext);

  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, UInt32 uFlags);

  public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  public static readonly IntPtr DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2 = new IntPtr(-4);
  public const UInt32 SWP_NOACTIVATE = 0x0010;
  public const UInt32 SWP_SHOWWINDOW = 0x0040;
  public const UInt32 MONITOR_DEFAULTTONEAREST = 0x00000002;

  [StructLayout(LayoutKind.Sequential)]
  public struct MONITORINFO {
    public UInt32 cbSize;
    public RECT rcMonitor;
    public RECT rcWork;
    public UInt32 dwFlags;
  }

  [DllImport("user32.dll", SetLastError=true)]
  public static extern IntPtr MonitorFromWindow(IntPtr hwnd, UInt32 dwFlags);

  [StructLayout(LayoutKind.Sequential)]
  public struct POINT {
    public Int32 x;
    public Int32 y;
  }

  [DllImport("user32.dll", SetLastError=true)]
  public static extern IntPtr MonitorFromPoint(POINT pt, UInt32 dwFlags);

  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MONITORINFO lpmi);
}
"@

Add-Type -TypeDefinition $source -Language CSharp

$script:DpiAwareResult = $false
try { $script:DpiAwareResult = [YTDeckAppBarNative]::SetProcessDpiAwarenessContext([YTDeckAppBarNative]::DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2) } catch { $script:DpiAwareResult = $false }

function Convert-Hwnd([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) { throw 'Empty HWND.' }
  $t = $text.Trim()
  if ($t.StartsWith('0x')) { return [IntPtr]::new([Int64]::Parse($t.Substring(2), [System.Globalization.NumberStyles]::HexNumber)) }
  return [IntPtr]::new([Int64]([UInt64]::Parse($t)))
}

function New-AppBarData([string]$windowHandle) {
  $data = New-Object YTDeckAppBarNative+APPBARDATA
  $data.cbSize = [UInt32][System.Runtime.InteropServices.Marshal]::SizeOf([type]'YTDeckAppBarNative+APPBARDATA')
  $data.hWnd = Convert-Hwnd $windowHandle
  $data.uCallbackMessage = [YTDeckAppBarNative]::RegisterWindowMessage('YTDeckPlayer_AppBar_Message')
  switch ($Edge) {
    'left'   { $data.uEdge = [YTDeckAppBarNative]::ABE_LEFT }
    'right'  { $data.uEdge = [YTDeckAppBarNative]::ABE_RIGHT }
    default  { $data.uEdge = [YTDeckAppBarNative]::ABE_BOTTOM }
  }
  return $data
}

function New-Rect($left, $top, $right, $bottom) {
  $rect = New-Object YTDeckAppBarNative+RECT
  $rect.left = [int]$left
  $rect.top = [int]$top
  $rect.right = [int]$right
  $rect.bottom = [int]$bottom
  return $rect
}

function Get-MonitorRectFromHandle([IntPtr]$hmon) {
  try {
    if ($hmon -ne [IntPtr]::Zero) {
      $mi = New-Object YTDeckAppBarNative+MONITORINFO
      $mi.cbSize = [UInt32][System.Runtime.InteropServices.Marshal]::SizeOf([type]'YTDeckAppBarNative+MONITORINFO')
      if ([YTDeckAppBarNative]::GetMonitorInfo($hmon, [ref]$mi)) {
        return $mi.rcMonitor
      }
    }
  } catch {}
  return $null
}

function Get-NativeMonitorRect([IntPtr]$hwnd) {
  try {
    return Get-MonitorRectFromHandle ([YTDeckAppBarNative]::MonitorFromWindow($hwnd, [YTDeckAppBarNative]::MONITOR_DEFAULTTONEAREST))
  } catch {}
  return $null
}

function Get-TargetMonitorRect() {
  # Resolve the physical rect of the monitor that CONTAINS the target rectangle
  # main.js computed the dock geometry for (passed via -Monitor* args).
  if (($MonitorRight -le $MonitorLeft) -or ($MonitorBottom -le $MonitorTop)) { return $null }
  try {
    $pt = New-Object YTDeckAppBarNative+POINT
    $pt.x = [int](($MonitorLeft + $MonitorRight) / 2)
    $pt.y = [int](($MonitorTop + $MonitorBottom) / 2)
    return Get-MonitorRectFromHandle ([YTDeckAppBarNative]::MonitorFromPoint($pt, [YTDeckAppBarNative]::MONITOR_DEFAULTTONEAREST))
  } catch {}
  return $null
}

function Test-ValidRect($rect) {
  return ($rect -ne $null) -and ($rect.right -gt $rect.left) -and ($rect.bottom -gt $rect.top)
}

$script:MonitorRectSource = 'args'

function Set-FullMonitorRect([ref]$data) {
  # Resolve the intended TARGET monitor first (center of the -Monitor* rect the
  # main process asked for), and only fall back to the monitor currently under
  # the HWND. Docking on a secondary monitor can race the window move: if this
  # helper asks MonitorFromWindow while the window still sits on the previous
  # monitor, the appbar gets registered there and SetWindowPos pins the deck at
  # unintended coordinates. Using the requested monitor rect avoids that, while
  # still letting Windows supply the exact physical geometry (mixed-DPI safe).
  $target = Get-TargetMonitorRect
  if (Test-ValidRect $target) {
    $script:MonitorRectSource = 'targetPoint'
    $data.Value.rc = $target
    return
  }
  $native = Get-NativeMonitorRect $data.Value.hWnd
  if (Test-ValidRect $native) {
    $script:MonitorRectSource = 'window'
    $data.Value.rc = $native
    return
  }
  $script:MonitorRectSource = 'args'
  $data.Value.rc = New-Rect $MonitorLeft $MonitorTop $MonitorRight $MonitorBottom
}

function Apply-Thickness([ref]$data) {
  $t = [Math]::Max(1, $Thickness)
  $left = $data.Value.rc.left
  $top = $data.Value.rc.top
  $right = $data.Value.rc.right
  $bottom = $data.Value.rc.bottom
  switch ($Edge) {
    'left'  { $right = $left + $t }
    'right' { $left = $right - $t }
    default { $top = $bottom - $t }
  }
  $data.Value.rc = New-Rect $left $top $right $bottom
}

function StatusObject($ok, $message, [ref]$data, $removeResult, $newResult, $queryResult, $setResult) {
  return @{
    ok = $ok
    message = $message
    action = $Action
    edge = $Edge
    hwnd = $Hwnd
    hwndValid = [YTDeckAppBarNative]::IsWindow($data.Value.hWnd)
    cbSize = $data.Value.cbSize
    dpiAware = $script:DpiAwareResult
    inputs = @{
      monitorLeft = $MonitorLeft
      monitorTop = $MonitorTop
      monitorRight = $MonitorRight
      monitorBottom = $MonitorBottom
      thickness = $Thickness
      usedNativeMonitorRect = ($script:MonitorRectSource -ne 'args')
      monitorRectSource = $script:MonitorRectSource
    }
    results = @{
      remove = $removeResult.ToInt64()
      new = $newResult.ToInt64()
      query = $queryResult.ToInt64()
      set = $setResult.ToInt64()
    }
    rect = @{
      left = $data.Value.rc.left
      top = $data.Value.rc.top
      right = $data.Value.rc.right
      bottom = $data.Value.rc.bottom
    }
  }
}


function Write-Status($obj) {
  $json = $obj | ConvertTo-Json -Depth 6 -Compress
  if (-not [string]::IsNullOrWhiteSpace($StatusFile)) {
    try { [System.IO.File]::WriteAllText($StatusFile, $json, [System.Text.Encoding]::UTF8) } catch { [Console]::Error.WriteLine('Write-Status failed: ' + $_.Exception.Message) }
  }
  $json
}

function Parent-IsAlive() {
  if ($ParentPid -le 0) { return $true }
  try { $null = Get-Process -Id $ParentPid -ErrorAction Stop; return $true } catch { return $false }
}

function Wait-Until-Stop() {
  if (-not $KeepAlive) { return }
  while ($true) {
    if (-not [string]::IsNullOrWhiteSpace($StopFile) -and [System.IO.File]::Exists($StopFile)) { break }
    if (-not (Parent-IsAlive)) { break }
    Start-Sleep -Milliseconds 250
  }
}

$data = New-AppBarData $Hwnd

try {
  # 'remove' must be allowed for DEAD HWNDs: after a crash / hard kill the shell
  # can keep a stale appbar reservation keyed to the old window handle, and the
  # only way to release that work area is ABM_REMOVE with that same handle.
  if (($Action -ne 'remove') -and -not [YTDeckAppBarNative]::IsWindow($data.hWnd)) {
    throw "The HWND is not a valid top-level window: $Hwnd"
  }

  if ($Action -eq 'remove') {
    $remove = [YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_REMOVE, [ref]$data)
    Write-Status @{ ok = $true; action = 'remove'; hwnd = $Hwnd; result = $remove.ToInt64(); hwndValid = [YTDeckAppBarNative]::IsWindow($data.hWnd) }
    exit 0
  }

  # AppBar registration is associated with the Electron window HWND.  The helper
  # must NOT unregister in a finally block; otherwise Windows removes the reserved
  # work area as soon as this helper exits.
  Set-FullMonitorRect ([ref]$data)
  $removeResult = [YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_REMOVE, [ref]$data)
  $newResult = [YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_NEW, [ref]$data)

  Set-FullMonitorRect ([ref]$data)
  $queryResult = [YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_QUERYPOS, [ref]$data)
  Apply-Thickness ([ref]$data)
  $setResult = [YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_SETPOS, [ref]$data)

  $ok = (($newResult.ToInt64() -ne 0) -and ($setResult.ToInt64() -ne 0))
  $message = if ($ok) { 'AppBar registered and resident helper is keeping the reserved work area alive.' } else { 'ABM_NEW or ABM_SETPOS returned 0. The shell did not accept this HWND/position as an appbar.' }

  # Put the actual Electron window exactly on the rectangle accepted by the shell.
  if ($ok) {
    [void][YTDeckAppBarNative]::SetWindowPos(
      $data.hWnd,
      [YTDeckAppBarNative]::HWND_TOPMOST,
      $data.rc.left,
      $data.rc.top,
      [Math]::Max(1, $data.rc.right - $data.rc.left),
      [Math]::Max(1, $data.rc.bottom - $data.rc.top),
      [YTDeckAppBarNative]::SWP_NOACTIVATE -bor [YTDeckAppBarNative]::SWP_SHOWWINDOW
    )
    [void][YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_WINDOWPOSCHANGED, [ref]$data)
  }

  $status = StatusObject $ok $message ([ref]$data) $removeResult $newResult $queryResult $setResult
  Write-Status $status
  if ($ok -and $KeepAlive) {
    Wait-Until-Stop
    try { [void][YTDeckAppBarNative]::SHAppBarMessage([YTDeckAppBarNative]::ABM_REMOVE, [ref]$data) } catch {}
    Write-Status @{ ok = $true; action = 'removed'; hwnd = $Hwnd; message = 'AppBar removed after stop signal.' }
    exit 0
  }
  if ($ok) { exit 0 } else { exit 2 }
}
catch {
  Write-Status @{ ok = $false; action = $Action; hwnd = $Hwnd; message = $_.Exception.Message }
  exit 1
}
