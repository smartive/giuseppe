import { RequestHandler } from 'express';

export const ROUTE_DEFINITION_KEY = 'giuseppe:RouteDefintion';

export interface RouteDefinition {
    readonly route: string;
    readonly httpMethod: string;
    readonly routeFunction: Function;
    readonly name: string;
    readonly middlewares: RequestHandler[];

    routeId(): string;
    register(): any;
}
