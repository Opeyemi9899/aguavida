# AGUAVIDA static server — PowerShell + HttpListener, no dependencies.
# Serves this folder on http://localhost:8080/ (index.html for /).
param([int]$Port = 8080)
$root = $PSScriptRoot
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.js'='text/javascript; charset=utf-8'; '.mjs'='text/javascript; charset=utf-8'
  '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'
  '.woff'='font/woff'; '.woff2'='font/woff2'; '.ico'='image/x-icon'
  '.glb'='model/gltf-binary'; '.gltf'='model/gltf+json'
  '.mp4'='video/mp4'; '.webm'='video/webm'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "AGUAVIDA serving $root -> http://localhost:$Port/ (Ctrl+C to stop)"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/').Replace('/', '\')
      if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
      $path = Join-Path $root $rel
      if ((Test-Path $path -PathType Container)) { $path = Join-Path $path 'index.html' }
      if (Test-Path $path -PathType Leaf) {
        $ext = [IO.Path]::GetExtension($path).ToLower()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [IO.File]::ReadAllBytes($path)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
        $msg = [Text.Encoding]::UTF8.GetBytes('404 — not found: ' + $req.Url.AbsolutePath)
        $res.ContentType = 'text/plain; charset=utf-8'
        $res.ContentLength64 = $msg.Length
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    } catch { $res.StatusCode = 500 } finally { $res.OutputStream.Close() }
  }
} finally { $listener.Stop() }
