import {ParamRegistration} from '../models/ParamRegistration';
import {Request, Response} from 'express';

/**
 * Parameterhandler that is responsible for extracting and parsing of the parameters.
 */
export interface ParamHandler {
    /**
     * Extracts the desired parameter value from the request.
     *
     * @param {Request} request - An expressJS request object.
     * @param {Param} param - The parameter which should be extracted. 
     * @returns {any} - The value of the parameter (part). 
     */
    extractParam(request: Request, param: ParamRegistration): any;

    /**
     * Parses the raw value of a param to its type.
     * If the parameter is not parsable an exception is thrown.
     *
     * @param {any} rawValue - The raw value of the parameter that is delivered from extractParam.
     * @param {Param} param - The parameter information.
     * @returns {any} - The parsed parametervalue.
     */
    parseParam(rawValue: any, param: ParamRegistration): any;

    /**
     * Returns the values for the requested parameters.
     *
     * @param {Param[]} params - A list of parameters that should be extracted and returned.
     * @param {Request} request - An expressJS request object.
     * @param {Response} response - An expressJS response object.
     * @returns {any[]} - The parameter values.
     */
    getParamValuesForRequest(params: ParamRegistration[], request: Request, response: Response): any[];

    /**
     * Returns all registered parameters for a route. 
     *
     * @param {any} target - The routehandler (actually a function).
     * @param {string} routeKey - Route identifier.
     * @returns {Param[]} - A list of parameters for the route.
     */
    getParamsForRoute(target: any, routeKey: string): ParamRegistration[];
}

/**
 * IoC symbol for the parameter handler interface.
 *
 * @type {Symbol}
 */
export const PARAMHANDLER_SYMBOL = Symbol('ParamHandler');
