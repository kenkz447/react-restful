import { ResourceType } from '../core';
export interface User {
    readonly id: number;
    readonly name: string;
}

export const userResourceType = new ResourceType<User>({
    name: 'user'
});