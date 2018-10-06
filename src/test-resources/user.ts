import { Record, ResourceType } from '../utilities';
export interface User extends Record {
    readonly id: number;
    readonly name: string;
}

export const userResourceType = new ResourceType<User>({
    name: 'user'
});