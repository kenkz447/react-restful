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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var toPath_1 = __importDefault(require("lodash/toPath"));
var lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
var isInteger = function (obj) {
    return String(Math.floor(Number(obj))) === obj;
};
var getIn = function (obj, key, def, p) {
    if (p === void 0) { p = 0; }
    var path = toPath_1.default(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
    }
    return obj === undefined ? def : obj;
};
var SchemaError = /** @class */ (function (_super) {
    __extends(SchemaError, _super);
    function SchemaError(props) {
        var _this = this;
        var message = props.message, errors = props.errors, source = props.source;
        _this = _super.call(this, message) || this;
        _this.errors = errors;
        _this.source = source;
        return _this;
    }
    SchemaError.setIn = function (obj, path, value) {
        var res = {};
        var resVal = res;
        var i = 0;
        var pathArray = toPath_1.default(path);
        for (; i < pathArray.length - 1; i++) {
            var currentPath = pathArray[i];
            var currentObj = getIn(obj, pathArray.slice(0, i + 1));
            if (resVal[currentPath]) {
                resVal = resVal[currentPath];
            }
            else if (currentObj) {
                // tslint:disable-next-line:no-any
                resVal = resVal[currentPath] = lodash_clonedeep_1.default(currentObj);
            }
            else {
                var nextPath = pathArray[i + 1];
                resVal = resVal[currentPath] =
                    isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
            }
        }
        if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
            return obj;
        }
        if (value === undefined) {
            delete resVal[pathArray[i]];
        }
        else {
            resVal[pathArray[i]] = value;
        }
        var result = __assign({}, obj, res);
        if (i === 0 && value === undefined) {
            delete result[pathArray[i]];
        }
        return result;
    };
    SchemaError.requestValidate = function (resource, params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, error_1, validationError, errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!resource.props.bodySchema) {
                            return [2 /*return*/];
                        }
                        if (!params) {
                            throw Error('Resource bodySchema found but missing request params!');
                        }
                        body = utils_1.getParamsValue(params, 'body');
                        if (!body) {
                            throw Error('Resource bodySchema found but missing request body!');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, resource.props.bodySchema.validate(body, { abortEarly: false })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        validationError = error_1;
                        errors = SchemaError.yupToErrors(validationError);
                        throw new SchemaError({
                            message: 'SchemaError',
                            errors: errors,
                            source: validationError
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SchemaError.yupToErrors = function (yupError) {
        var e_1, _a;
        if (yupError.inner.length === 0) {
            return SchemaError.setIn({}, yupError.path, yupError.message);
        }
        var errors = {};
        try {
            for (var _b = __values(yupError.inner), _c = _b.next(); !_c.done; _c = _b.next()) {
                var err = _c.value;
                if (errors[err.path]) {
                    continue;
                }
                errors = SchemaError.setIn(errors, err.path, err.message);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return errors;
    };
    return SchemaError;
}(Error));
exports.SchemaError = SchemaError;
