import { ValidationError } from 'yup';
import { Resource } from './Resource';
import { RequestParams } from './Fetcher';
interface SchemaErrorProps {
    message: string;
    errors: {
        [key: string]: string;
    };
    source: ValidationError;
}
export declare class SchemaError extends Error {
    errors: {
        [key: string]: string;
    };
    source: ValidationError;
    static requestValidate<T>(resource: Resource<T>, params?: RequestParams): Promise<void>;
    constructor(props: SchemaErrorProps);
}
export {};
