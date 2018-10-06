import { Record, ResourceType, Resource } from '../utilities';
export interface Pet extends Record {
    readonly id: number;
    readonly name: string;
}
export declare const petResourceType: ResourceType<Pet>;
export declare const petResources: {
    create: Resource<Pet, {}>;
    update: Resource<Pet, {}>;
    findByStatus: Resource<Pet[], {}>;
    findById: Resource<Pet, {}>;
    delete: Resource<Pet, {}>;
};
