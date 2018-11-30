import { RequestParams, RequestParameter } from './Fetcher';
export declare const upsertRequestParams: (params: RequestParameter[], type: "body" | "path" | "query", parameter: string, value: unknown) => RequestParameter[];
export declare const getParamsValue: <T>(params: RequestParams, type: "body" | "path" | "query", parameter?: string | undefined) => T | null;
