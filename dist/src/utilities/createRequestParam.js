"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestParam = function (value, type, parameter) {
    if (type === 'body') {
        return {
            type: 'body',
            value: value
        };
    }
    return {
        type: type,
        value: value,
        parameter: parameter
    };
};
