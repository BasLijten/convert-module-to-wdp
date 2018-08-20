(function(Speak) {

    Speak.pageCode(["publishingUtils", "publishingConstants", "publishingShared"],
        function(Utils, Constants, Shared) {
            var id;

            return {
                initialized: function() {
                    if (this.TabControlPublish.Items.length === 1) {
                        $(".sc-tab-control-nav-wrap").hide();
                    }

                    id = Speak.utils.url.parameterByName(Constants.parameters.id);

                    if (id.length === 0) {
                        this.HeaderTitleSitePublish.IsVisible = true;
                        this.HeaderTitleItemPublish.IsVisible = false;
                    }

                    Shared.statusCheck.call(this);
                }
            };
        });

})(Sitecore.Speak);