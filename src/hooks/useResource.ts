import {
    Fetcher,
    fetcherSymbol,
    RequestParams,
    Resource
    } from '../core';
import { useState } from 'react';

export const useResource = <T, R = {}, M = {}>(resource: Resource<T, R, M>, params?: RequestParams, meta?: M) => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [data, setData] = useState<R>();

    const fetcher: Fetcher = global[fetcherSymbol];

    const sendRequest = () => {
        setLoading(true);

        fetcher.fetchResource(resource, params, meta)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    };

    return { 
        isLoading,
        error,
        data,
        sendRequest 
    };
};