import * as yup from 'yup';
import * as fetchMock from 'jest-fetch-mock';
import { Fetcher, RequestParameter } from '../Fetcher';
import { Resource } from '../Resource';
import { Store } from '../Store';

import { userResourceType, User } from '../../test-resources';
import { SchemaError } from '../SchemaError';

describe('Fetcher', () => {
    const newUser: User = {
        id: 1,
        name: 'user01'
    };

    const mapDataToStore = jest.fn(() => void 0);

    const createUserResource = new Resource({
        resourceType: userResourceType,
        method: 'POST',
        url: '/api/users',
        mapDataToStore: mapDataToStore
    });

    const store = new Store();
    const onSchemaError = jest.fn();

    const fetcher = new Fetcher({
        store: store,
        beforeFetch: jest.fn((url: string, requestInit: RequestInit) => requestInit),
        onRequestSuccess: jest.fn(),
        onSchemaError: onSchemaError
    });

    describe('instance methods', () => {
        it('fetch resource', async () => {
            expect.assertions(3);

            const mockResponseData = newUser;
            const mockResponseDataStr = JSON.stringify(mockResponseData);
            fetchMock.mockResponseOnce(mockResponseDataStr, {
                headers: { 'content-type': 'application/json' }
            });

            const fetchBodyParam: RequestParameter = {
                type: 'body',
                value: newUser,
            };

            const fetchParams = [fetchBodyParam];
            const data = await fetcher.fetchResource(createUserResource, fetchParams);
            expect(data).toEqual(newUser);

            const requestInit = createUserResource.requestInitReslover(fetchParams);

            expect(fetcher.props.beforeFetch).toBeCalledWith(
                createUserResource.props.url,
                requestInit
            );

            expect(fetcher.props.onRequestSuccess).toBeCalled();
        });
    });

    describe('data mapping', () => {
        it('after fetch', () => {
            expect(mapDataToStore).toBeCalled();
        });
    });

    describe('validate', () => {
        const branchSchema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required()
        });

        const validateResource = new Resource({
            method: 'POST',
            url: '/api/users',
            bodySchema: yup.object().shape({
                username: yup.string().required(),
                age: yup.number().min(18),
                email: yup.string().email(),
                branch: branchSchema.required(),
                branchs: yup.array(branchSchema).required()
            })
        });

        const postBody = {
            id: 1,
            username: 'test',
            age: 11,
            email: 'abc',
            branchs: [{
                name: 10000
            }]
        };
        let schemaError: SchemaError;
        it('should catch with SchemaError instance', async () => {
            expect.assertions(3);
            try {
                await fetcher.fetchResource(validateResource, {
                    type: 'body',
                    value: postBody
                });
            } catch (error) {
                schemaError = error;
                expect(schemaError).toBeInstanceOf(SchemaError);
                expect(schemaError.source).toBeInstanceOf(yup.ValidationError);
                expect(schemaError.errors).toBeDefined();
            }
        });

        it('should calling onSchemaError', async () => {
            expect(onSchemaError).toBeCalledWith(schemaError, validateResource);
        });
    });

    describe('network error', () => {
        const fetchMethod = async () => {
            throw new Error('Fetch failed!');
        };

        it('should throw Error instance', async () => {
            const networkErrorFetcher = new Fetcher({
                store: store,
                fetchMethod: fetchMethod
            });

            expect.assertions(1);

            try {
                await networkErrorFetcher.fetchResource(createUserResource, {
                    type: 'body',
                    value: {}
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('should silent with custom error handler', async () => {
            const error = 'silent!';
            const unexpectedErrorCatched = jest.fn(() => Promise.resolve(error));

            const networkErrorFetcher = new Fetcher({
                store: store,
                fetchMethod: fetchMethod,
                onRequestError: unexpectedErrorCatched
            });

            expect.assertions(1);

            try {
                await networkErrorFetcher.fetchResource(createUserResource, {
                    type: 'body',
                    value: {}
                });
            } catch (error) {
                expect(error).toBe(error);
            }
        });
    });
});