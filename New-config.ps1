<#Param (
    [parameter(Mandatory=$true)][string]$modulePath = "\sitecoremodule\publishing\"
)#>
$moduleLocation = "$($PSScriptRoot)\modules\"
$moduleName = "Sitecorepublisher"
$modulePath = "sitecoremodule\publishing"
$itemPath = "$($PSScriptRoot)\test-files\$($modulePath)\items\" 
$rootDatalocation = "$($PSScriptRoot)\temp"
$items = Get-ChildItem -Path $itemPath -Recurse -Filter "xml"
[string[]]$files = @()
$items | foreach { 
    $path = $_.FullName
    $guid = ([regex]::Matches($path,'{([-0-9A-F]+?)}'))[0].Value
    $file = $path.Substring(0, $path.IndexOf($guid))
    $files += $file    
    #$file
}

## backward iteration through paths. The ultimate parentPath always appears as last, in a reverse order as first. Until a path has been found which doesn't include
# the rootPath, this one remains the rootpath. Afterwards, set the new rootPath.
$pathToFind = "initialPathToFind"
[string[]]$parentArray = @()
    
for($i=$files.Count-1; $i -ge 0;$i--) {    
    $file = $files[$i]
    Write-Host "$pathToFind $file"
    #if current string hasn't been found, than add current pathToFind as parent and set current entry as new parent
    if($file -notlike "$($pathToFind)*")
    {        
        $temp = $file
        $temp = $temp.Replace($itemPath, "")
        $temp = $temp.Replace("\", "/")
        $parentArray += $temp
        $pathToFind = $file
#        Write-Host "new path to find: $pathToFind"        
    }
}

$configurationLocation = "$($PSScriptRoot)\templates\unicorn.template.config.xml"
[xml]$config = Get-Content $configurationLocation
for($j=0;$j -lt $parentArray.Count;$j++)  {
    $currentItem = $parentArray[$j];
    $currentItem = $currentItem.Replace($itemPath, "")
    $database = $currentItem.Split('/')[0];
    $sitecorepath =$currentItem.Substring($database.Length, $currentItem.Length-($database.Length)-1)
    $sitecorepath
    $name = "$moduleName-$j"
    [xml]$xml = "<include name=`"$name`" database=`"$($database)`" path=`"$($sitecorepath)`" />"
    $config.configuration.sitecore.unicorn.configurations.configuration.predicate.AppendChild($config.ImportNode($xml.include,$true))
}
$config.configuration.sitecore.'sc.variable'.name="$($moduleName)DataLocation"
$config.configuration.sitecore.'sc.variable'.value="$($rootDatalocation)"
$config.configuration.sitecore.unicorn.configurations.configuration.targetDataStore.physicalRootPath = "`$($($moduleName)DataLocation)\$($moduleName)"
$config.configuration.sitecore.unicorn.configurations.configuration.name="$moduleName"
$config.configuration.sitecore.unicorn.configurations.configuration.predicate.name="$moduleName"

$config.Save("SPS.config")





