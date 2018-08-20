(function(Speak) {
    require.config({
        paths: {
            entityService: "/sitecore/shell/client/Services/Assets/lib/entityservice"
        }
    });

    Speak.pageCode(["entityService", "publishingConstants", "publishingUtils", "publishingShared"],
        function(entityService, Constants, Utils, Shared) {

            var millisecondsToTimespan = function(duration) {
                var seconds = parseInt((duration / 1000) % 60),
                    minutes = parseInt((duration / (1000 * 60)) % 60),
                    hours = parseInt((duration / (1000 * 60 * 60)) % 24),
                    days = parseInt(duration / (1000 * 60 * 60 * 24));

                var hoursDays = parseInt(days * 24);
                hours += hoursDays;
                hours = (hours < 10) ? "0" + hours : hours;
                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;
                return hours + ":" + minutes + ":" + seconds;
            };

            var calculateJobDuration = function(startTime, endTime) {
                var miliseconds = ((Sitecore.Speak.utils.date.parseISO(endTime) -
                    Sitecore.Speak.utils.date.parseISO(startTime)));

                return millisecondsToTimespan(miliseconds);
            };

            // Toggles the details page and success page
            var toggleBorders = function(showDetails) {
                this.BorderMain.IsVisible = !!showDetails;
                this.BorderSuccess.IsVisible = !!!showDetails;

                this.RePublishButton.IsVisible = !!!showDetails;
            };

            var renderListControl = function(data) {
                var options = {
                    appendTranslations: true
                };

                Utils.setTranslations(this.ListControlNewJobDetails.ColumnDefinitionItems);
                Utils.parseData([data], options);
                this.ListControlNewJobDetails.reset([data]);

                toggleBorders.call(this, false);
                this.RePublishButton.IsVisible = false;
            };

            return {
                initialized: function() {
                    Utils.setTranslations(this.ListControlJobDetails.ColumnDefinitionItems);
                    Utils.setTranslations(this.ListControlJobTargetStatus.ColumnDefinitionItems);
                    Shared.registerHandlebarList();
                    toggleBorders.call(this, true);

                    this.on("republish",
                        function() {

                            var selectedJob = this.ListControlJobDetails.DynamicData[0];

                            this.republishJob(selectedJob.Id);
                        });
                },

                showJob: function(jobId) {
                    toggleBorders.call(this, true);

                    var jobService = new entityService({
                        url: Constants.urls.jobServiceUrl
                    });

                    var component = this;

                    jobService.fetchEntity(jobId)
                        .execute()
                        .then(function(job) {
                            var publishJobs = {
                                jobs: []
                            };

                            if (job.TimeStarted != null && job.TimeStopped != null) {
                                job.Duration = calculateJobDuration(job.TimeStarted, job.TimeStopped);
                            }

                            publishJobs.jobs.push(job);

                            Utils.parseData(publishJobs.jobs, { appendTranslations: true });

                            component.ListControlJobDetails.DynamicData = publishJobs.jobs;
                            component.ExpanderJobDetails.HeaderText = job.TypeDisplayName + " - " + job.Status;

                            component.canRepublishJob(jobId);
                            component.showJobTargets();
                        });
                },

                showJobTargets: function() {
                    var component = this;

                    var job = component.ListControlJobDetails.DynamicData[0];

                    component.ListControlJobTargetStatus.DynamicData = job.Targets.underlying;
                },

                republishJob: function(jobId) {

                    var dialog = this;

                    $.ajax({
                            url: Constants.urls.jobServiceUrl + Constants.urls.republish,
                            method: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify(jobId)
                        })
                        .done(function(data) {
                            dialog.GenericDataSourceItemInfo.ServiceUrl = Constants.urls.jobServiceUrl + data.Id;
                            dialog.GenericDataSourceItemInfo.loadData({
                                onSuccess: renderListControl.bind(dialog)
                            });
                        })
                        .fail(function(jqXHR) {
                            if (jqXHR.status === 401) {
                                window.top.location.href = "/sitecore/login";
                            } else {
                                var message = Utils.findItem(dialog.SearchDataSourceMessages.Items,
                                    Constants.itemIds.publishError);
                                dialog.MessageBar.add(message);
                            }
                        });
                },

                canRepublishJob: function(jobId) {

                    var dialog = this;

                    $.ajax({
                            url: Constants.urls.jobServiceUrl + jobId + Constants.urls.canRepublish,
                            method: "GET",
                            contentType: "application/json",
                            dataType: "json"
                        })
                        .done(function(data) {
                            dialog.RePublishButton.IsEnabled = data;
                            dialog.RePublishButton.IsVisible = data;
                        })
                        .fail(function(jqXHR) {
                            if (jqXHR.status === 401) {
                                window.top.location.href = "/sitecore/login";
                            }
                        });
                }
            };
        },
        "SubAppRendererJobDetails");
})(Sitecore.Speak);