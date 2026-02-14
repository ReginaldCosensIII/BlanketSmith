# Define Project Roots
$ToolPublic = "apps/tool/public"
$LandingPublic = "apps/landing-page/public"
$ToolArchive = "$ToolPublic/unused-archive"
$LandingArchive = "$LandingPublic/unused-archive"

# Ensure Archive Dirs Exist
if (!(Test-Path $ToolArchive)) { New-Item -ItemType Directory -Path $ToolArchive | Out-Null }
if (!(Test-Path $LandingArchive)) { New-Item -ItemType Directory -Path $LandingArchive | Out-Null }

# Define Whitelist (Relative to repo root)
$Whitelist = @(
    "apps\tool\public\branding\logos\Horizontal-Lockup-No-Slogan.svg",
    "apps\tool\public\favicon-16x16.png",
    "apps\tool\public\favicon-32x32.png",
    "apps\tool\public\favicon.ico",
    "apps\tool\public\robots.txt",
    "apps\tool\public\site.webmanifest",
    "apps\landing-page\public\email-assets\horizontal-logo-white.png",
    "apps\landing-page\public\email-assets\vertical-logo-no-slogan-white.png",
    "apps\landing-page\public\email-assets\favicon-heart-v2.png",
    "apps\landing-page\public\email-assets\icons\374FD9\image-sparkle.png",
    "apps\landing-page\public\email-assets\icons\374FD9\dashboard.png",
    "apps\landing-page\public\email-assets\icons\374FD9\spanner.png",
    "apps\landing-page\public\email-assets\icons\374FD9\community.png",
    "apps\landing-page\public\email-assets\icons\374FD9\light-bulb.png",
    "apps\landing-page\public\favicon.ico",
    "apps\landing-page\public\robots.txt",
    "apps\landing-page\public\placeholder.svg"
)

# Helper function to move files
function Move-If-Unused {
    param (
        [string]$Path,
        [string]$ArchiveRoot
    )
    
    Get-ChildItem -Path $Path -Recurse -File | ForEach-Object {
        $RelPath = $_.FullName.Replace("$PWD\", "")
        
        # Check if file is in whitelist or is already in archive
        if ($RelPath -in $Whitelist) {
            Write-Host "Keeping: $RelPath" -ForegroundColor Green
        } elseif ($RelPath -like "*unused-archive*") {
            # Skip files already in archive
        } else {
            Write-Host "Archiving: $RelPath" -ForegroundColor Yellow
            
            # Construct Destination Path
            # We want to preserve structure inside archive
            # e.g. apps/tool/public/branding/logos/foo.svg -> apps/tool/public/unused-archive/branding/logos/foo.svg
            
            # Extract relative path from Public folder
            # $Path is likely "apps/tool/public"
            # We need the part AFTER "apps/tool/public/"
            
            # Simplest way: just mirror the structure relative to the Public root
            if ($Path -like "*apps\tool\public*") {
                $SubPath = $_.FullName.Replace("$PWD\apps\tool\public\", "")
                $Dest = Join-Path $ArchiveRoot $SubPath
            } elseif ($Path -like "*apps\landing-page\public*") {
                $SubPath = $_.FullName.Replace("$PWD\apps\landing-page\public\", "")
                $Dest = Join-Path $ArchiveRoot $SubPath
            } else {
                return 
            }

            $DestDir = Split-Path $Dest
            if (!(Test-Path $DestDir)) { New-Item -ItemType Directory -Path $DestDir | Out-Null }
            Move-Item -Path $_.FullName -Destination $Dest -Force
        }
    }
}

# Run Move
Write-Host "Cleaning apps/tool/public..."
Move-If-Unused -Path $ToolPublic -ArchiveRoot $ToolArchive

Write-Host "Cleaning apps/landing-page/public..."
Move-If-Unused -Path $LandingPublic -ArchiveRoot $LandingArchive

Write-Host "Cleanup Complete."
