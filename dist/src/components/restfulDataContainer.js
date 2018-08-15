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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
function restfulDataContainer(restfulDataContainerProps) {
    return function (Component) {
        return /** @class */ (function (_super) {
            __extends(RestfulDataContainerComponent, _super);
            function RestfulDataContainerComponent(props) {
                var _this = _super.call(this, props) || this;
                _this.onDataMapping = _this.onDataMapping.bind(_this);
                var data = props.data;
                var store = restfulDataContainerProps.store, resourceType = restfulDataContainerProps.resourceType;
                _this.subscribeId = store.subscribe([resourceType], _this.onDataMapping);
                var propDataIdMap = data && data.map(function (o) { return resourceType.getRecordKey(o); });
                var mappingData = data ?
                    resourceType.getAllRecords(store, function (recordInstance) {
                        var recordInstanceKey = resourceType.getRecordKey(recordInstance);
                        return propDataIdMap.includes(recordInstanceKey);
                    }) :
                    resourceType.getAllRecords(store);
                _this.state = {
                    data: mappingData
                };
                return _this;
            }
            RestfulDataContainerComponent.prototype.componentWillUnmount = function () {
                var store = restfulDataContainerProps.store;
                store.unSubscribe(this.subscribeId);
            };
            RestfulDataContainerComponent.prototype.render = function () {
                var mapToProps = restfulDataContainerProps.mapToProps;
                return (React.createElement(Component, __assign({}, this.props, mapToProps(this.state.data, this.props))));
            };
            RestfulDataContainerComponent.prototype.checkRecordExistInState = function (record) {
                var e_1, _a;
                var resourceType = restfulDataContainerProps.resourceType;
                var checkingRecordKey = resourceType.getRecordKey(record);
                try {
                    for (var _b = __values(this.state.data), _c = _b.next(); !_c.done; _c = _b.next()) {
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
            RestfulDataContainerComponent.prototype.onDataMapping = function (e) {
                var _this = this;
                var store = restfulDataContainerProps.store, resourceType = restfulDataContainerProps.resourceType;
                var isRecordExit = this.checkRecordExistInState(e.record);
                switch (e.type) {
                    case 'mapping':
                        if (this.props.data === undefined) {
                            var eventRecordKey_1 = resourceType.getRecordKey(e.record);
                            var existingRecordIndex = this.state.data.findIndex(function (o) {
                                return eventRecordKey_1 === resourceType.getRecordKey(o);
                            });
                            if (existingRecordIndex >= 0) {
                                var newStateData_1 = __spread(this.state.data);
                                newStateData_1[existingRecordIndex] = e.record;
                                if (this.mappingTimeout) {
                                    clearTimeout(this.mappingTimeout);
                                }
                                this.mappingTimeout = setTimeout(function () {
                                    var dataIds = newStateData_1.map(function (o) { return resourceType.getRecordKey(o); });
                                    var data = resourceType.getAllRecords(store, function (o) {
                                        return dataIds.includes(resourceType.getRecordKey(o));
                                    });
                                    _this.setState(__assign({}, _this.state, { data: data }));
                                    // tslint:disable-next-line:align
                                }, 100);
                            }
                            else {
                                this.setState(__assign({}, this.state, { data: __spread(this.state.data, [e.record]) }));
                            }
                        }
                        break;
                    case 'remove':
                        if (isRecordExit) {
                            var deletedRecordKey_1 = resourceType.getRecordKey(e.record);
                            var updatedStateRecords = this.state.data.filter(function (o) {
                                return resourceType.getRecordKey(o) !== deletedRecordKey_1;
                            });
                            this.setState(__assign({}, this.state, { data: updatedStateRecords }));
                        }
                        break;
                    default:
                        break;
                }
            };
            return RestfulDataContainerComponent;
        }(React.PureComponent));
    };
}
exports.restfulDataContainer = restfulDataContainer;
