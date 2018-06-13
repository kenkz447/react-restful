import { RecordTable } from './RecordTable';

export interface State {
    [key: string]: RecordTable;
}

type subscribeCallback = (state: State) => void;

export class Store {
    recordKeyProperty: string = 'id';
    store: State = {};

    subscribe(callback: subscribeCallback) {
        callback(this.store);
    }

    registerRecordType(recordType: string) {
        if (this.store[recordType]) {
            throw new Error('Record type exist!');
        }

        this.store[recordType] = new RecordTable(this.recordKeyProperty);
    }

    mapRecord(recordType: string, record: {}) {
        const table = this.store[recordType];
        table.upsert(record);
    }
}