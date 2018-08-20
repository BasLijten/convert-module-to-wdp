define(["publishingConstants", "publishingUtils", "handlebars", "publishingPreferences"],
    function (Constants, Utils, handlebars, Preferences) {
        // Depending on the length of the given values it adds or removes a error message from the MessageBar

        var enforceChecking = function (values, messageId) {

            var messageBar = this.MessageBar;

            if (messageBar == null) {
                messageBar = this.parent.MessageBar;
            }

            if (values.length === 0) {
                var message = Utils.findItem(this.SearchDataSourceMessages.Items, messageId);

                messageBar.add(message);
            } else {
                var messageToRemove = messageBar.findWhere({ $itemId: messageId });

                if (messageToRemove) {
                    messageBar.remove(messageToRemove);
                }
            }

            publishButtons = [];
            publishButtons.push(this.ButtonFullRePublish || this.parent.ButtonFullRePublish);
            publishButtons.push(this.ButtonPublish || this.parent.ButtonPublish);

            toggleButtonPublish.call(this.parent, messageBar, publishButtons);
        };

        // Toggles the ButtonPublish state depending on whether MessageBar has error messages
        var toggleButtonPublish = function (messageBar, publishButtons) {

            if (publishButtons === undefined) {
                publishButtons = [ this.ButtonPublish, this.ButtonFullRePublish ];
            }

            if (messageBar === undefined) {
                messageBar = this.MessageBar;
            }

            var errorsDisplayed = messageBar.HasErrorMessages;

            publishButtons.forEach(function(button) {
                if (button != undefined) {
                    button.IsEnabled = !errorsDisplayed;
                }
            });
        };

        // Sets up eventlistener for changes on MessageBar and adds messages if needed
        var handleServiceMessages = function (data) {
            var messages = data.Messages,
                hasMessages = messages.length !== 0,
                messageBar = this.MessageBar;

            messageBar.on("itemsChanged", toggleButtonPublish.bind(this));

            if (hasMessages) {
                messages.forEach(function (message) {
                    messageBar.add(message);
                });
            } else {
                toggleButtonPublish.call(this);
            }
        };

        // Refreshes the data at given interval
        var startTimer = function (values, callback) {
            callback.call(this, values);

            setTimeout(function () {
                this.GenericDataSource.QueryParameters = "sourceDatabase=" +
                    Sitecore.Speak.Context.current().contentDatabase;
                this.GenericDataSource.loadData({
                    onSuccess: function (data) {
                        startTimer.call(this, data, callback);
                    }.bind(this)
                });
            }.bind(this),
                Constants.updateInterval);
        };

        return {
            // Checks first checkbox in Languages and Targets
            setDefaultCheckboxes: function () {
                var cookiePreferences = Preferences.LoadCookie();

                if (cookiePreferences != null) {

                    if (this.CheckBoxListOptions != undefined) {
                        var options = [];

                        if (cookiePreferences.subitems == "true") {
                            options.push(Constants.itemIds.publishSubItems);
                        }

                        if (cookiePreferences.related == "true") {
                            options.push(Constants.itemIds.publishRelatedItems);
                        }

                        this.CheckBoxListOptions.setCheckedValues(options);
                    }

                    var languages = [];

                    cookiePreferences.lang.split(',')
                        .filter(function (item) {
                            return (item !== (undefined || null || ''));
                        })
                        .forEach(
                            function (entry) {
                                languages.push(entry);
                            });

                    if (languages.length === 0) {
                        this.GenericDataSourceLanguages.loadData({
                            onSuccess: function() {
                                this.CheckBoxListLanguages.checkAll();
                            }.bind(this)
                        });
                    } else {
                        this.GenericDataSourceLanguages.loadData({
                            onSuccess: function () {
                                this.CheckBoxListLanguages.setCheckedValues(languages);
                            }.bind(this)
                        });
                    }

                    var targets = [];

                    cookiePreferences.targets.split(',')
                        .filter(function (item) {
                                return (item !== (undefined || null || ''));
                            })
                        .forEach(
                            function (entry) {
                                targets.push(entry);
                            });

                    if (targets.length === 0) {
                        this.GenericDataSourceTargets.loadData({
                            onSuccess: function () {
                                this.CheckBoxListTargets.checkAll();
                            }.bind(this)
                        });
                    } else {
                        this.GenericDataSourceTargets.loadData({
                            onSuccess: function () {
                                this.CheckBoxListTargets.setCheckedValues(targets);
                            }.bind(this)
                        });
                    }
                } else {

                    this.GenericDataSourceLanguages.loadData({
                        onSuccess: function () {
                            this.CheckBoxListLanguages.checkAll();
                        }.bind(this)
                    });

                    this.GenericDataSourceTargets.loadData({
                        onSuccess: function () {
                            this.CheckBoxListTargets.checkAll();
                        }.bind(this)
                    });
                }

                this.CheckBoxListLanguages.on("change:CheckedValues",
                        function (values) {
                            enforceChecking.call(this, values, Constants.itemIds.forceCheckingLanguages);
                        },
                        this);

                this.CheckBoxListTargets.on("change:CheckedValues",
                    function (values) {
                        enforceChecking.call(this, values, Constants.itemIds.forceCheckingTargets);
                    },
                    this);
            },

            // Performs service status check
            statusCheck: function () {
                this.GenericDataSourceServiceStatus.loadData({
                    onSuccess: handleServiceMessages.bind(this)
                });
            },

            // Performs service status check
            maintenanceCheck: function () {
                var messageBar = this.MessageBar;

                $.ajax({
                    url: Constants.urls.maintenanceServiceUrl + Constants.urls.maintenanceTaskRunning,
                    method: "GET",
                    contentType: "application/json",
                    dataType: "json"
                })
                    .done(function (data) {
                        if (data.IsMaintenanceTaskRunning) {
                            var messages = data.Messages,
                                hasMessages = messages.length !== 0;

                            messageBar.on("itemsChanged", toggleButtonPublish.bind(this));

                            if (hasMessages) {
                                messageBar.IsVisible = true;

                                messages.forEach(function (message) {
                                    messageBar.add(message);
                                });
                            } else {
                                toggleButtonPublish.call(this);
                            }
                        }
                    })
                    .fail(function (jqXHR) {
                        if (jqXHR.status === 401) {
                            window.top.location.href = "/sitecore/login";
                        }
                    });
            },

            // Loads initial data and starts a timer
            loadOverviewData: function (callback) {
                this.GenericDataSource.QueryParameters = "sourceDatabase=" +
                    Sitecore.Speak.Context.current().contentDatabase;
                this.GenericDataSource.loadData({
                    onSuccess: function (data) {
                        startTimer.call(this, data, callback);
                    }.bind(this)
                });
            },

            // Shows messages in the MessageBar on the Overview pages
            toggleOverviewMessageBar: function (data) {
                var messagebar = this.MessageBar,
                    messages = data.Messages,
                    hasMessages = messages.length > 0;

                messagebar.IsVisible = hasMessages;
                messagebar.reset(messages);
            },

            jobSelected: function (job) {
                this.SubAppRendererJobDetails.DialogWindow.show();
                this.SubAppRendererJobDetails.showJob(job.Id);
            },

            registerHandlebarList: function () {
                handlebars.registerHelper('list',
                    function (context, options) {

                        if (context.underlying) {
                            context = context.underlying;
                        }

                        var ret = "<ul>";

                        for (var i = 0, j = context.length; i < j; i++) {
                            ret = ret + "<li>" + options.fn(context[i]) + "</li>";
                        }

                        return ret + "</ul>";
                    });
            }
        }
    });