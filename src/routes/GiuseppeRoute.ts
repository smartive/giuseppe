import { HttpMethod } from './RouteDefinition';
import { RequestHandler } from 'express';

export interface GiuseppeRoute {
    readonly id: string;
    readonly name: string;
    readonly url: string;
    readonly method: HttpMethod;
    readonly function: Function;
    readonly middlewares: RequestHandler[];
}
