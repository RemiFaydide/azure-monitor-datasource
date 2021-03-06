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
                        for (var j = 0; j < result.data[i].data.value.length; j++) {
                            for (var k = 0; k < result.data[i].data.value[j].timeseries.length; k++) {
                                data.push({
                                    target: ResponseParser.createTarget(result.data[i].data.value[j], result.data[i].data.value[j].timeseries[k].metadatavalues),
                                    datapoints: ResponseParser.convertDataToPoints(result.data[i].data.value[j].timeseries[k].data)
                                });
                            }
                        }
                    }
                    return data;
                };
                ResponseParser.createTarget = function (data, metadatavalues) {
                    var endIndex = data.id.lastIndexOf('/providers');
                    var startIndex = data.id.slice(0, endIndex).lastIndexOf('/') + 1;
                    var resourceName = data.id.substring(startIndex, endIndex);
                    if (metadatavalues && metadatavalues.length > 0) {
                        return resourceName + "{" + metadatavalues[0].name.value + "=" + metadatavalues[0].value + "}." + data.name.value;
                    }
                    return resourceName + "." + data.name.value;
                };
                ResponseParser.convertDataToPoints = function (timeSeriesData) {
                    var dataPoints = [];
                    for (var k = 0; k < timeSeriesData.length; k++) {
                        var epoch = ResponseParser.dateTimeToEpoch(timeSeriesData[k].timeStamp);
                        var aggKey = ResponseParser.getKeyForAggregationField(timeSeriesData[k]);
                        if (aggKey) {
                            dataPoints.push([timeSeriesData[k][aggKey], epoch]);
                        }
                    }
                    return dataPoints;
                };
                ResponseParser.dateTimeToEpoch = function (dateTime) {
                    return moment_1.default(dateTime).valueOf();
                };
                ResponseParser.getKeyForAggregationField = function (dataObj) {
                    var keys = lodash_1.default.keys(dataObj);
                    if (keys.length < 2) {
                        return;
                    }
                    return lodash_1.default.intersection(keys, ['total', 'average', 'maximum', 'minimum', 'count']);
                };
                ResponseParser.parseResponseValues = function (result, textFieldName, valueFieldName) {
                    var list = [];
                    for (var i = 0; i < result.data.value.length; i++) {
                        if (!lodash_1.default.find(list, ['value', lodash_1.default.get(result.data.value[i], valueFieldName)])) {
                            list.push({
                                text: lodash_1.default.get(result.data.value[i], textFieldName),
                                value: lodash_1.default.get(result.data.value[i], valueFieldName)
                            });
                        }
                    }
                    return list;
                };
                ResponseParser.parseResourceNames = function (result, metricDefinition) {
                    var list = [];
                    for (var i = 0; i < result.data.value.length; i++) {
                        if (result.data.value[i].type === metricDefinition) {
                            list.push({
                                text: result.data.value[i].name,
                                value: result.data.value[i].name
                            });
                        }
                    }
                    return list;
                };
                ResponseParser.parseMetadata = function (result, metricName) {
                    var metricData = lodash_1.default.find(result.data.value, function (o) {
                        return lodash_1.default.get(o, 'name.value') === metricName;
                    });
                    var defaultAggTypes = ['None', 'Average', 'Minimum', 'Maximum', 'Total', 'Count'];
                    return {
                        primaryAggType: metricData.primaryAggregationType,
                        supportedAggTypes: metricData.supportedAggregationTypes || defaultAggTypes,
                        dimensions: ResponseParser.parseDimensions(metricData)
                    };
                };
                ResponseParser.parseDimensions = function (metricData) {
                    var dimensions = [];
                    if (!metricData.dimensions || metricData.dimensions.length === 0) {
                        return dimensions;
                    }
                    if (!metricData.isDimensionRequired) {
                        dimensions.push({ text: 'None', value: 'None' });
                    }
                    for (var i = 0; i < metricData.dimensions.length; i++) {
                        dimensions.push({
                            text: metricData.dimensions[i].localizedValue,
                            value: metricData.dimensions[i].value
                        });
                    }
                    return dimensions;
                };
                return ResponseParser;
            })();
            exports_1("default", ResponseParser);
        }
    }
});
//# sourceMappingURL=response_parser.js.map