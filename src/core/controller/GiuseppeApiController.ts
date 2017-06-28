import 'reflect-metadata';

import { RequestHandler } from 'express';

import { ControllerDefinition } from '../../controller/ControllerDefinition';
import { Giuseppe } from '../../Giuseppe';
import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { UrlHelper } from '../../utilities/UrlHelper';

/**
 * Controller decorator. Creates a {@link GiuseppeApiController} that is registered within {@link Giuseppe}.
 * All controllers are later used to generate their routes.
 * 
 * @export
 * @param {(string | RequestHandler)} [routePrefixOrMiddleware] It's either a middleware (if no route prefix is used) or a
 *                                                              string that contains the routeprefix for this controller.
 * @param {...RequestHandler[]} middlewares The rest of the middlewares that should be called before all routes.
 * @returns {ClassDecorator}
 *
 * @example
 * // Without any params.
 * @Controller()
 * class FoobarCtrl {}
 *
 * @example
 * // With a route prefix and 1 middleware.
 * @Controller('routePrefix', (req, res, next) => next())
 * class FoobarCtrl {}
 *
 * @example
 * // Only with middlewares.
 * @Controller((req, res, next) => next(), (req, res, next) => next())
 * class FoobarCtrl {}
 */
export function Controller(
    routePrefixOrMiddleware?: string | RequestHandler,
    ...middlewares: RequestHandler[],
): ClassDecorator {
    const routePrefix = routePrefixOrMiddleware && typeof routePrefixOrMiddleware === 'string' ?
        routePrefixOrMiddleware :
        '';
    if (routePrefixOrMiddleware && typeof routePrefixOrMiddleware === 'function') {
        middlewares.unshift(routePrefixOrMiddleware);
    }
    return (ctrl: Function) => Giuseppe.registrar.registerController(
        new GiuseppeApiController(ctrl, routePrefix, middlewares),
    );
}

/**
 * Default core controller of giuseppe. Contains the routes and generates them on "configureRouter()" of giuseppe.
 * 
 * @export
 * @class GiuseppeApiController
 * @implements {ControllerDefinition}
 */
export class GiuseppeApiController implements ControllerDefinition {
    constructor(
        public readonly ctrlTarget: Function,
        public readonly routePrefix: string = '',
        public readonly middlewares: RequestHandler[] = [],
    ) { }

    public createRoutes(baseUrl: string): GiuseppeRoute[] {
        const meta = new ControllerMetadata(this.ctrlTarget.prototype);
        const url = UrlHelper.buildUrl(baseUrl, this.routePrefix);

        return meta.routes()
            .reduce((all, cur) => all.concat(cur.createRoutes(meta, url, this.middlewares)), [] as GiuseppeRoute[]);
    }
}
