import { RequestHandler, Router } from 'express';

// method to get routes, register routes

export interface ControllerDefinition {
    readonly ctrlTarget: Function;
    readonly middlewares: RequestHandler[];

    register(baseUrl: string, router: Router): void;
}
