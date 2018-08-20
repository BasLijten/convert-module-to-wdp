==========================================================
***Important! Copy and save this information***
==========================================================
    BEFORE YOU CLICK NEXT:
    - Ensure you have installed and configured the Sitecore Publishing Service (this module only enables integration with the service)
        Documentation detailing how to install the service is available seperately.

        [Warning] This module will not work without a properly configured service instance.  No items will be able to be published.
    
    AFTER YOU CLOSE THE WIZARD:
    After the package is installed, follow these steps to complete the Sitecore Publishing Module installation:
    - Configure the service endpoints:
        Add a configuration file which overrides the 'PublishingServiceUrlRoot' setting to point to your service module        
        Make sure the address contains a trailing slash
        e.g.
            <?xml version="1.0" encoding="utf-8"?>
            <configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
              <sitecore>
                <settings>
                  <setting name="PublishingServiceUrlRoot">http://sitecore.publishing/</setting>
                </settings>    
              </sitecore>
            </configuration>
    - Configure the Content Delivery Servers:
        Ensure that the following file is in the website 'App_Config/Modules/PublishingService' directory:
            * Sitecore.Publishing.Service.Delivery.config
        Ensure that the following files exist in the website 'bin' directory:
            * Sitecore.Publishing.Service.dll
            * Sitecore.Publishing.Service.Abstractions.dll
            * Sitecore.Publishing.Service.Delivery.dll