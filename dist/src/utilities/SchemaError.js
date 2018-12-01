"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class SchemaError extends Error {
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
                const errors = validationError.inner.reduce((errs, e) => (Object.assign({}, errs, { [e.path]: e.message })), {});
                throw new SchemaError({
                    message: 'SchemaError',
                    errors: errors,
                    source: validationError
                });
            }
        });
    }
    constructor(props) {
        const { message, errors, source } = props;
        super(message);
        this.errors = errors;
        this.source = source;
    }
}
exports.SchemaError = SchemaError;
