# Generate a PNG logo for the dashboard
param([string]$OutputPath, [int]$Size = 256)

Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap($Size, $Size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# WhatsApp green gradient circle
$rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(37, 211, 102), [System.Drawing.Color]::FromArgb(7, 94, 84), 45)
$g.FillEllipse($brush, 1, 1, $Size - 2, $Size - 2)

# White phone bubble
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$bubbleSize = [int]($Size * 0.55)
$bubbleX = [int](($Size - $bubbleSize) / 2)
$bubbleY = [int](($Size - $bubbleSize) / 2.2)
$g.FillEllipse($white, $bubbleX, $bubbleY, $bubbleSize, $bubbleSize)

# Phone arc
$phoneSize = [int]($bubbleSize * 0.45)
$phoneX = $bubbleX + [int](($bubbleSize - $phoneSize) / 2)
$phoneY = $bubbleY + [int](($bubbleSize - $phoneSize) / 2)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(7, 94, 84), [int]($Size * 0.07))
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($pen, $phoneX, $phoneY, $phoneSize, $phoneSize, 135, 270)

$g.Dispose()
$bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "PNG logo created: $OutputPath"
