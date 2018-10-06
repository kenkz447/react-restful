import { Record, ResourceType } from '../utilities';
export interface User extends Record {
    readonly id: number;
    readonly name: string;
}
export declare const userResourceType: ResourceType<User>;
