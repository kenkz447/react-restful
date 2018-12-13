"use strict";
/**
 * Store is where data is stored from the API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const RecordTable_1 = require("./RecordTable");
class Store {
    constructor() {
        // tslint:disable-next-line:no-any
        this.subscribe = (resourceTypes, callback) => {
            const subscribeId = Symbol();
            this.subscribeStacks.push({
                resourceTypes: resourceTypes,
                callback: callback,
                subscribeId: subscribeId
            });
            return () => {
                this.unSubscribe(subscribeId);
            };
        };
        this.unSubscribe = (subscribeId) => {
            this.subscribeStacks = this.subscribeStacks.filter(o => o.subscribeId !== subscribeId);
        };
        this.resourceTypeHasRegistered = (resourceTypeName) => {
            const found = this.resourceTypes.find(o => o.props.name === resourceTypeName);
            return found !== undefined;
        };
        this.getRegisteredResourceType = (resourceTypeName) => {
            const resourceType = this.resourceTypes.find(o => o.props.name === resourceTypeName);
            if (!resourceType) {
                throw new Error(`Not found any resource type with name ${resourceTypeName}!`);
            }
            return resourceType;
        };
        this.getRecordTable = (resourceType) => {
            return this.recordTables[resourceType.props.name];
        };
        this.registerResourceType = (resourceType) => {
            if (this.recordTables[resourceType.props.name]) {
                return;
            }
            const newRecordTable = new RecordTable_1.RecordTable({
                resourceType: resourceType
            });
            this.recordTables[resourceType.props.name] = newRecordTable;
            this.resourceTypes.push(resourceType);
        };
        this.removeRecord = (resourceType, record) => {
            const table = this.recordTables[resourceType.props.name];
            table.remove(record);
            this.doSubcribleCallbacks({
                type: 'remove',
                resourceType: resourceType,
                value: record
            });
            return true;
        };
        this.findRecordByKey = (resourceType, key) => {
            const table = this.getRecordTable(resourceType);
            const resultByKey = table.findByKey(key);
            return resultByKey;
        };
        this.findOneRecord = (resourceType, specs) => {
            if (!specs) {
                return null;
            }
            const specsType = typeof specs;
            switch (specsType) {
                case 'string':
                case 'number':
                    return this.findRecordByKey(resourceType, specs);
                case 'object':
                    const recordKey = resourceType.getRecordKey(specs);
                    return this.findRecordByKey(resourceType, recordKey);
                default:
                    const table = this.getRecordTable(resourceType);
                    return table.records.find(specs) || null;
            }
        };
        this.findManyRecords = (resourceType, predicate) => {
            const table = this.getRecordTable(resourceType);
            if (!table) {
                return [];
            }
            return table.records.filter(predicate);
        };
        this.dataMapping = (resourceType, data) => {
            if (Array.isArray(data)) {
                return void this.mapRecords(resourceType, data);
            }
            this.mapRecord(resourceType, data);
        };
        this.resourceTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];
    }
    mapRecords(resourceType, records) {
        const table = this.recordTables[resourceType.props.name];
        for (const record of records) {
            const upsertResult = table.upsert(record);
            if (upsertResult !== true) {
                throw new Error(upsertResult);
            }
        }
        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            value: records
        });
    }
    mapRecord(resourceType, record) {
        const table = this.recordTables[resourceType.props.name];
        const upsertResult = table.upsert(record);
        if (upsertResult !== true) {
            throw new Error(upsertResult);
        }
        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            value: record
        });
        return true;
    }
    doSubcribleCallbacks(event) {
        for (const subscribeStack of this.subscribeStacks) {
            if (subscribeStack.resourceTypes.includes(event.resourceType)) {
                subscribeStack.callback(event);
            }
        }
    }
}
exports.Store = Store;
