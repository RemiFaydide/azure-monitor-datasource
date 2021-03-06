/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export default class ResponseParser {
    static parseQueryResult(result: any): any[];
    static parseQueryResultRow(value: any): any[];
    static isSingleValue(value: any): boolean;
    static findOrCreateBucket(data: any, target: any): any;
    static getTargetName(segment: any): string;
    static hasSegmentsField(obj: any): boolean;
    static getMetricFieldKey(segment: any): any;
    static getKeyForAggregationField(dataObj: any): any;
    static dateTimeToEpoch(dateTime: any): any;
    static parseMetricNames(result: any): any[];
    static parseMetadata(result: any, metricName: string): {
        primaryAggType: any;
        supportedAggTypes: any;
        supportedGroupBy: any;
    };
}
