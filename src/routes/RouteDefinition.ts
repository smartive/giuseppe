import { ControllerMetadata } from '../utilities/ControllerMetadata';
import { GiuseppeRoute } from './GiuseppeRoute';
import { RequestHandler } from 'express';

export const ROUTE_DEFINITION_KEY = 'giuseppe:RouteDefintion';

export enum HttpMethod {
    // Normal http methods
    get,
    put,
    post,
    delete,
    head,

    // Pathological
    connect,
    options,
    trace,

    // Webdav
    copy,
    lock,
    mkcol,
    move,
    propfind,
    proppatch,
    search,
    unlock,

    // Subversion
    report,
    mkactivity,
    checkout,
    merge,

    // UPnP
    msearch,
    notify,
    subscribe,
    unsubscribe,

    // RFC-5789
    patch,
    purge,
}

export interface RouteDefinition {
    readonly route: string;
    readonly httpMethod: HttpMethod;
    readonly routeFunction: Function;
    readonly name: string;
    readonly middlewares: RequestHandler[];

    createRoutes(meta: ControllerMetadata, baseUrl: string, middlewares: RequestHandler[]): GiuseppeRoute[];
}
