(function(Speak) {

    Speak.pageCode(["publishingUtils", "publishingConstants", "publishingShared"],
        function(Utils, Constants, Shared) {
            var updateControls = function(data) {
                var activeData = data.Active,
                    queuedData = data.Queued,
                    recentData = data.Recent;

                Shared.toggleOverviewMessageBar.call(this, data);
                Shared.maintenanceCheck.call(this);

                Utils.setTranslations(this.ListControlActiveJobs.ColumnDefinitionItems);

                Utils.parseData(activeData, { appendTranslations: true });
                Utils.parseData(queuedData);
                Utils.parseData(recentData);

                this.ListControlActiveJobs.reset(activeData);
                this.ListControlQueuedJobs.reset(queuedData);
                this.ListControlRecentJobs.reset(recentData);

                if (typeof this.ButtonFullRePublish != 'undefined') {
                    if (this.MessageBar.HasErrorMessages) {
                        this.ButtonFullRePublish.IsEnabled = false;
                    } else {
                        this.ButtonFullRePublish.IsEnabled = true;
                    }
                }
            };
            return {
                initialized: function() {
                    Shared.loadOverviewData.call(this, updateControls);

                    Shared.registerHandlebarList();

                    var dashboard = this;

                    this.SubAppRendererJobDetails.DialogWindow.on("hide",
                        function() {
                            dashboard.ListControlRecentJobs.SelectedItem = null;
                        });

                    this.SubAppRendererFullRePublish.DialogWindow.on("hide",
                        function(event) {
                            Shared.loadOverviewData.call(dashboard, updateControls);
                        },
                        this);

                    this.ListControlRecentJobs.on("change:ClickedItem",
                        function(job) {
                            Shared.jobSelected.apply(dashboard, [job]);
                        });

                    this.ListControlQueuedJobs.on("change:ClickedItem",
                        function(job) {
                            Shared.jobSelected.apply(dashboard, [job]);
                        });
                }
            };
        });

})(Sitecore.Speak);