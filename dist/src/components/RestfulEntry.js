"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var RestfulEntry = /** @class */ (function (_super) {
    __extends(RestfulEntry, _super);
    function RestfulEntry(props) {
        var _this = _super.call(this, props) || this;
        var _a = _this.props, store = _a.store, recordKey = _a.recordKey, resourceType = _a.resourceType;
        store.subscribe([resourceType], function (e) {
            if (resourceType.getRecordKey(e.record) === recordKey) {
                switch (e.type) {
                    case 'mapping':
                        if (_this.props.autoSyncWithStore) {
                            _this.setState({ record: e.record });
                        }
                        else {
                            _this.setState({ status: 'outdate' });
                        }
                        break;
                    case 'remove':
                        _this.setState({ status: 'deleted' });
                        break;
                    default:
                        break;
                }
            }
        });
        _this.state = {
            recordKey: recordKey,
            record: store.findRecordByKey(resourceType, recordKey),
            status: 'synced'
        };
        _this.syncWithStore = _this.syncWithStore.bind(_this);
        return _this;
    }
    RestfulEntry.prototype.render = function () {
        var Component = this.props.render;
        return (React.createElement(Component, { recordKey: this.state.recordKey, record: this.state.record, status: this.state.status, syncWithStore: this.syncWithStore }));
    };
    RestfulEntry.prototype.syncWithStore = function () {
        var _a = this.props, store = _a.store, recordKey = _a.recordKey, resourceType = _a.resourceType;
        this.setState({
            record: store.findRecordByKey(resourceType, recordKey),
            status: 'synced'
        });
    };
    return RestfulEntry;
}(React.Component));
exports.RestfulEntry = RestfulEntry;
