(function(Speak) {

    Speak.pageCode(["publishingUtils", "publishingConstants", "publishingShared"],
        function(Utils, Constants, Shared) {
            var updateControls = function(data) {
                var queuedData = data.Queued;

                Shared.toggleOverviewMessageBar.call(this, data);
                Shared.maintenanceCheck.call(this);

                Utils.parseData(queuedData);

                this.ListControlQueuedJobs.reset(queuedData);
            };

            return {
                initialized: function() {
                    Shared.loadOverviewData.call(this, updateControls);

                    var component = this;

                    Shared.maintenanceCheck.call(this);

                    this.ListControlQueuedJobs.on("change:ClickedItem",
                        function(job) {
                            Shared.jobSelected.apply(component, [job]);
                        });

                    this.SubAppRendererJobDetails.DialogWindow.on("hide",
                        function() {
                            component.ListControlQueuedJobs.SelectedItem = null;
                        });
                }
            };
        });

})(Sitecore.Speak);