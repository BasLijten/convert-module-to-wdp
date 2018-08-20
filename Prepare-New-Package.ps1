
$packagefolder = "$($PSScriptRoot)\packages\" 
$packagename = "Sitecore Publishing Module 3.1.1 rev. 180807.zip"
$destination = "$($PSScriptRoot)\temp\"
$wdppath = "$($PSScriptRoot)\wdp\"
$ymlroot = "$($PSScriptRoot)\tempyml\"
$mergedPackagepath = "$($packagefolder)$($packagename)"
$moduleName = "Sitecorepublisher"

Remove-Item -Path $destination -Recurse -Force
Remove-Item -Path $wdppath -Recurse -Force

$mergedPackagepath

Write-Host "Extract $mergedPackagepath - only package.zip"
Expand-Archive -Path $mergedPackagepath -DestinationPath $destination 

Write-Host "Extract package.zip"
Expand-Archive -Path "$($destination)\package.zip" -DestinationPath $destination
Remove-Item -Path "$($destination)\package.zip"

# build webstructure
New-Item -Path $wdppath -ItemType Directory
Move-Item -Path "$($destination)files\*" -Destination $wdppath

New-Item -Path "$($wdppath)\App_Data\Unicorn\$($moduleName)" -ItemType Directory
Copy-Item -Path "$($ymlroot)$($moduleName)\*" -Destination "$($wdppath)\App_Data\Unicorn\$($moduleName)"


