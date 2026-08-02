# Generate a WhatsApp-style icon (.ico) programmatically
param([string]$OutputPath)

Add-Type -AssemblyName System.Drawing

function New-Icon {
    param([int]$Size, [string]$TempPath)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # WhatsApp green gradient circle background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(37, 211, 102), [System.Drawing.Color]::FromArgb(7, 94, 84), 45)
    $g.FillEllipse($brush, 1, 1, $Size - 2, $Size - 2)

    # Draw WhatsApp-style chat bubble (simplified)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

    # Chat bubble path
    $bubbleSize = [int]($Size * 0.55)
    $bubbleX = [int](($Size - $bubbleSize) / 2)
    $bubbleY = [int](($Size - $bubbleSize) / 2.2)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse($bubbleX, $bubbleY, $bubbleSize, $bubbleSize)
    $g.FillPath($white, $path)

    # Phone handle inside (curved line)
    $phoneSize = [int]($bubbleSize * 0.45)
    $phoneX = $bubbleX + [int](($bubbleSize - $phoneSize) / 2)
    $phoneY = $bubbleY + [int](($bubbleSize - $phoneSize) / 2)

    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(7, 94, 84), [int]($Size * 0.07))
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Phone arc shape
    $g.DrawArc($pen, $phoneX, $phoneY, $phoneSize, $phoneSize, 135, 270)

    $g.Dispose()
    $bmp.Save($TempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

# Create multiple sizes for the .ico file
$tempDir = [System.IO.Path]::GetTempPath()
$sizes = @(16, 32, 48, 64, 128, 256)
$pngs = @()

foreach ($size in $sizes) {
    $pngPath = Join-Path $tempDir "icon_$size.png"
    New-Icon -Size $size -TempPath $pngPath
    $pngs += $pngPath
}

# Use the largest PNG and convert to ICO via direct binary write
function ConvertTo-Icon {
    param([string[]]$PngFiles, [string]$IcoPath)

    $stream = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter($stream)

    # ICO Header
    $writer.Write([uint16]0)        # Reserved
    $writer.Write([uint16]1)        # Type (1 = icon)
    $writer.Write([uint16]$PngFiles.Count)  # Number of images

    $offset = 6 + (16 * $PngFiles.Count)
    $imageData = @()

    foreach ($png in $PngFiles) {
        $data = [System.IO.File]::ReadAllBytes($png)
        $imageData += ,$data

        # Get dimensions from filename
        $size = [int]([System.IO.Path]::GetFileNameWithoutExtension($png) -replace 'icon_', '')

        $writer.Write([byte]($(if ($size -ge 256) { 0 } else { $size })))   # Width
        $writer.Write([byte]($(if ($size -ge 256) { 0 } else { $size })))   # Height
        $writer.Write([byte]0)      # Color palette
        $writer.Write([byte]0)      # Reserved
        $writer.Write([uint16]1)    # Color planes
        $writer.Write([uint16]32)   # Bits per pixel
        $writer.Write([uint32]$data.Length)  # Size of image data
        $writer.Write([uint32]$offset)       # Offset to image data
        $offset += $data.Length
    }

    foreach ($data in $imageData) {
        $writer.Write($data)
    }

    [System.IO.File]::WriteAllBytes($IcoPath, $stream.ToArray())
    $writer.Close()
    $stream.Close()
}

ConvertTo-Icon -PngFiles $pngs -IcoPath $OutputPath

# Cleanup temp files
foreach ($png in $pngs) {
    Remove-Item $png -ErrorAction SilentlyContinue
}

Write-Host "Icon created: $OutputPath"
