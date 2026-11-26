[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Manifest,
    [Parameter(Mandatory)][string]$ClipDirectory,
    [Parameter(Mandatory)][string]$PosterDirectory,
    [Parameter(Mandatory)][string]$OutputPath,
    [string]$BoardDirectory,
    [string]$MotionDirectory,
    [ValidateRange(72,4032)][double]$WidthPoints = 960,
    [ValidateRange(72,4032)][double]$HeightPoints = 540
)
$ErrorActionPreference = 'Stop'
$steps = @(Get-Content -LiteralPath $Manifest -Raw -Encoding UTF8 | ConvertFrom-Json)
if (!$steps.Count) { throw 'The manifest has no visible steps.' }
$target = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath)
if ([IO.Path]::GetExtension($target) -ne '.pptx' -or [IO.File]::Exists($target)) {
    throw 'Choose a new .pptx output path.'
}
$folder = [IO.Path]::GetDirectoryName($target)
$null = [IO.Directory]::CreateDirectory($folder)
$tempDeck = Join-Path $folder (([guid]::NewGuid()).ToString() + '.pptx')
function AssetPath($directory, $name) {
    return (Get-Item -LiteralPath (Join-Path $directory $name) -ErrorAction Stop).FullName
}
if ($MotionDirectory) {
    $motionFolder = (Get-Item -LiteralPath $MotionDirectory -ErrorAction Stop).FullName
    $knownNames = @($steps | ForEach-Object { "$($_.id).gif" })
    foreach ($entry in Get-ChildItem -LiteralPath $motionFolder -File -Filter '*.gif') {
        if ($entry.Name -notin $knownNames) { throw "No manifest step matches $($entry.Name)" }
    }
}
$assets = foreach ($r in $steps) {
    if ($r.id -notmatch '^\d+-\d+$') { throw "Unexpected manifest ID: $($r.id)" }
    $clip = AssetPath $ClipDirectory "$($r.id).mp4"
    $poster = AssetPath $PosterDirectory "$($r.id).jpg"
    $boardImage = if ($BoardDirectory) { AssetPath $BoardDirectory "$($r.id).png" }
    $raw = & ffprobe -v error -show_streams -of json $clip
    if ($LASTEXITCODE) { throw "ffprobe failed: $clip" }
    $streams = ($raw -join [Environment]::NewLine | ConvertFrom-Json).streams
    $v = @($streams | Where-Object { $_.codec_type -eq 'video' })[0]
    if (!$v -or $v.codec_name -ne 'h264' -or $v.sample_aspect_ratio -notin @($null,'N/A','1:1') -or
        [Math]::Abs($v.width / $v.height - $WidthPoints / $HeightPoints) -gt 0.005) {
        throw "Expected square-pixel H.264 at the chosen slide aspect ratio: $clip"
    }
    $dur = [double]::Parse([string]$v.duration, [Globalization.CultureInfo]::InvariantCulture)
    $rate = ([string]$v.avg_frame_rate).Split('/')
    $tolerance = if ($rate.Count -eq 2 -and [double]$rate[0] -gt 0) { [double]$rate[1] / [double]$rate[0] + 0.002 } else { 0.05 }
    if ([Math]::Abs($dur - [double]$r.seconds) -gt $tolerance) { throw "Clip duration differs from step $($r.id)" }
    if ($r.original.sound -and !($streams | Where-Object { $_.codec_type -eq 'audio' })) { throw "Missing original sound: $clip" }
    $motion = $null
    if ($MotionDirectory) {
        $candidate = Join-Path $motionFolder "$($r.id).gif"
        if ([IO.File]::Exists($candidate)) {
            if (($streams | Where-Object { $_.codec_type -eq 'audio' }) -or $r.original.video) {
                throw "Keep original films and clips with audio as native video: $($r.id)"
            }
            $meta = & ffprobe -v error -select_streams v:0 -show_streams -of json $candidate
            if ($LASTEXITCODE) { throw "ffprobe failed: $candidate" }
            $g = ($meta -join [Environment]::NewLine | ConvertFrom-Json).streams[0]
            $gifSeconds = [double]::Parse([string]$g.duration, [Globalization.CultureInfo]::InvariantCulture)
            if ($g.codec_name -ne 'gif' -or $g.width -ne $v.width -or $g.height -ne $v.height -or
                [Math]::Abs($gifSeconds - $dur) -gt $tolerance) {
                throw "Animation canvas or duration differs from the source clip: $candidate"
            }
            $motion = $candidate
        }
    }
    [pscustomobject]@{ Step=$r; Clip=$clip; Poster=$poster; Board=$boardImage; Motion=$motion }
}

$power = New-Object -ComObject PowerPoint.Application
$deck = $null
try {
    $deck = $power.Presentations.Add(0)
    $deck.PageSetup.SlideWidth = $WidthPoints
    $deck.PageSetup.SlideHeight = $HeightPoints
    $deck.SlideShowSettings.AdvanceMode = 1
    foreach ($asset in $assets) {
        $r = $asset.Step
        $i = $deck.Slides.Count + 1
        $slide = $deck.Slides.Add($i, 12)
        $slide.Name = "P$($r.slide) · $($r.step) $($r.title)"
        if ($asset.Motion) {
            $null = $slide.Shapes.AddPicture($asset.Poster, 0, -1, 0, 0, $WidthPoints, $HeightPoints)
            $anim = $slide.Shapes.AddPicture($asset.Motion, 0, -1, 0, 0, $WidthPoints, $HeightPoints)
            $anim.AlternativeText = $slide.Name
        } else {
            $movie = $slide.Shapes.AddMediaObject2($asset.Clip, 0, -1, 0, 0, $WidthPoints, $HeightPoints)
            $movie.MediaFormat.SetDisplayPictureFromFile($asset.Poster)
            $movie.AlternativeText = $slide.Name
            $play = $movie.AnimationSettings.PlaySettings
            $play.PlayOnEntry = -1
            $play.HideWhileNotPlaying = 0
            $play.RewindMovie = 0
            $play.LoopUntilStopped = if ($r.original.loop) { -1 } else { 0 }
            $effect = $slide.TimeLine.MainSequence.Item(1)
            if ($effect.EffectType -ne 83) { throw "Expected a play effect at step $($r.id)" }
            $effect.Timing.TriggerType = 2
            $effect.Timing.TriggerDelayTime = 0
        }
        $slide.SlideShowTransition.AdvanceOnClick = -1
        $slide.SlideShowTransition.AdvanceOnTime = 0
        $hit = $slide.Shapes.AddShape(1, 0, 0, $WidthPoints, $HeightPoints)
        $hit.Name = '单击继续'
        $hit.Fill.Solid()
        $hit.Fill.Transparency = 1
        $hit.Line.Visible = 0
        $hit.ActionSettings.Item(1).Action = if ($i -eq $steps.Count) { 6 } else { 1 }

        $notesPage = $slide.NotesPage
        $noteLines = @($slide.Name, $r.pace, $r.note, $r.board) | Where-Object { $_ }
        foreach ($ph in $notesPage.Shapes.Placeholders) {
            if ($ph.PlaceholderFormat.Type -eq 2) { $ph.TextFrame.TextRange.Text = $noteLines -join [Environment]::NewLine }
            if ($asset.Board -and $ph.PlaceholderFormat.Type -eq 1) {
                $ph.LockAspectRatio = -1
                $ph.Height = 168
                $ph.Top = 20
                $ph.Left = (540 - $ph.Width) / 2
            }
            if ($asset.Board -and $ph.PlaceholderFormat.Type -eq 2) {
                $ph.Left = 32; $ph.Top = 196; $ph.Width = 476; $ph.Height = 216
                $ph.TextFrame.TextRange.Font.Size = 13
            }
        }
        if ($asset.Board) {
            $board = $notesPage.Shapes.AddPicture($asset.Board, 0, -1, 0, 420, -1, -1)
            $board.LockAspectRatio = -1
            $board.Height = [Math]::Min(250, 476 * $board.Height / $board.Width)
            $board.Left = (540 - $board.Width) / 2
            $board.AlternativeText = [string]$r.board
        }
    }
    $deck.SaveAs($tempDeck, 24)
    $deck.Close()
    $deck = $null
    # PowerPoint can write the default 80% playback gain even when the source film played at full volume.
    $audioSlides = @($steps | Where-Object { $_.original.sound })
    if ($audioSlides.Count) {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $zip = [IO.Compression.ZipFile]::Open($tempDeck, [IO.Compression.ZipArchiveMode]::Update)
        try {
            foreach ($r in $audioSlides) {
                $volume = if ($null -ne $r.original.volume) { [double]$r.original.volume } else { 1.0 }
                if ([double]::IsNaN($volume) -or $volume -lt 0 -or $volume -gt 1) { throw "Invalid volume: $($r.id)" }
                $ordinal = [array]::IndexOf($steps, $r) + 1
                $entry = $zip.GetEntry("ppt/slides/slide$ordinal.xml")
                $stream = $entry.Open()
                try {
                    $xml = New-Object System.Xml.XmlDocument
                    $xml.PreserveWhitespace = $true
                    $xml.Load($stream)
                    $nodes = $xml.GetElementsByTagName('cMediaNode','http://schemas.openxmlformats.org/presentationml/2006/main')
                    if ($nodes.Count -ne 1) { throw "Expected a single media player: $($r.id)" }
                    $nodes[0].SetAttribute('vol', [string][int][Math]::Round(100000 * $volume))
                    $stream.Position = 0
                    $stream.SetLength(0)
                    $xml.Save($stream)
                } finally { $stream.Dispose() }
            }
        } finally { $zip.Dispose() }
    }
    [IO.File]::Move($tempDeck, $target)
    Write-Output "$($steps.Count) slides: $target"
} finally {
    if ($deck) { $deck.Saved = -1; $deck.Close() }
    if ([IO.File]::Exists($tempDeck)) { [IO.File]::Delete($tempDeck) }
}
