import { GiuseppeRoute } from '../routes/GiuseppeRoute';
import { RequestHandler } from 'express';

export interface ControllerDefinition {
    readonly ctrlTarget: Function;
    readonly middlewares: RequestHandler[];

    createRoutes(baseUrl: string): GiuseppeRoute[];
}
