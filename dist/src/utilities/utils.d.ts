import { RequestParameter } from './Fetcher';
export declare const upsertRequestParams: (params: RequestParameter[], type: "body" | "path" | "query", parameter: string, value: unknown) => RequestParameter[];
