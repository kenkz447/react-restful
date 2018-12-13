import { ValidationError } from 'yup';
import { Resource } from './Resource';
import { RequestParams } from './Fetcher';
import { getParamsValue } from './utils';

import toPath from 'lodash/toPath';
import cloneDeep from 'lodash/clonedeep';

interface SchemaErrorProps {
    message: string;
    errors: { [key: string]: string };
    source: ValidationError;
}

const isInteger = (obj: unknown): boolean =>
    String(Math.floor(Number(obj))) === obj;

const getIn = (obj: {}, key: string | string[], def?: unknown, p: number = 0) => {
    const path = toPath(key);

    while (obj && p < path.length) {
        obj = obj[path[p++]];
    }

    return obj === undefined ? def : obj;
};

type ErrorValue = { [key: string]: string };
export class SchemaError extends Error {
    errors: ErrorValue;
    source: ValidationError;

    static setIn(obj: ErrorValue, path: string, value: unknown) {
        const res = {};
        let resVal = res;
        let i = 0;
        let pathArray = toPath(path);

        for (; i < pathArray.length - 1; i++) {
            const currentPath = pathArray[i];
            let currentObj = getIn(obj, pathArray.slice(0, i + 1));

            if (resVal[currentPath]) {
                resVal = resVal[currentPath];
            } else if (currentObj) {
                // tslint:disable-next-line:no-any
                resVal = resVal[currentPath] = cloneDeep<any>(currentObj);
            } else {
                const nextPath: string = pathArray[i + 1];
                resVal = resVal[currentPath] =
                    isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
            }
        }

        if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
            return obj;
        }

        if (value === undefined) {
            delete resVal[pathArray[i]];
        } else {
            resVal[pathArray[i]] = value;
        }

        const result = { ...obj, ...res };

        if (i === 0 && value === undefined) {
            delete result[pathArray[i]];
        }

        return result;
    }

    static yupToErrors = (yupError: ValidationError) => {
        if (yupError.inner.length === 0) {
            return SchemaError.setIn({}, yupError.path, yupError.message);
        }

        let errors = {};
        for (const err of yupError.inner) {
            if (errors[err.path]) {
                continue;
            }

            errors = SchemaError.setIn(errors, err.path, err.message);
        }

        return errors;
    }

    static async requestValidate<T, R, M>(resource: Resource<T, R, M>, params?: RequestParams) {
        if (!resource.props.bodySchema) {
            return;
        }

        if (!params) {
            throw Error('Resource bodySchema found but missing request params!');
        }

        const body = getParamsValue<R>(params, 'body');

        if (!body) {
            throw Error('Resource bodySchema found but missing request body!');
        }

        try {
            await resource.props.bodySchema.validate(body, { abortEarly: false });
        } catch (error) {
            const validationError: ValidationError = error;
            const errors = SchemaError.yupToErrors(validationError);

            throw new SchemaError({
                message: 'SchemaError',
                errors: errors,
                source: validationError
            });
        }
    }

    constructor(props: SchemaErrorProps) {
        const { message, errors, source } = props;
        super(message);
        this.errors = errors;
        this.source = source;
    }
}