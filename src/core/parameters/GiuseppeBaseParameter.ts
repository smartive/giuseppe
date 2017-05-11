import { ParameterParseError, ParameterValidationFailedError, RequiredParameterNotProvidedError } from '../../errors';
import { ParameterDefinition } from '../../parameter/ParameterDefinition';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';
import { Request } from 'express';

const PRIMITIVE_TYPES: Function[] = [Object, String, Array, Number, Boolean];

export abstract class GiuseppeBaseParameter implements ParameterDefinition {
    public readonly canHandleResponse: boolean = false;

    constructor(
        public readonly name: string,
        public readonly type: Function,
        public readonly index: number,
        protected readonly required?: boolean,
        protected readonly validator?: ParameterValidator,
        protected readonly factory?: ParameterFactory<any>,
    ) { }

    public getValue(request: Request): any {
        let value = this.getRawValue(request);
        value = this.parseValue(value);
        this.validateValue(value);
        return value;
    }

    protected abstract getRawValue(request: Request): any;

    protected parseValue(raw: any): any {
        if (!raw) {
            return raw;
        }

        let factory;
        if (this.factory) {
            factory = this.factory;
        } else {
            factory = rawValue => {
                const ctor = this.type as any;
                if (rawValue.constructor === ctor) {
                    return rawValue;
                } else {
                    return PRIMITIVE_TYPES.indexOf(ctor) !== -1 ? ctor(rawValue) : new ctor(rawValue);
                }
            };
        }

        try {
            return factory(raw);
        } catch (e) {
            throw new ParameterParseError(this.name, e);
        }
    }

    protected validateValue(parsed: any): void {
        if ((parsed === null || parsed === undefined) && this.required) {
            throw new RequiredParameterNotProvidedError(this.name);
        }

        if (!this.validator) {
            return;
        }
        const isValid = value => {
            const predicates = this.validator;

            if (Array.isArray(predicates)) {
                return predicates.every(p => p(value));
            }

            return predicates!(value);
        };

        if (!isValid(parsed)) {
            throw new ParameterValidationFailedError(this.name);
        }
    }
}
