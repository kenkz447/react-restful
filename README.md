# react-restful
A library helps your manage data recevice from restful APIs and and render it into view.

## Concepts
- Resource: is infomation of an API contain something e.g url, method, body... and how data mapping to store.
- ResourceType: a set of `Resource` has the same data structure.
- Record: single object returned from API request, it will save in store.
- Fetcher: send request and receive `Records`.
- Store: where to store `Records` after fetch.
- RestfulRenderer: React component acts as a bridge between React and restful APIs
- restfulPagination: HOC function tracking part of the data, do something when data has been changed.
- RestfulEntry: is an accurate representation of the `Record` and its state in the `Store`.

## Example

## Server
As backend, I have database with three tables: `Branch`, `customer`, `Booking`. The structure of the `Customer` consists of id, name, email, branch (FK related to `Branch` table). And `Customer` has relationship (one-to-many) with `Booking` table.
So i create some API to interact with the `Customer` table:
- create: POST /customer
- update: PUT /customer/:id
- delete: DELETE /customer/:id
- findOne: GET /customers/:id
- find: GET /customers

`find` return list of customer, others just return a single customer.

For more infomation about backend, you can see live demo for beckend here: https://react-restful-backend.herokuapp.com.
Also, a postman API document avaliabled here: https://github.com/kenkz447/react-restful/examples/react-restful-server/postman.postman_collection

## Client

### Setup
First, create a `ResourceType` for these types: `customer`, `branch`, `booking`

````typescript
// file: /src/restful/resourceTypes.tsx
import { ResourceType } from 'react-restful';

export const branchResourceType = new ResourceType({
    name: 'branch',
    schema: [{
        type: 'MANY',
        field: 'customers'
    }]
});

export const bookingResourceType = new ResourceType({
    name: 'booking',
    schema: [{
        type: 'FK',
        field: 'customer',
        resourceType: 'customer'
    }]
});

export const customerResourceType = new ResourceType({
    name: 'customer',
    schema: [{
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
I will show only resource for Customer:

````typescript
// file: /src/restful/customerResources.tsx
import { Resource } from 'react-restful';

import { customerResourceType} from './resourceTypes'
import { Branch } from './branchResource';
import { Booking } from './branchResource';

export interface Customer {
    id?: number;
    name: string;
    email: string;
    branch: Branch;
    bookings: Booking[];
}

export const customerRecources = {
    create: new Resource<Customer>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customer',
        method: 'POST',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    update: new Resource<Customer>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customer/:id',
        method: 'PUT',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    delete: new Resource<Customer>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customer/:id',
        method: 'DELETE',
        mapDataToStore: (data, resourceType, store) => {
            store.remove(resourceType, data);
        }
    }),
    findOne: new Resource<Customer>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customer/:id',
        mapDataToStore: (data, resourceType, store) => {
            store.dataMapping(resourceType, data);
        }
    }),
    find: new new Resource<Customer[]>({
        resourceType: customerResourceType,
        ur: 'http://locahost:3000/api/customer',
        mapDataToStore: (customers, resourceType, store) => {
            for (const customer of customers) {
                store.dataMapping(resourceType, customer);
            }
        }
    })
}
````

Ok, let definition `store`

````typescript
// file: /src/restful/store.tsx

import { Store } from 'react-restful';

import { 
    branchResourceType, 
    customerResourceType, 
    bookingResourceTypes 
} from './resourceTypes';

const store =  new Store();

store.registerRecordType(branchResourceType);
store.registerRecordType(customerResourceType);
store.registerRecordType(bookingResourceTypes);

export {
    store
}
````

extends the original Fetcher to modify request

````typescript
// file: /src/restful/fetcher.tsx
import { Fetcher as OriginFetcher } from 'react-restful';

export class Fetcher extends OriginFetcher {
    getJWT() {
        return 'your jwt...';
    }

    fetch(url: string, requestInit: RequestInit) {
        const jwt = this.getJWT();
        if(requestInit.headers instanceof Headers) {
            requestInit.headers.set('Authorization', `Bearer ${jwt}`);
        }
        return fetch(url, requestInit);
    }
}
````

the last step of the setup process.

````typescript
// file: /src/restful/index.tsx
export * from './store';
export * from './resourceTypes';
export * from './customerResources';
````

### Use

We build a Page to show list of our customers:

First, `CustomerItem` component to display customer details

````tsx
// file: /src/components/CustomerItem.tsx
import * as React from 'react';

import { RestfulEntryRenderProps } from 'react-restful';
import { Customer } from '../restful';

export class CustomerItem extends React.Component<
    RestfulEntryRenderProps<Customer>> {

    render() {
        const { record } = this.props;
        return (
            <div className="Customer-item">
                {record.name}
            </div>
        )
    }
}
````

`CustomerList` with HOC

````tsx
// file: /src/components/CustomerList.tsx
import * as React from 'react';
import { restfulPagination } from 'react-restful';

import { CustomerResourceType, store, Customer } from '../restful';
import { CustomerItem } from './CustomerItem';


function CustomerListComponent(props) {
    return props.data.map(o => {
        return (
            <RestfulEntry<Customer>
                key={o.id}
                store={store}
                recordKey={o.id}
                resourceType={CustomerResourceType}
                render={CustomerItem}
            />
        );
    });
}

export const CustomerList = restfulPagination({
    resourceType: CustomerResourceType,
    store: store
})(CustomerListComponent)
````

and the Page

````tsx
// file: /src/components/CustomerItem.tsx
import * as React from 'react';

import { RestfulRenderer } from 'react-restful';
import { store, Customer, customerResources } from '../restful';
import { CustomerList } from './CustomerList';

export class CustomerItem extends React.Component {
    render() {
        return (
            <RestfulRenderer
                store={store}
                resource={customerResources.find}
                parameters={[]}
                render={(renderProps) => {
                    const { error, data } = renderProps;
                    if(error) {
                        return <div>{error.message}</div>
                    } 
                    else if (data) {
                        return <CustomerList data={data}/>;
                    }
                    return 'loading...';
                }}
            />
        )
    }
}
````

checkout demo here: https://react-restful-client.herokuapp.com