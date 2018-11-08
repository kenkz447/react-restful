"use strict";
/**
 * Store is where data is stored from the API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const RecordTable_1 = require("./RecordTable");
class Store {
    constructor() {
        this.resourceTypes = [];
        this.recordTables = {};
        this.subscribeStacks = [];
        this.subscribe = this.subscribe.bind(this);
        this.getRecordTable = this.getRecordTable.bind(this);
    }
    subscribe(resourceTypes, callback) {
        const subscribeId = Symbol();
        this.subscribeStacks.push({
            resourceTypes: resourceTypes,
            callback: callback,
            subscribeId: subscribeId
        });
        return () => {
            this.unSubscribe(subscribeId);
        };
    }
    unSubscribe(subscribeId) {
        this.subscribeStacks = this.subscribeStacks.filter(o => o.subscribeId !== subscribeId);
    }
    resourceTypeHasRegistered(resourceTypeName) {
        const found = this.resourceTypes.find(o => o.name === resourceTypeName);
        return found !== undefined;
    }
    getRegisteredResourceType(resourceTypeName) {
        const resourceType = this.resourceTypes.find(o => o.name === resourceTypeName);
        if (!resourceType) {
            throw new Error(`Not found any resource type with name ${resourceTypeName}!`);
        }
        return resourceType;
    }
    getRecordTable(resourceType) {
        return this.recordTables[resourceType.name];
    }
    registerRecord(resourceType) {
        if (this.recordTables[resourceType.name]) {
            return;
        }
        const newRecordTable = new RecordTable_1.RecordTable({
            resourceType: resourceType
        });
        this.recordTables[resourceType.name] = newRecordTable;
        this.resourceTypes.push(resourceType);
    }
    mapRecord(resourceType, record) {
        const table = this.recordTables[resourceType.name];
        const upsertResult = table.upsert(record);
        if (!upsertResult) {
            throw new Error('upsert not working!');
        }
        this.doSubcribleCallbacks({
            type: 'mapping',
            resourceType: resourceType,
            record: record
        });
        return true;
    }
    removeRecord(resourceType, record) {
        const table = this.recordTables[resourceType.name];
        table.remove(record);
        this.doSubcribleCallbacks({
            type: 'remove',
            resourceType: resourceType,
            record: record
        });
        return true;
    }
    findRecordByKey(resourceType, key) {
        const table = this.getRecordTable(resourceType);
        const resultByKey = table.findByKey(key);
        return resultByKey;
    }
    findOneRecord(resourceType, specs) {
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
    }
    dataMapping(resourceType, record) {
        const recordToMapping = Object.assign({}, record);
        this.mapRecord(resourceType, recordToMapping);
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
