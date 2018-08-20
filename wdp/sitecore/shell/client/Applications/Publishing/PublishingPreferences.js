define(["publishingPreferences"],
    function (Preferences) {
        return {
            SetCookie: function (subItems, relatedItems, languages, targets) {
                var now = new Date();
                now.setYear(now.getFullYear() + 1);

                var languageList = languages.map(function (elem) {
                    return elem.Code;
                }).join(",");

                var targetList = targets.map(function (elem) {
                    return elem.Id;
                }).join(",");

                var cookie = ["publishingpreferences", '=', 'subitems:' + subItems + '|related:' + relatedItems + '|lang:' + languageList + '|targets:' + targetList + '', '; path=/; expires=' + now.toUTCString() + ' ;'].join('');
                document.cookie = cookie;
            },

            LoadCookie: function () {
                var result = document.cookie.match(new RegExp("publishingpreferences" + '=([^;]+)'));

                if (result) {
                    var preferences = result[1].split("|");

                    var obj = new Object();

                    preferences.forEach(
                        function (entry) {
                            var keyValue = entry.split(':');
                            obj[keyValue[0]] = keyValue[1];
                        }
                    );

                    return obj;
                }
            },
        }
    }
);