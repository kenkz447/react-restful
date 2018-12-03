"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const toPath_1 = __importDefault(require("lodash/toPath"));
const clonedeep_1 = __importDefault(require("lodash/clonedeep"));
const isInteger = (obj) => String(Math.floor(Number(obj))) === obj;
const getIn = (obj, key, def, p = 0) => {
    const path = toPath_1.default(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
    }
    return obj === undefined ? def : obj;
};
class SchemaError extends Error {
    constructor(props) {
        const { message, errors, source } = props;
        super(message);
        this.errors = errors;
        this.source = source;
    }
    static setIn(obj, path, value) {
        const res = {};
        let resVal = res;
        let i = 0;
        let pathArray = toPath_1.default(path);
        for (; i < pathArray.length - 1; i++) {
            const currentPath = pathArray[i];
            let currentObj = getIn(obj, pathArray.slice(0, i + 1));
            if (resVal[currentPath]) {
                resVal = resVal[currentPath];
            }
            else if (currentObj) {
                // tslint:disable-next-line:no-any
                resVal = resVal[currentPath] = clonedeep_1.default(currentObj);
            }
            else {
                const nextPath = pathArray[i + 1];
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
        const result = Object.assign({}, obj, res);
        if (i === 0 && value === undefined) {
            delete result[pathArray[i]];
        }
        return result;
    }
    static requestValidate(resource, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.props.bodySchema) {
                return;
            }
            if (!params) {
                throw Error('Resource bodySchema found but missing request params!');
            }
            const body = utils_1.getParamsValue(params, 'body');
            if (!body) {
                throw Error('Resource bodySchema found but missing request body!');
            }
            try {
                yield resource.props.bodySchema.validate(body, { abortEarly: false });
            }
            catch (error) {
                const validationError = error;
                const errors = SchemaError.yupToErrors(validationError);
                throw new SchemaError({
                    message: 'SchemaError',
                    errors: errors,
                    source: validationError
                });
            }
        });
    }
}
SchemaError.yupToErrors = (yupError) => {
    if (yupError.inner.length === 0) {
        return SchemaError.setIn({}, yupError.path, yupError.message);
    }
    let errors = {};
    for (const err of yupError.inner) {
        if (errors[err.path]) {
            continue;
        }
        errors = SchemaError.setIn(errors, err.path, err.message);
    }
    return errors;
};
exports.SchemaError = SchemaError;
