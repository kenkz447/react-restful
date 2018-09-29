"use strict";
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
    registerRecordType(resourceType) {
        if (this.recordTables[resourceType.name]) {
            return;
        }
        const primaryKey = resourceType.primaryKey;
        if (!primaryKey) {
            throw new Error(`${resourceType.name} has no PK field!`);
        }
        const newRecordTable = new RecordTable_1.RecordTable(primaryKey);
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
    /**
     * Map a fetched data of type to store
     * * For FK, we only update primitive fields of FK record
     */
    dataMapping(resourceType, record) {
        const recordToMapping = Object.assign({}, record);
        const recordKey = resourceType.getRecordKey(record);
        for (const schemaField of resourceType.schema) {
            const resourceTypeName = schemaField.resourceType;
            switch (schemaField.type) {
                case 'FK':
                    let fkValue = recordToMapping[schemaField.field];
                    const fkIsObject = (typeof fkValue === 'object');
                    if (!fkIsObject) {
                        continue;
                    }
                    const fkResourceType = this.getRegisteredResourceType(resourceTypeName);
                    // We need update MANY field FKResource
                    const fkValueKey = fkResourceType.getRecordKey(fkValue);
                    const tryGetFKObjectFormStore = this.findRecordByKey(fkResourceType, fkValueKey);
                    if (tryGetFKObjectFormStore) {
                        fkValue = tryGetFKObjectFormStore;
                    }
                    const fkChildSchemaField = fkResourceType.getChildTypeSchemafield(resourceType);
                    if (fkValue[fkChildSchemaField.field]) {
                        if (!fkValue[fkChildSchemaField.field].includes(recordKey)) {
                            fkValue[fkChildSchemaField.field].push(recordKey);
                        }
                    }
                    else {
                        fkValue[fkChildSchemaField.field] = [recordKey];
                    }
                    this.dataMapping(fkResourceType, fkValue);
                    // Replace the original object with their id
                    recordToMapping[schemaField.field] = fkResourceType.getRecordKey(fkValue);
                    break;
                case 'MANY':
                    const childValue = recordToMapping[schemaField.field];
                    if (!childValue) {
                        continue;
                    }
                    if (!Array.isArray(childValue)) {
                        throw new Error('MANY related but received something is not an array!');
                    }
                    const childValueIsArrayObject = (typeof childValue[0] === 'object');
                    if (!childValueIsArrayObject) {
                        continue;
                    }
                    // TODO: We need update FK field of childResource to map with parent record
                    const childResourceType = this.getRegisteredResourceType(resourceTypeName);
                    for (const relatedRecord of childValue) {
                        this.dataMapping(childResourceType, relatedRecord);
                    }
                    // Replace the original object array with their ID array
                    recordToMapping[schemaField.field] = childValue.map((o) => childResourceType.getRecordKey(o));
                    break;
                default:
                    break;
            }
        }
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
