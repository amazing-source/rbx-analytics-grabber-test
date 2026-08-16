param([string]$Stage, [string]$Out)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path -LiteralPath $Out) { Remove-Item -LiteralPath $Out -Force }

$zip = [System.IO.Compression.ZipFile]::Open($Out, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    # [Content_Types].xml must be first in the archive.
    $entries = @(
        @{ File = '[Content_Types].xml'; Name = '[Content_Types].xml' },
        @{ File = '_rels\.rels';                 Name = '_rels/.rels' },
        @{ File = 'word\document.xml';           Name = 'word/document.xml' },
        @{ File = 'word\styles.xml';             Name = 'word/styles.xml' },
        @{ File = 'word\numbering.xml';          Name = 'word/numbering.xml' },
        @{ File = 'word\_rels\document.xml.rels'; Name = 'word/_rels/document.xml.rels' }
    )
    foreach ($e in $entries) {
        $src = Join-Path $Stage $e.File
        if (-not (Test-Path -LiteralPath $src)) { throw "missing part: $src" }
        $entry = $zip.CreateEntry($e.Name, [System.IO.Compression.CompressionLevel]::Optimal)
        $dst = $entry.Open()
        $bytes = [System.IO.File]::ReadAllBytes($src)
        $dst.Write($bytes, 0, $bytes.Length)
        $dst.Close()
    }
}
finally { $zip.Dispose() }

$size = (Get-Item -LiteralPath $Out).Length
Write-Output "wrote $Out ($size bytes)"
