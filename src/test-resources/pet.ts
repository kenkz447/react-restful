import { Record, ResourceType, Resource } from '../core';

export interface Pet extends Record {
    readonly id: number;
    readonly name: string;
}

export const petResourceType = new ResourceType<Pet>('Pet');

export const petResources = {
    create: new Resource<Pet>({
        resourceType: petResourceType,
        method: 'POST',
        url: '/pet'
    }),
    update: new Resource<Pet>({
        resourceType: petResourceType,
        method: 'PUT',
        url: '/pet'
    }),
    findByStatus: new Resource<Pet, Pet[]>({
        resourceType: petResourceType,
        url: '/pet/findByStatus'
    }),
    findById: new Resource<Pet>({
        resourceType: petResourceType,
        url: '/pet/:id'
    }),
    delete: new Resource<Pet>({
        resourceType: petResourceType,
        method: 'DELETE',
        url: '/pet/:id'
    }),
};