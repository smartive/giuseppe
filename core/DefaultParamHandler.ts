import {ParamHandler} from './ParamHandler';
import {injectable} from 'inversify';
import {Request, Response} from 'express';
import {Param} from '../params/ParamDecorators';
import {RouteRegistration} from '../routes/RouteDecorators';

@injectable()
export class DefaultParamHandler implements ParamHandler {
    public extractParam(request: Request, param: Param): any {

    }

    public parseParam(rawValue: any, param: Param): any {

    }

    public getParamValuesForRequest(route: RouteRegistration, request: Request, response: Response): any[] {
        return [];
    }


    public getParamsForRoute(target: any, routeKey: string): Param[] {
        return null;
    }
}
