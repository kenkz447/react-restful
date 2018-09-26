import { RecordType, ResourceType } from '../utilities';
export interface User extends RecordType {
    readonly id: number;
    readonly name: string;
}
export declare const userResourceType: ResourceType<User>;
