(function(Speak) {

    Speak.pageCode(["publishingUtils", "publishingConstants", "publishingShared"],
        function(Utils, Constants, Shared) {
            var updateControls = function(data) {
                var recentData = data.Recent;

                Shared.toggleOverviewMessageBar.call(this, data);

                Utils.parseData(recentData);

                this.ListControlRecentJobs.reset(recentData);
            };

            return {
                initialized: function() {
                    Shared.loadOverviewData.call(this, updateControls);

                    var component = this;

                    this.ListControlRecentJobs.on("change:ClickedItem",
                        function(job) {
                            Shared.jobSelected.apply(component, [job]);
                        });

                    this.SubAppRendererJobDetails.DialogWindow.on("hide",
                        function() {
                            component.ListControlRecentJobs.SelectedItem = null;
                        });
                }
            };
        });

})(Sitecore.Speak);