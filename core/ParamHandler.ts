import {Request, Response} from 'express';
import {Param} from '../params/ParamDecorators';

/**
 * TODO
 */
export interface ParamHandler {
    /**
     * TODO
     *
     * @param request
     * @param param
     */
    extractParam(request: Request, param: Param): any;

    /**
     * TODO
     *
     * @param rawValue
     * @param param
     */
    parseParam(rawValue: any, param: Param): any;

    /**
     * TODO
     *
     * @param params
     * @param request
     * @param response
     */
    getParamValuesForRequest(params: Param[], request: Request, response: Response): any[];

    /**
     * TODO
     *
     * @param target
     * @param routeKey
     */
    getParamsForRoute(target: any, routeKey: string): Param[];
}

/**
 *
 * @type {Symbol}
 */
export const PARAMHANDLER_SYMBOL = Symbol('ParamHandler');
