import { HttpMethod } from './RouteDefinition';
import { RequestHandler } from 'express';

export interface GiuseppeRoute {
    id: string;
    url: string;
    name: string;
    method: HttpMethod;
    function: Function;
    middlewares: RequestHandler[];
}
