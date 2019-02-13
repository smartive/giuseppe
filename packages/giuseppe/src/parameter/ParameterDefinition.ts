import { Request, Response } from 'express';

/**
 * Reflect metadata key for parameter definitions.
 *
 * @type {string}
 */
export const PARAMETER_DEFINITION_KEY: string = 'giuseppe:ParameterDefinition';

/**
 * Parameter definition. Contains all relevant information about a registered route parameter.
 * 
 * @export
 * @interface ParameterDefinition
 */
export interface ParameterDefinition {
    /**
     * The name of the parameter.
     * 
     * @type {string}
     * @memberof ParameterDefinition
     */
    readonly name: string;

    /**
     * The type of the parameter. This can be any usable typescript type (class or primitive js type).
     * 
     * @type {Function}
     * @memberof ParameterDefinition
     */
    readonly type: Function;

    /**
     * Index that defines the position in the function. Since functions can define non injected values,
     * this index ensures the correct position in the route function.
     * 
     * @type {number}
     * @memberof ParameterDefinition
     */
    readonly index: number;

    /**
     * Defines if a parameter definition can handle the response for the user. If this value is "true", giuseppe
     * will not proceed with the return value handlers. Instead giuseppe will assume, that you handle the response
     * on your own in your route function.
     * 
     * @type {boolean}
     * @memberof ParameterDefinition
     */
    readonly canHandleResponse: boolean;

    /**
     * Get the actual value of the parameter. Extract the value from the request or the response of express.
     * (e.g. a header parameter would return the header value of the request via "return request.get(this.name)")
     * 
     * @param {Request} request 
     * @param {Response} response 
     * @returns {*} 
     * @memberof ParameterDefinition
     */
    getValue(request: Request, response: Response): any;
}
