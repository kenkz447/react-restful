"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var utilities_1 = require("../utilities");
var RestfulDataContainer = /** @class */ (function (_super) {
    __extends(RestfulDataContainer, _super);
    function RestfulDataContainer(props) {
        var _this = _super.call(this, props) || this;
        _this.isUnmounting = false;
        _this.store = global[utilities_1.storeSymbol];
        _this.onStoreEvent = function (e) {
            if (e.type === 'remove') {
                return _this.onDataRemove(e.value);
            }
            return _this.manualMapping(e);
        };
        _this.onDataRemove = function (record) {
            var resourceType = _this.props.resourceType;
            var isRecordExist = _this.isRecordExist(record);
            if (!isRecordExist) {
                return;
            }
            var deletedRecordKey = resourceType.getRecordKey(record);
            var updatedStateRecords = _this.state.dataSource.filter(function (o) {
                return resourceType.getRecordKey(o) !== deletedRecordKey;
            });
            _this.setState({
                dataSource: updatedStateRecords,
                needsUpdateSource: true
            });
        };
        _this.isRecordExist = function (record) {
            var e_1, _a;
            var resourceType = _this.props.resourceType;
            var checkingRecordKey = resourceType.getRecordKey(record);
            try {
                for (var _b = __values(_this.state.dataSource), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var stateRecord = _c.value;
                    var inStateRecordKey = resourceType.getRecordKey(stateRecord);
                    if (checkingRecordKey === inStateRecordKey) {
                        return true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return false;
        };
        _this.manualMapping = function (e) {
            var e_2, _a;
            if (_this.isUnmounting) {
                return;
            }
            var eventRecords = _this.getEventRecords(e);
            if (!eventRecords.length) {
                return;
            }
            var nextDataSource = __spread(_this.state.dataSource);
            var newRecords = [];
            try {
                for (var eventRecords_1 = __values(eventRecords), eventRecords_1_1 = eventRecords_1.next(); !eventRecords_1_1.done; eventRecords_1_1 = eventRecords_1.next()) {
                    var record = eventRecords_1_1.value;
                    var isRecordExist = _this.isRecordExist(record);
                    if (isRecordExist) {
                        nextDataSource = _this.replaceRecord(nextDataSource, record);
                        continue;
                    }
                    newRecords.push(record);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (eventRecords_1_1 && !eventRecords_1_1.done && (_a = eventRecords_1.return)) _a.call(eventRecords_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            nextDataSource = nextDataSource.concat(newRecords);
            var onNewRecordsMapping = _this.props.onNewRecordsMapping;
            if (onNewRecordsMapping && newRecords.length) {
                onNewRecordsMapping(newRecords);
            }
            _this.setState({
                needsUpdateSource: true,
                dataSource: nextDataSource
            });
        };
        _this.getEventRecords = function (e) {
            var isSingleRecord = !Array.isArray(e.value);
            if (isSingleRecord) {
                var record = e.value;
                var isRecordExisting = _this.isRecordExist(record);
                if (isRecordExisting) {
                    return [record];
                }
                var isShouldAppendNewRecord = _this.shouldAppendRecord(record);
                if (isShouldAppendNewRecord) {
                    return [record];
                }
                return [];
            }
            var records = e.value;
            return records.filter(function (o, index) {
                if (_this.isRecordExist(o)) {
                    return true;
                }
                return _this.shouldAppendRecord(o, index);
            });
        };
        _this.shouldAppendRecord = function (record, index) {
            var shouldAppendNewRecord = _this.props.shouldAppendNewRecord;
            if (!shouldAppendNewRecord) {
                return false;
            }
            if (typeof shouldAppendNewRecord === 'boolean') {
                return shouldAppendNewRecord;
            }
            return shouldAppendNewRecord(record, index || 0);
        };
        _this.replaceRecord = function (source, newRecord) {
            var resourceType = _this.props.resourceType;
            var newRecordKey = resourceType.getRecordKey(newRecord);
            return source.map(function (existRecord) {
                if (resourceType.getRecordKey(existRecord) === newRecordKey) {
                    return newRecord;
                }
                return existRecord;
            });
        };
        _this.getRenderDataSource = function () {
            var _a = _this.props, sort = _a.sort, filter = _a.filter;
            var dataSource = _this.state.dataSource;
            var renderDataSource = __spread(dataSource);
            if (filter) {
                renderDataSource = renderDataSource.filter(filter, _this);
            }
            if (sort) {
                renderDataSource = renderDataSource.sort(sort);
            }
            return renderDataSource;
        };
        var initDataSource = props.initDataSource;
        _this.state = {
            dataSource: initDataSource,
            initDataSource: initDataSource
        };
        return _this;
    }
    RestfulDataContainer.getDerivedStateFromProps = function (nextProps, currentState) {
        if (currentState.needsUpdateSource) {
            return {
                dataSource: currentState.dataSource,
                needsUpdateSource: false
            };
        }
        var enablePaginationMode = nextProps.enablePaginationMode, initDataSource = nextProps.initDataSource;
        if (enablePaginationMode) {
            if (initDataSource !== currentState.initDataSource) {
                return {
                    dataSource: initDataSource,
                    initDataSource: initDataSource
                };
            }
        }
        return null;
    };
    RestfulDataContainer.prototype.componentDidMount = function () {
        var resourceType = this.props.resourceType;
        this.unsubscribeStore = this.store.subscribe([resourceType], this.onStoreEvent);
    };
    RestfulDataContainer.prototype.componentWillUnmount = function () {
        this.isUnmounting = true;
        this.unsubscribeStore();
    };
    RestfulDataContainer.prototype.render = function () {
        var children = this.props.children;
        if (!children) {
            return null;
        }
        var dataSource = this.getRenderDataSource();
        return children(dataSource);
    };
    RestfulDataContainer.defaultProps = {
        shouldAppendNewRecord: true
    };
    return RestfulDataContainer;
}(React.PureComponent));
exports.RestfulDataContainer = RestfulDataContainer;
