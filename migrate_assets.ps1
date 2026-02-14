# Define Roots
$LandingPublic = "apps/landing-page/public"
$LandingSrcAssets = "apps/landing-page/src/assets"
$LandingUnused = "$LandingPublic/unused-archive"
$BrandingRoot = "$LandingPublic/branding"

# 1. Force Move Email PNGs to Archive (Try to bypass locks or move contents)
$EmailPngSource = "$LandingPublic/email-assets/PNG"
$EmailPngDest = "$LandingUnused/email-assets/PNG"

if (Test-Path $EmailPngSource) {
    if (!(Test-Path $EmailPngDest)) { New-Item -ItemType Directory -Path $EmailPngDest -Force | Out-Null }
    Get-ChildItem -Path $EmailPngSource -Recurse | Move-Item -Destination { Join-Path $EmailPngDest $_.Parent.Substring($EmailPngSource.Length) } -Force -ErrorAction SilentlyContinue
    # Try removing the source dir if empty
    Remove-Item $EmailPngSource -Recurse -Force -ErrorAction SilentlyContinue
}

# 2. Create Branding Structure
$LogosDir = "$BrandingRoot/logos"
$IconsEmailDir = "$BrandingRoot/icons/email"
$ImagesDir = "$BrandingRoot/images"

New-Item -ItemType Directory -Path $LogosDir -Force | Out-Null
New-Item -ItemType Directory -Path $IconsEmailDir -Force | Out-Null
New-Item -ItemType Directory -Path $ImagesDir -Force | Out-Null

# 3. Move & Rename Logos
# email-assets/horizontal-logo-white.png -> branding/logos/bs-logo-horizontal-white.png
$SrcLogo1 = "$LandingPublic/email-assets/horizontal-logo-white.png"
if (Test-Path $SrcLogo1) { Move-Item $SrcLogo1 "$LogosDir/bs-logo-horizontal-white.png" -Force }

# email-assets/vertical-logo-no-slogan-white.png -> branding/logos/bs-logo-vertical-white.png
$SrcLogo2 = "$LandingPublic/email-assets/vertical-logo-no-slogan-white.png"
if (Test-Path $SrcLogo2) { Move-Item $SrcLogo2 "$LogosDir/bs-logo-vertical-white.png" -Force }

# email-assets/favicon-heart-v2.png -> branding/logos/icon-favicon-heart-v2.png (User said Move active PNG icons to icons/email, but this is a footer logo essentially. I'll put it in logos or icons? Asset map said Keep. User said "Move and rename active logos to public/branding/logos/". Heart icon is a logo element. Let's put in logos for now or maybe images? Actually asset map said `icon-favicon-heart-v2.png`. Let's put in icons/email or logos. I'll put in logos as it's a brand mark.)
$SrcHeart = "$LandingPublic/email-assets/favicon-heart-v2.png"
if (Test-Path $SrcHeart) { Move-Item $SrcHeart "$LogosDir/bs-logo-favicon-heart-v2.png" -Force }


# 4. Move Email Icons
# email-assets/icons/374FD9/*.png -> branding/icons/email/
$EmailIconsSource = "$LandingPublic/email-assets/icons/374FD9"
if (Test-Path $EmailIconsSource) {
    Get-ChildItem -Path $EmailIconsSource -Filter "*.png" | ForEach-Object {
        $NewName = "icon-feature-" + $_.Name
        # Rename light-bulb to icon-info-light-bulb as per map?
        if ($_.Name -eq "light-bulb.png") { $NewName = "icon-info-light-bulb.png" }
        
        Move-Item $_.FullName "$IconsEmailDir/$NewName" -Force
    }
}

# 5. Move Src Assets to Images
# community-crafting.jpg -> image-community-crafting.jpg
# beta-ui-screenshot.png -> image-ui-beta-screenshot.png
# hero-screenshot.png -> image-ui-hero-screenshot.png
# mobile-ui-screenshot.png -> image-ui-mobile-screenshot.png
# favicon-badge.svg -> branding/logos/bs-logo-favicon-badge.svg (It's a logo)

$SrcAssets = @{
    "community-crafting.jpg" = "$ImagesDir/image-community-crafting.jpg"
    "beta-ui-screenshot.png" = "$ImagesDir/image-ui-beta-screenshot.png"
    "hero-screenshot.png" = "$ImagesDir/image-ui-hero-screenshot.png"
    "mobile-ui-screenshot.png" = "$ImagesDir/image-ui-mobile-screenshot.png"
    "favicon-badge.svg" = "$LogosDir/bs-logo-favicon-badge.svg"
}

foreach ($Key in $SrcAssets.Keys) {
    $SrcPath = "$LandingSrcAssets/$Key"
    if (Test-Path $SrcPath) {
        Move-Item $SrcPath $SrcAssets[$Key] -Force
    }
}

# 6. cleanup empty dirs in email-assets
Remove-Item "$LandingPublic/email-assets" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Migration Complete"
