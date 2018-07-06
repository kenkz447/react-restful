# react-restful
A library helps your manage data recevice from restful APIs and and render it into view.

## Concepts
- Resource: is infomation of an API contain something e.g url, method, body... and how data mapping to store.
- ResourceType: a set of `Resource` has the same data structure.
- Record: single object returned from API request, it will save in store.
- Store: where to store data from the API.
- Fetcher: send request and receive data.
- RestfulRenderer: React component acts as a bridge between React and APIs
- restfulPagination: HOC function tracking part of the data, do something when data has been changed.
- RestfulEntry: is an accurate representation of the `Record` and its state in the `Store`.

## Example

### server-side
As backend, I have database with three tables: `Branchs`, `Users`, `Bookings`. The structure of the Customers consists of _id (I use mongodb), username, email, branchId (FK related to `Branchs` table). And Users has relationship (one-to-many) with `Bookings` table.
So i write down some API to interact with the `Customers` table:
- create: POST /customers
- update: PUT /customers
- delete: DELETE /customers
- getUserById: GET /customers/:userId
- getUsersByBranchId: GET /customers/branch/:branchId

`create`, `update`, `getUserById` return a customer, `delete` return `no-content`. And `getUsersByBranchId` take a `branchId` param, `page`, `size` from query, it returns a list of user and pagination info - include properties:
- customers
- totalItems
- currentPage
- hasMore

### client-side
First, create a `ResourceType` for these types: `user`, `branch`, `booking`

````typescript
// file: /src/restful/resources.js
import { ResourceType, Resource } from 'react-restful';

export const branchResourceType = new ResourceType({
    name: 'branch',
    schema: [{
        field: '_id',
        type: 'PK'
    }]
});

export const bookingResourceType = new ResourceType({
    name: 'booking',
    schema: [{
        field: '_id',
        type: 'PK'
    }, {
        type: 'FK',
        field: 'user',
        resourceType: 'user'
    }]
});

export const customerResourceType = new ResourceType({
    name: 'user',
    schema: [{
        field: '_id',
        type: 'PK'
    }, {
        type: 'FK',
        field: 'branch',
        resourceType: branchResourceType.name
    }, {
        type: 'MANY',
        field: 'bookings',
        resourceType: bookingResourceType.name
    }]
});

export interface CustomerDataModel {
    _id?: number;
    username: string;
    email: string;
    branchId: number;
}

export interface GetCustomersByBranchDataModel {
    content: UserDataModel[];
    totalItems: number;
    currentPage: number;
}

export const userRecources = {
    create: new Resource<UserDataModel>({
        resourceType: userResourceType,
        ur: 'http://locahost:3000/api/users',
        method: 'POST',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    update: new Resource<UserDataModel>({
        resourceType: userResourceType,
        ur: 'http://locahost:3000/api/users',
        method: 'PUT',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    getById: new Resource<UserDataModel>({
        resourceType: userResourceType,
        ur: 'http://locahost:3000/api/users/:userId',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    getByBranch: new new Resource<GetCustomersByBranchDataModel>({
        resourceType: userResourceType,
        ur: 'http://locahost:3000/api/users/branch/:branchId',
        mapDataToStore: (data, resourceType, store) => {
            for (const user of data.content) {
                store.dataMapping(resourceType, user);
            }
        }
    })
}
````
