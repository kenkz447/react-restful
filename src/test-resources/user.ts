import { ResourceType } from '../utilities';
export interface User {
    readonly id: number;
    readonly name: string;
}

export const userResourceType = new ResourceType<User>({
    name: 'user'
});