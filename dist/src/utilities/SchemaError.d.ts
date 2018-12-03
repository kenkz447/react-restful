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
declare type ErrorValue = {
    [key: string]: string;
};
export declare class SchemaError extends Error {
    errors: ErrorValue;
    source: ValidationError;
    static setIn(obj: ErrorValue, path: string, value: unknown): ErrorValue;
    static yupToErrors: (yupError: ValidationError) => ErrorValue;
    static requestValidate<T>(resource: Resource<T>, params?: RequestParams): Promise<void>;
    constructor(props: SchemaErrorProps);
}
export {};
