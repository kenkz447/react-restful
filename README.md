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
As backend, I have database with three tables: `Branchs`, `customers`, `Bookings`. The structure of the Customers consists of _id (I use mongodb), name, email, branchId (FK related to `Branchs` table). And customers has relationship (one-to-many) with `Bookings` table.
So i write down some API to interact with the `Customers` table:
- create: POST /customers
- update: PUT /customers
- delete: DELETE /customers
- getcustomerById: GET /customers/:customerId
- getcustomersByBranchId: GET /customers/branch/:branchId

`create`, `update`, `getcustomerById` return a customer, `delete` return `no-content`. And `getcustomersByBranchId` take a `branchId` param, `page`, `size` from query, it returns a list of customer and pagination info - include properties:
- customers
- totalItems
- currentPage
- hasMore

### client-side
First, create a `ResourceType` for these types: `customer`, `branch`, `booking`

````typescript
// file: /src/restful/resourceTypes.tsx
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
        field: 'customer',
        resourceType: 'customer'
    }]
});

export const customerResourceType = new ResourceType({
    name: 'customer',
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
````

````typescript
// file: /src/restful/resources.tsx
import { customerResourceType} from './customer'

export interface CustomerDataModel {
    _id?: number;
    name: string;
    email: string;
    branchId: number;
}

export interface GetCustomersByBranchDataModel {
    content: CustomerDataModel[];
    totalItems: number;
    currentPage: number;
}

export const customerRecources = {
    create: new Resource<CustomerDataModel>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customers',
        method: 'POST',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    update: new Resource<CustomerDataModel>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customers',
        method: 'PUT',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    delete: new Resource<CustomerDataModel>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customers',
        method: 'DELETE',
        mapDataToStore: (data, resourceType, store) => {
            store.remove(resourceType, data);
        }
    }),
    getById: new Resource<CustomerDataModel>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customers/:customerId',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    getByBranch: new new Resource<GetCustomersByBranchDataModel>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customers/branch/:branchId',
        mapDataToStore: (data, resourceType, store) => {
            for (const customer of data.content) {
                store.dataMapping(resourceType, customer);
            }
        }
    })
}
````
