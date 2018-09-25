import { RecordType, ResourceType } from '../utilities';
export interface User extends RecordType {
    readonly id: number;
    readonly name: string;
}

export const userResourceType = new ResourceType<User>({
    name: 'user'
});