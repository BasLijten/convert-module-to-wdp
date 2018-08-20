define(["publishingConstants"],
    function(Constants) {
        var getTranslationsObject = function(items) {

            items.forEach(function(item) {
                if (translations[item.DataFieldName.replace("Parsed", "")] == undefined) {
                    translations[item.DataFieldName.replace("Parsed", "")] =
                        item.ColumnTitle + Constants.seperators.explaination;
                }
            });
        };

        translations = {};

        return {
            parseData: function(data, options) {
                var dateformatter = Sitecore.Speak.globalize.dateFormatter({ datetime: Constants.dateTimeFormat }),
                    options = options || {};


                data.forEach(function(obj) {
                    if (obj.Targets) {
                        obj.ParsedTargets = obj.Targets.map(function(a) { return a.Name; })
                            .join(Constants.seperators.parsed);
                    }

                    if (obj.Languages) {
                        obj.ParsedLanguages = obj.Languages.map(function(a) { return a.DisplayName; })
                            .join(Constants.seperators.parsed);
                    }

                    if (obj.TimeRequested) {
                        obj.ParsedTimeRequested = dateformatter(Sitecore.Speak.utils.date.parseISO(obj.TimeRequested));
                    }

                    if (obj.TimeStarted) {
                        obj.ParsedTimeStarted = dateformatter(Sitecore.Speak.utils.date.parseISO(obj.TimeStarted));
                    }

                    if (obj.TimeStopped) {
                        obj.ParsedTimeStopped = dateformatter(Sitecore.Speak.utils.date.parseISO(obj.TimeStopped));
                    }

                    if (options.appendTranslations) {

                        if (translations.No && translations.Yes) {
                            if (obj.IncludeDescendantItems !== undefined) {
                                translations.IncludeDescendantItems =
                                    (obj.IncludeDescendantItems ? translations.Yes : translations.No).replace(Constants
                                        .seperators.explaination,
                                        "");
                            }

                            if (obj.IncludeRelatedItems !== undefined) {
                                translations.IncludeRelatedItems =
                                    (obj.IncludeRelatedItems ? translations.Yes : translations.No).replace(Constants
                                        .seperators.explaination,
                                        "");
                            }
                        }

                        obj.Translations = translations;
                    }
                });
            },

            setTranslations: function(items) {
                getTranslationsObject(items);
            },

            findItem: function(array, itemId) {
                return _.findWhere(array, { $itemId: itemId });
            }
        };
    });