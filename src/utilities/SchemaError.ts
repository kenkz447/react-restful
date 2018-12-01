import { ValidationError } from 'yup';
import { Resource } from './Resource';
import { RequestParams } from './Fetcher';
import { getParamsValue } from './utils';

interface SchemaErrorProps {
    message: string;
    errors: { [key: string]: string };
    source: ValidationError;
}

export class SchemaError extends Error {
    errors: { [key: string]: string };
    source: ValidationError;

    static async requestValidate<T>(resource: Resource<T>, params?: RequestParams) {
        if (!resource.props.bodySchema) {
            return;
        }

        if (!params) {
            throw Error('Resource bodySchema found but missing request params!');
        }

        const body = getParamsValue<T>(params, 'body');

        if (!body) {
            throw Error('Resource bodySchema found but missing request body!');
        }

        try {
            await resource.props.bodySchema.validate(body, { abortEarly: false });
        } catch (error) {
            const validationError: ValidationError = error;
            const errors = validationError.inner.reduce((errs, e) => ({ ...errs, [e.path]: e.message }), {});

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