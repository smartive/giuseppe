import { HttpMethod } from './RouteDefinition';
import { RequestHandler } from 'express';

export interface GiuseppeRoute {
    id: string;
    url: string;
    readonly name: string;
    readonly method: HttpMethod;
    readonly function: Function;
    readonly middlewares: RequestHandler[];
}
