(function (Speak) {

    require.config({
        paths: {
            entityService: "/sitecore/shell/client/Services/Assets/lib/entityservice"
        }
    });

    Speak.pageCode(["publishingUtils", "publishingConstants", "publishingShared", "entityService", "publishingPreferences"],
        function (Utils, Constants, Shared, EntityService, Preferences) {
            var id;
            var sourceDatabase;

            // Execute publish and navigate to success page if possible
            var executePublish = function () {
                var list = this.PublishTabApp.CheckBoxListOptions,
                    checkedItems = list.CheckedItems,
                    publishSubItemsItem = list.getByValue(Constants.itemIds.publishSubItems),
                    publishRelatedItemsItem = list.getByValue(Constants.itemIds.publishRelatedItems),
                    newPublishJob = {};

                var publishDescendant = checkedItems.indexOf(publishSubItemsItem) !== -1;
                var publishRelated = checkedItems.indexOf(publishRelatedItemsItem) !== -1;
                var languages = this.PublishTabApp.CheckBoxListLanguages.CheckedItems.map(function (t) {
                    return { "Code": t.Code, "DisplayName": t.DisplayName };
                });
                var targets = this.PublishTabApp.CheckBoxListTargets.CheckedItems.map(function (t) {
                    return { "Id": t.Code, "Name": t.DisplayName };
                });

                newPublishJob[Constants.serviceParameters.itemId] = id;
                newPublishJob[Constants.serviceParameters.includeDescendantItems] = publishDescendant;
                newPublishJob[Constants.serviceParameters.includeRelatedItems] = publishRelated;
                newPublishJob[Constants.serviceParameters.languages] = languages;
                newPublishJob[Constants.serviceParameters.targets] = targets;
                newPublishJob[Constants.serviceParameters.sourceDatabase] = sourceDatabase;

                var dialog = this;

                var url = Constants.urls.jobServiceUrl + Constants.urls.itemPublish;

                if (id.length === 0) {
                    url = Constants.urls.jobServiceUrl + Constants.urls.fullRepublish;
                }

                Preferences.SetCookie(publishDescendant, publishRelated, languages, targets);

                $.ajax({
                    url: url,
                    method: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(newPublishJob)
                })
                    .done(function (data) {
                        window.location = Constants.urls.successPage + "?" + Constants.parameters.jobId + "=" + data.Id;
                    })
                    .fail(function (jqXHR) {
                        if (jqXHR.status === 401) {
                            window.top.location.href = "/sitecore/login";
                        } else {
                            var message = Utils.findItem(dialog.SearchDataSourceMessages.Items,
                                Constants.itemIds.publishError);
                            dialog.MessageBar.add(message);
                        }
                    });
            };

            // Toggles the elements depending whether the URL has an id or not
            var toggleElements = function (hasId) {
                this.BorderOptions.IsVisible = hasId;
                this.ListControlItemInfo.IsVisible = hasId;
                this.BorderListControlReplacementSpacer.IsVisible = !hasId;
            };

            var getItemInfo = function () {
                var dashboard = this;

                var entityService = new EntityService({
                    url: "/sitecore/api/ssc/publishing/itemdetails"
                });

                entityService.fetchEntity(id)
                    .execute()
                    .then(function (item) {
                        var items = [];

                        var scItem = {};
                        scItem.ItemID = item.Id;
                        scItem.DisplayName = item.DisplayName;
                        scItem.ItemPath = item.ItemPath;

                        items.push(scItem);

                        Utils.setTranslations(dashboard.ListControlItemInfo.ColumnDefinitionItems);
                        Utils.parseData(items, { appendTranslations: true });

                        dashboard.ListControlItemInfo.reset(items);
                    });
            };

            // Gets messages, and displays a message or ListControl depending whether the URL has an id or not
            var toggleDisplay = function () {
                var hasId = !!id;

                if (hasId) {
                    getItemInfo.call(this);
                } else {
                    this.SearchDataSourceMessages.on("change:HasData",
                        function () {
                            var message = Utils.findItem(this.SearchDataSourceMessages.Items,
                                Constants.itemIds.fullsitePublishWarning);

                            this.parent.MessageBar.add(message);
                        },
                        this);
                }

                toggleElements.call(this, hasId);
            };

            return {
                initialized: function () {
                    id = Speak.utils.url.parameterByName(Constants.parameters.id);
                    sourceDatabase = Speak.utils.url.parameterByName(Constants.parameters.sourceDatabase);

                    if (sourceDatabase.length === 0) {
                        sourceDatabase = Sitecore.Speak.Context.current().contentDatabase;
                    }

                    Shared.setDefaultCheckboxes.call(this);
                    toggleDisplay.call(this);

                    this.parent.ButtonPublish.on("click",
                        function () {
                            executePublish.call(this.parent);
                        },
                        this);

                    this.CheckBoxListLanguages.IsVisible = true;
                    this.CheckBoxListTargets.IsVisible = true;

                    this.ProgressIndicatorPanelPublish.viewModel.IsBusy(false);
                },

                publish: function () {
                    executePublish.call(this);
                }
            };
        },
        "PublishTabApp");
})(Sitecore.Speak);