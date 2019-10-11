import { RequestParameter } from '../core';
export declare const createRequestParam: (value: string | number | Object | null | undefined, type: "body" | "path" | "query", parameter?: string | undefined) => RequestParameter;
