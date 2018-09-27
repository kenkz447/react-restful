# react-restful
Another liblary for restful resources management for React app.

[![NPM](https://nodei.co/npm/react-restful.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-restful/)

[![Build Status](https://travis-ci.org/kenkz447/react-restful.svg?branch=master)](https://travis-ci.org/kenkz447/react-restful)
[![Coverage Status](https://coveralls.io/repos/github/kenkz447/react-restful/badge.svg?branch=master)](https://coveralls.io/github/kenkz447/react-restful?branch=master)

## The simplest way to use

Minimum setup (for most projects), "keep it simple stupid" is a best in development process.

### Setup

To start, you need create `restful` folder at somewhere in your project. I perfer prefer under `/src`.

````typescript
/**
 * File: /src/restful/restful-environment.ts
 */

import { setupEnvironment } from 'react-restful';

setupEnvironment({
    entry: 'http//localhost:1337',
    beforeFetch: (url: string, requestInit: RequestInit) => {
        // Inject request headers here...
        return requestInit;
    },
    afterFetch: async (response) => {
        // Side-effects here
    }
})
````
Define your first API resource, how about an appication to manage `books` in library?

````typescript
/**
 * File: /src/restful/resources/book.ts
 */ 

import {
    RecordType,
    Resource,
    ResourceType,
    getStore
} from 'react-restful';

export interface Book extends RecordType {
    id?: number;
    name: string;
    desciption?: string;
}

export const bookResources = {
    // API to get list of book
    find: new Resource<Book[]>('/book')
}
````
Export `book.ts` via `/src/restful/index.ts`, don't forget import `restful-environment.ts` at top of `/src/restful/index.ts` file.

```ts
/**
 * File: /src/restful/index.ts
 */

export * from './restful-environment.ts';
export * from './resources/user.ts';

```

### Implememnt

First, using `RestfulRender` to send GET request to get list of user,
Then passed down response data to `UserList`

````tsx
/**
 * File: /src/components/BookContainer.tsx
 */ 

import * as React from 'react';
import { RestfulRender, request } from 'react-restful';

import { bookResources } from '/src/restful';
import { BookList } from './BookList.tsx'

export class BookContainer extends React.Component {
    render() {
        return (
            <RestfulRender
                resource={bookResources.find}
            >
                {
                    ({ data }) => {
                        if (!data) {
                            return null;
                        }

                        return (<BookList books={data}/>)
                    }
                }
            </RestfulRender>
        );
    }
}
````
Component to render data:

````tsx
/**
 * File: /src/components/BookContainer.tsx
 */ 

import * as React from 'react';
import { request } from 'react-restful';

import { bookResources, Book } from '/src/restful';
import { BookItem } from './BookItem';

interface BookListProps {
    books: Book[];
}

export class BookList extends React.Component<BookListProps> {
    render() {
        const { books } = this.props;
        return (
            <ul className="booking-list">
                { 
                    books.map(book => <BookItem key={book.id} book={book}/>) 
                }
            </ul>
        );
    }
}
````

And display booking info via `BookItem`

````tsx
/**
 * File: /src/components/BookItem.tsx
 */ 

import * as React from 'react';
import { request } from 'react-restful';

import { bookResources, Book } from '/src/restful';

interface BookItemProps {
    books: Book;
}

export class BookItem extends React.Component<BookItemProps> {
    render() {
        <li className="booking-item">
            <h4>#{book.id}</h4>
        </li>
    }
}
````

End yet? not yet. You have just undergone 'R' in the CRUD definition. Look down below to see how to complete the process:

````ts
/**
 * File: /src/components/BookContainer.tsx
 */

// ...

````