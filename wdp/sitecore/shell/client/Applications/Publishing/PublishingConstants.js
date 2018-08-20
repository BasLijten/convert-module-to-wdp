define([],
    function() {
        return {
            updateInterval: 10000,
            dateTimeFormat: "short",
            urls: {
                jobServiceUrl: "/sitecore/api/ssc/publishing/jobs/",
                maintenanceServiceUrl: "/sitecore/api/ssc/publishing/maintenance/",
                itemPublish: "0/ItemPublish",
                fullRepublish: "0/FullPublish",
                canRepublish: "/CanRepublish",
                republish: "0/Republish",
                maintenanceTaskRunning: "0/IsRunning",
                successPage: "/sitecore/client/Applications/Publishing/PublishDialogSuccess"
            },
            parameters: {
                jobId: "jobId",
                id: "id",
                sourceDatabase: "sourceDatabase"
            },
            seperators: {
                explaination: ":",
                parsed: ", "
            },
            itemIds: {
                sitecoreRoot: "{11111111-1111-1111-1111-111111111111}",
                publishSubItems: "{DF6E63A1-39A6-4EBC-91E4-1791D5B28233}",
                publishRelatedItems: "{FC7B2755-7D25-4AB6-863B-7B39EFF23AF0}",
                fullsitePublishWarning: "{19C4ADF3-5C7C-4BA7-BB83-CEC1633ABCB5}",
                fullRePublishWarning: "{BBF2B1F1-94EF-471D-9D62-D4DB7775F53A}",
                forceCheckingLanguages: "{21C45904-2199-46B9-9352-A29F019CFE0B}",
                forceCheckingTargets: "{8D0B42F6-520D-4043-AB65-B396C61A5E3E}",
                syncWithTarget: "{EA326E58-A67E-4AA4-8EFB-52608E60FE9B}",
                publishError: "{C88310D3-D637-41DA-B049-972BAE6B7455}"
            },
            serviceParameters: {
                itemId: "ItemId",
                includeDescendantItems: "IncludeDescendantItems",
                includeRelatedItems: "IncludeRelatedItems",
                languages: "Languages",
                targets: "Targets",
                syncWithTarget: "SyncWithTarget",
                sourceDatabase: "sourceDatabase",
                metadata: "metadata",
                fullRepublish: "Publish.Options.Republish",
                clearAllCaches: "Publish.Options.ClearAllCaches"
            }
        };
    });