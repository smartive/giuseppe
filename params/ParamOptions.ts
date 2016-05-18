import {Validator} from '../validators/Validators';

/**
 * Type for the parameter factory function.
 */
export type ParameterFactory<T> = (raw: any) => T;

/**
 * Interface for parameter options. Contains optional settings for each parameter that accepts this interface.
 */
export interface ParamOptions {
    /**
     * Defines if the parameter is set as required.
     */
    required?: boolean;

    /**
     * Adds one or more validator(s) to the parameter.
     */
    validator?: Validator|Validator[];

    /**
     * Defines the factory function for the parameter.
     */
    factory?: ParameterFactory<any>;
}

/**
 * Interface for query parameter options. Contains basic parameter options and specific options for '@Query' parameters.
 */
export interface QueryParamOptions extends ParamOptions {
    /**
     * One or multiple alias(es) for the query parameter (e.g. limit can be aliased with 'l').
     * If multiple aliases are hit, the first one is returned.
     */
    alias?: string|string[];
}
