import {Request, Response} from 'express';
import {Param} from '../params/ParamDecorators';
import {RouteRegistration} from '../routes/RouteDecorators';

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
     * @param route
     * @param request
     * @param response
     */
    getParamValuesForRequest(route: RouteRegistration, request: Request, response: Response): any[];

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
