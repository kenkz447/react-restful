"use strict";
// tslint:disable:no-string-literal
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEnvironment = function (environment) {
    if (window['environment']) {
        return;
    }
    window['environment'] = environment;
};
exports.getEnvironment = function () { return window['environment']; };
