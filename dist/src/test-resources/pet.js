"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../utilities");
exports.petResourceType = new utilities_1.ResourceType('Pet');
exports.petResources = {
    create: new utilities_1.Resource({
        resourceType: exports.petResourceType,
        method: 'POST',
        url: '/pet'
    }),
    update: new utilities_1.Resource({
        resourceType: exports.petResourceType,
        method: 'PUT',
        url: '/pet'
    }),
    findByStatus: new utilities_1.Resource({
        resourceType: exports.petResourceType,
        url: '/pet/findByStatus'
    }),
    findById: new utilities_1.Resource({
        resourceType: exports.petResourceType,
        url: '/pet/:id'
    }),
    delete: new utilities_1.Resource({
        resourceType: exports.petResourceType,
        method: 'DELETE',
        url: '/pet/:id'
    }),
};
