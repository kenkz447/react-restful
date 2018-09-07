"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
class RestfulEntry extends React.Component {
    constructor(props) {
        super(props);
        const { store, recordKey, resourceType } = this.props;
        store.subscribe([resourceType], (e) => {
            if (resourceType.getRecordKey(e.record) === recordKey) {
                switch (e.type) {
                    case 'mapping':
                        if (this.props.autoSyncWithStore) {
                            this.setState({ record: e.record });
                        }
                        else {
                            this.setState({ status: 'outdate' });
                        }
                        break;
                    case 'remove':
                        this.setState({ status: 'deleted' });
                        break;
                    default:
                        break;
                }
            }
        });
        this.state = {
            recordKey: recordKey,
            record: store.findRecordByKey(resourceType, recordKey),
            status: 'synced'
        };
        this.syncWithStore = this.syncWithStore.bind(this);
    }
    render() {
        const Component = this.props.render;
        return (React.createElement(Component, { recordKey: this.state.recordKey, record: this.state.record, status: this.state.status, syncWithStore: this.syncWithStore }));
    }
    syncWithStore() {
        const { store, recordKey, resourceType } = this.props;
        this.setState({
            record: store.findRecordByKey(resourceType, recordKey),
            status: 'synced'
        });
    }
}
exports.RestfulEntry = RestfulEntry;
