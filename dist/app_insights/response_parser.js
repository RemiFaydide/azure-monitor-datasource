///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['moment', 'lodash'], function(exports_1) {
    var moment_1, lodash_1;
    var ResponseParser;
    return {
        setters:[
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            ResponseParser = (function () {
                function ResponseParser() {
                }
                ResponseParser.parseQueryResult = function (result) {
                    var data = [];
                    for (var i = 0; i < result.data.length; i++) {
                        var value = result.data[i].data.value;
                        data = lodash_1.default.concat(data, ResponseParser.parseQueryResultRow(value));
                    }
                    return data;
                };
                ResponseParser.parseQueryResultRow = function (value) {
                    var data = [];
                    if (ResponseParser.isSingleValue(value)) {
                        var metricName = ResponseParser.getMetricFieldKey(value);
                        var aggField = ResponseParser.getKeyForAggregationField(value[metricName]);
                        var epoch = ResponseParser.dateTimeToEpoch(value.end);
                        data.push({ target: metricName, datapoints: [[value[metricName][aggField], epoch]] });
                        return data;
                    }
                    var groupedBy = ResponseParser.hasSegmentsField(value.segments[0]);
                    if (!groupedBy) {
                        var metricName = ResponseParser.getMetricFieldKey(value.segments[0]);
                        var dataTarget = ResponseParser.findOrCreateBucket(data, metricName);
                        for (var i = 0; i < value.segments.length; i++) {
                            var epoch = ResponseParser.dateTimeToEpoch(value.segments[i].end);
                            var aggField = ResponseParser.getKeyForAggregationField(value.segments[i][metricName]);
                            dataTarget.datapoints.push([value.segments[i][metricName][aggField], epoch]);
                        }
                    }
                    else {
                        for (var i = 0; i < value.segments.length; i++) {
                            var epoch = ResponseParser.dateTimeToEpoch(value.segments[i].end);
                            for (var j = 0; j < value.segments[i].segments.length; j++) {
                                var target = ResponseParser.getTargetName(value.segments[i].segments[j]);
                                var metricName = ResponseParser.getMetricFieldKey(value.segments[i].segments[j]);
                                var aggField = ResponseParser.getKeyForAggregationField(value.segments[i].segments[j][metricName]);
                                var bucket = ResponseParser.findOrCreateBucket(data, target);
                                bucket.datapoints.push([value.segments[i].segments[j][metricName][aggField], epoch]);
                            }
                        }
                    }
                    return data;
                };
                ResponseParser.isSingleValue = function (value) {
                    return !ResponseParser.hasSegmentsField(value);
                };
                ResponseParser.findOrCreateBucket = function (data, target) {
                    var dataTarget = lodash_1.default.find(data, ['target', target]);
                    if (!dataTarget) {
                        dataTarget = { target: target, datapoints: [] };
                        data.push(dataTarget);
                    }
                    return dataTarget;
                };
                ResponseParser.getTargetName = function (segment) {
                    var metric = '';
                    var groupBy = '';
                    for (var prop in segment) {
                        if (lodash_1.default.isObject(segment[prop])) {
                            metric = prop;
                        }
                        else {
                            groupBy = "{" + prop + "=\"" + segment[prop] + "\"}";
                        }
                    }
                    return metric + groupBy;
                };
                ResponseParser.hasSegmentsField = function (obj) {
                    var keys = lodash_1.default.keys(obj);
                    return lodash_1.default.indexOf(keys, 'segments') > -1;
                };
                ResponseParser.getMetricFieldKey = function (segment) {
                    var keys = lodash_1.default.keys(segment);
                    return lodash_1.default.filter(lodash_1.default.without(keys, 'start', 'end'), function (key) {
                        return lodash_1.default.isObject(segment[key]);
                    })[0];
                };
                ResponseParser.getKeyForAggregationField = function (dataObj) {
                    var keys = lodash_1.default.keys(dataObj);
                    return lodash_1.default.intersection(keys, ['sum', 'avg', 'min', 'max', 'count']);
                };
                ResponseParser.dateTimeToEpoch = function (dateTime) {
                    return moment_1.default(dateTime).valueOf();
                };
                ResponseParser.parseMetricNames = function (result) {
                    var keys = lodash_1.default.keys(result.data.metrics);
                    var list = [];
                    for (var i = 0; i < keys.length; i++) {
                        list.push({
                            text: keys[i],
                            value: keys[i]
                        });
                    }
                    return list;
                };
                ResponseParser.parseMetadata = function (result, metricName) {
                    var metric = result.data.metrics[metricName];
                    return {
                        primaryAggType: metric.defaultAggregation,
                        supportedAggTypes: metric.supportedAggregations,
                        supportedGroupBy: metric.supportedGroupBy.all
                    };
                };
                return ResponseParser;
            })();
            exports_1("default", ResponseParser);
        }
    }
});
//# sourceMappingURL=response_parser.js.map