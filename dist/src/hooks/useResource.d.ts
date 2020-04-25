import { Resource } from '../core';
export declare const useResource: <T, R = {}, M = {}>(resource: Resource<T, R, M>, params?: import("../core").RequestParameter[] | import("../core").RequestParameter | undefined, meta?: M | undefined) => {
    isLoading: boolean;
    error: undefined;
    data: R | undefined;
    sendRequest: () => void;
};
