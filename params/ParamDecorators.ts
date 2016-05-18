import 'reflect-metadata';
import {ParamOptions, QueryParamOptions, BodyParamOptions} from './ParamOptions';

/**
 * Reflect metadata key for parameter list.
 * @type {string}
 */
export const PARAMS_KEY = 'params';

/**
 * Enum for parameter type.
 */
export enum ParamType {
    Url,
    Query,
    Body,
    Request,
    Response,
    Header
}

/**
 * Parameter class. Contains all crucial information for the instantiation of the parameters for the runtime.
 *
 * @class
 */
export class Param {
    constructor(public paramType: ParamType, public name: string, public type: Function, public index: number, public options?: ParamOptions) {
    }
}

function param(type: ParamType, name: string, options?: ParamOptions) {
    return (target: Object, propertyKey: string, parameterIndex: number) => {
        let paramtypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        let params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, target, propertyKey) || [];

        params.push(new Param(type, name, paramtypes[parameterIndex], parameterIndex, options));

        Reflect.defineMetadata(PARAMS_KEY, params, target, propertyKey);
    };
}

/**
 * Declares the current parameter as a query parameter. The route will provide this value from the request.query object.
 *
 * @param {string} name - the name of the parameter (inside the query object)
 * @param {QueryParamOptions} options - The specific options for this parameter.
 * @returns {(Object, string, number) => void} - Parameter decorator for the given function.
 */
export function Query(name: string, options?: QueryParamOptions) {
    return param(ParamType.Query, name, options);
}

/**
 * Declares the current parameter as an url parameter. The route will provide this value from the request.params object.
 *
 * @param {string} name - the name of the parameter (inside the params object)
 * @returns {(Object, string, number) => void} - Parameter decorator for the given function.
 */
export function UrlParam(name: string) {
    return param(ParamType.Url, name, {required: true});
}

/**
 * Declares the current parameter as a body parameter. The route will provide the request.body value.
 *
 * @param {ParamOptions} options - The specific options for this parameter.
 * @returns {(Object, string, number) => void} - Parameter decorator for the given function.
 */
export function Body(options?: BodyParamOptions) {
    return param(ParamType.Body, 'body', options);
}

/**
 * Declares the current parameter as a request parameter. The route will provide the express js request object.
 *
 * @returns {(Object, string, number) => void} - Parameter decorator for the given function.
 */
export function Req() {
    return param(ParamType.Request, 'request');
}

/**
 * Declares the current parameter as a response parameter. The route will provide the express js response object.
 *
 * @returns {(Object, string, number) => void} - Parameter decorator for the given function.
 */
export function Res() {
    return param(ParamType.Response, 'response');
}

/**
 * Declares the current parameter as a header parameter. The route will provide the corresponding http header value.
 *
 * @returns {(Object, string, number) => void} - Parameter decorator for the given function.
 */
export function Header(name: string, options?: ParamOptions) {
    return param(ParamType.Header, name, options);
}
