///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', './azure_monitor_filter_builder', './url_builder', './response_parser'], function(exports_1) {
    var lodash_1, azure_monitor_filter_builder_1, url_builder_1, response_parser_1;
    var AzureMonitorQueryBuilder;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (azure_monitor_filter_builder_1_1) {
                azure_monitor_filter_builder_1 = azure_monitor_filter_builder_1_1;
            },
            function (url_builder_1_1) {
                url_builder_1 = url_builder_1_1;
            },
            function (response_parser_1_1) {
                response_parser_1 = response_parser_1_1;
            }],
        execute: function() {
            AzureMonitorQueryBuilder = (function () {
                function AzureMonitorQueryBuilder(instanceSettings, backendSrv, templateSrv, $q) {
                    this.instanceSettings = instanceSettings;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$q = $q;
                    this.defaultDropdownValue = 'select';
                    this.id = instanceSettings.id;
                    this.subscriptionId = instanceSettings.jsonData.subscriptionId;
                    this.baseUrl = "/azuremonitor/subscriptions/" + this.subscriptionId + "/resourceGroups";
                    this.url = instanceSettings.url;
                }
                AzureMonitorQueryBuilder.prototype.isConfigured = function () {
                    return this.subscriptionId && this.subscriptionId.length > 0;
                };
                AzureMonitorQueryBuilder.prototype.query = function (options) {
                    var _this = this;
                    var queries = lodash_1.default.filter(options.targets, function (item) {
                        return item.hide !== true
                            && item.azureMonitor.resourceGroup && item.azureMonitor.resourceGroup !== _this.defaultDropdownValue
                            && item.azureMonitor.resourceName && item.azureMonitor.resourceName !== _this.defaultDropdownValue
                            && item.azureMonitor.metricDefinition && item.azureMonitor.metricDefinition !== _this.defaultDropdownValue
                            && item.azureMonitor.metricName && item.azureMonitor.metricName !== _this.defaultDropdownValue;
                    }).map(function (target) {
                        var item = target.azureMonitor;
                        var resourceGroup = _this.templateSrv.replace(item.resourceGroup, options.scopedVars);
                        var resourceName = _this.templateSrv.replace(item.resourceName, options.scopedVars);
                        var metricDefinition = _this.templateSrv.replace(item.metricDefinition, options.scopedVars);
                        var metricName = _this.templateSrv.replace(item.metricName, options.scopedVars);
                        var apiVersion = '2016-09-01';
                        var filterBuilder = new azure_monitor_filter_builder_1.default(item.metricName, options.range.from, options.range.to, item.timeGrain, item.timeGrainUnit);
                        var filter = _this.templateSrv.replace(filterBuilder.generateFilter(), options.scopedVars);
                        var url = url_builder_1.default.buildAzureMonitorQueryUrl(_this.baseUrl, resourceGroup, metricDefinition, resourceName, apiVersion, filter);
                        return {
                            refId: item.refId,
                            intervalMs: options.intervalMs,
                            maxDataPoints: options.maxDataPoints,
                            datasourceId: _this.id,
                            url: url,
                            format: options.format,
                        };
                    });
                    if (queries.length === 0) {
                        return this.$q.when({ data: [] });
                    }
                    var promises = this.doQueries(queries);
                    return this.$q.all(promises).then(function (results) {
                        return { data: lodash_1.default.flatten(results) };
                    }).then(response_parser_1.default.parseQueryResult);
                };
                AzureMonitorQueryBuilder.prototype.doQueries = function (queries) {
                    var _this = this;
                    return lodash_1.default.map(queries, function (query) {
                        return _this.doRequest(query.url);
                    });
                };
                AzureMonitorQueryBuilder.prototype.annotationQuery = function (options) {
                };
                AzureMonitorQueryBuilder.prototype.metricFindQuery = function (query) {
                    var url = "" + this.baseUrl + query;
                    return this.doRequest(url).then(function (result) {
                        return response_parser_1.default.parseResponseValues(result, 'name', 'name');
                    });
                };
                AzureMonitorQueryBuilder.prototype.getMetricDefinitions = function (resourceGroup) {
                    var url = this.baseUrl + "/" + resourceGroup + "/resources?api-version=2017-06-01";
                    return this.doRequest(url).then(function (result) {
                        return response_parser_1.default.parseResponseValues(result, 'type', 'type');
                    });
                };
                AzureMonitorQueryBuilder.prototype.getResourceNames = function (resourceGroup, metricDefinition) {
                    var url = this.baseUrl + "/" + resourceGroup + "/resources?api-version=2017-06-01";
                    var list = [];
                    return this.doRequest(url).then(function (result) {
                        for (var i = 0; i < result.data.value.length; i++) {
                            if (result.data.value[i].type === metricDefinition) {
                                list.push({
                                    text: result.data.value[i].name,
                                    value: result.data.value[i].name
                                });
                            }
                        }
                        return list;
                    });
                };
                AzureMonitorQueryBuilder.prototype.getMetricNames = function (resourceGroup, metricDefinition, resourceName) {
                    var url = url_builder_1.default.buildAzureMonitorGetMetricNamesUrl(this.baseUrl, resourceGroup, metricDefinition, resourceName);
                    return this.doRequest(url).then(function (result) {
                        return response_parser_1.default.parseResponseValues(result, 'name.localizedValue', 'name.value');
                    });
                };
                AzureMonitorQueryBuilder.prototype.testDatasource = function () {
                    var url = this.baseUrl + "?api-version=2017-06-01";
                    return this.doRequest(url).then(function (response) {
                        if (response.status === 200) {
                            return {
                                status: 'success',
                                message: 'Successfully queried the Azure Monitor service.',
                                title: 'Success'
                            };
                        }
                    })
                        .catch(function (error) {
                        var message = 'Azure Monitor: ';
                        message += error.statusText ? error.statusText + ': ' : '';
                        if (error.data && error.data.error && error.data.error.code) {
                            message += error.data.error.code + '. ' + error.data.error.message;
                        }
                        else if (error.data && error.data.error) {
                            message += error.data.error;
                        }
                        else if (error.data) {
                            message += error.data;
                        }
                        else {
                            message += 'Cannot connect to Azure Monitor REST API.';
                        }
                        return {
                            status: 'error',
                            message: message
                        };
                    });
                };
                AzureMonitorQueryBuilder.prototype.doRequest = function (url) {
                    return this.backendSrv.datasourceRequest({
                        url: this.url + url,
                        method: 'GET'
                    });
                };
                return AzureMonitorQueryBuilder;
            })();
            exports_1("default", AzureMonitorQueryBuilder);
        }
    }
});
//# sourceMappingURL=azure_monitor_query_builder.js.map