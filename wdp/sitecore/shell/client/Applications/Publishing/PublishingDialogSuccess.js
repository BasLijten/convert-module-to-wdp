(function(Speak) {

    Speak.pageCode(["publishingUtils", "publishingConstants"],
        function(Utils, Constants) {
            var renderListControl = function(data) {
                var options = {
                    appendTranslations: true
                };

                Utils.setTranslations(this.ListControlItemInfo.ColumnDefinitionItems);
                Utils.parseData([data], options);
                this.ListControlItemInfo.reset([data]);
            };

            return {
                initialized: function() {
                    var jobId = Speak.utils.url.parameterByName(Constants.parameters.jobId);

                    this.GenericDataSourceItemInfo.ServiceUrl = Constants.urls.jobServiceUrl + escape(jobId);
                    this.GenericDataSourceItemInfo.loadData({
                        onSuccess: renderListControl.bind(this)
                    });

                    this.ButtonDashboard.on("click",
                        function(event) {
                            this.closeDialog(null);
                        },
                        this);
                }
            };
        });

})(Sitecore.Speak);