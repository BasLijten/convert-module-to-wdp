(function(Speak) {

    Speak.pageCode(["publishingUtils", "publishingConstants", "publishingShared"],
        function(Utils, Constants, Shared) {

            // Gets messages, and displays a message about doing a full re-publish
            var toggleDisplay = function() {
                this.SearchDataSourceMessages.on("change:HasData",
                    function() {
                        var message = Utils.findItem(this.SearchDataSourceMessages.Items,
                            Constants.itemIds.fullRePublishWarning);

                        this.MessageBar.add(message);
                    },
                    this);
            };

            // Toggles the publish page and success page
            var toggleBorders = function(showPublish) {
                this.BorderPublish.IsVisible = !!showPublish;
                this.BorderSuccess.IsVisible = !!!showPublish;
            };
            var renderListControl = function(data) {
                var options = {
                    appendTranslations: true
                };

                Utils.setTranslations(this.ListControlItemInfo.ColumnDefinitionItems);
                Utils.parseData([data], options);
                this.ListControlItemInfo.reset([data]);

                toggleBorders.call(this);
            };

        // Execute publish and navigate to success page if possible
        var executePublish = function () {
            var list = this.CheckBoxListAdvanced,
                checkedItems = list.CheckedItems,
                syncWithTargetItem = list.getByValue(Constants.itemIds.syncWithTarget),
                newPublishJob = {};

            newPublishJob[Constants.serviceParameters.itemId] = Constants.itemIds.sitecoreRoot;
            newPublishJob[Constants.serviceParameters.includeDescendantItems] = true;
            newPublishJob[Constants.serviceParameters.languages] =
                this.CheckBoxListLanguages.CheckedItems.map(function (t) {
                    return { "Code": t.Code, "DisplayName": t.DisplayName };
                });
            newPublishJob[Constants.serviceParameters.targets] = this.CheckBoxListTargets.CheckedItems.map(function (t) {
                return { "Id": t.Code, "Name": t.DisplayName };
            });
            newPublishJob[Constants.serviceParameters.syncWithTarget] = checkedItems.indexOf(syncWithTargetItem) !== -1;
            newPublishJob[Constants.serviceParameters.sourceDatabase] =
                Sitecore.Speak.Context.current().contentDatabase;

                newPublishJob[Constants.serviceParameters.metadata] = {};
                newPublishJob[Constants.serviceParameters.metadata][Constants.serviceParameters.clearAllCaches] =
                    this.CheckBoxClearCache.IsChecked.toString();
                newPublishJob[Constants.serviceParameters.metadata][Constants.serviceParameters.fullRepublish] =
                    this.CheckBoxFullRepublish.IsChecked.toString();

                var dialog = this;

            $.ajax({
                url: Constants.urls.jobServiceUrl + Constants.urls.fullRepublish,
                method: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(newPublishJob)
            })
                .done(function (data) {
                    dialog.MessageBar.IsVisible = false;
                    dialog.GenericDataSourceItemInfo.ServiceUrl = Constants.urls.jobServiceUrl + data.Id;
                    dialog.GenericDataSourceItemInfo.loadData({
                        onSuccess: renderListControl.bind(dialog)
                    });
                })
                .fail(function (jqXHR) {
                    dialog.MessageBar.IsVisible = false;
                    if (jqXHR.status === 401) {
                        window.top.location.href = "/sitecore/login";
                    } else {

                        var message = Utils.findItem(dialog.SearchDataSourceMessages.Items,
                            Constants.itemIds.publishError);

                        dialog.MessageBar.add(message);
                    }
                });
        };

            return {
                initialized: function() {
                    Shared.statusCheck.call(this);
                    Shared.setDefaultCheckboxes.call(this);
                    toggleDisplay.call(this);

                    this.on("publish", executePublish);
                    this.on("show:DialogWindow", toggleBorders);
                }
            };
        },
        "SubAppRendererFullRePublish");

})(Sitecore.Speak);