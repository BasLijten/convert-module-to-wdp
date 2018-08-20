<#Param (
    [parameter(Mandatory=$true)][string]$modulePath = "\sitecoremodule\publishing\"
)#>
$moduleName = "Sitecorepublisher"
$modulePath = "sitecoremodule\publishing"
$itemPath = "$($PSScriptRoot)\test-files\$($modulePath)\items\" 
$items = Get-ChildItem -Path $itemPath -Recurse -Filter "xml"
[string[]]$files = @()
$items | foreach { 
    $path = $_.FullName
    $guid = ([regex]::Matches($path,'{([-0-9A-F]+?)}'))[0].Value
    $file = $path.Substring(0, $path.IndexOf($guid))
    $files += $file
    $file
}

$pathToFind = $files[$files.Count-1]
[string[]]$parentArray = @()
    
for($i=$files.Count-1; $i -ge 0;$i--) {
    if($i -eq 1)
    {
        $a = "bla"
    }
    
    $file = $files[$i]

    Write-Host "$pathToFind $file"
    #if current string hasn't been found, than add current pathToFind as parent and set current entry as new parent
    if($file -notlike "$($pathToFind)*")
    {        
        $parentArray += $pathToFind.Replace($itemPath, "")
        $pathToFind = $file
        Write-Host "new path to find: $pathToFind"

        #edge case. When last file and change has been executed, incorporate path
        if($i -eq 0)
        {

        }
    }
}

# fix for broken iteration
$pathToFind = ""
if($file -notlike "$($pathToFind)*")
    {        
        $parentArray += $pathToFind.Replace($itemPath, "")
        $pathToFind = $file
        Write-Host "new path to find: $pathToFind"
    }


$configurationLocation = "$($PSScriptRoot)\templates\unicorn.template.config.xml"
[xml]$config = Get-Content $configurationLocation
for($j=0;$j -lt $parentArray.Count;$j++)  {
    $currentItem = $parentArray[$j];
    $currentItem = $currentItem.Replace($itemPath, "")
    $database = $currentItem.Split('\')[0];
    $sitecorepath =$currentItem.Substring($database.Length+1, $currentItem.Length-($database.Length+1))
    $sitecorepath
    $name = "$moduleName-$j"
    [xml]$xml = "<include name=`"$name`" database=`"$($database)`" path=`"$($sitecorepath)`" />"
    $config.configuration.sitecore.unicorn.configurations.configuration.predicate.AppendChild($config.ImportNode($xml.include,$true))
}

$config.configuration.sitecore.unicorn.configurations.configuration.predicate





