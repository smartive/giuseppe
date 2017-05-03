import { ControllerDefinition } from '../../controller/ControllerDefinition';
import { Giuseppe } from '../../Giuseppe';
import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { RequestHandler } from 'express';

export function Controller(routePrefixOrMiddleware?: string | RequestHandler, ...middlewares: RequestHandler[]): ClassDecorator {
    const routePrefix = routePrefixOrMiddleware && typeof routePrefixOrMiddleware === 'string' ? routePrefixOrMiddleware : '';
    if (routePrefixOrMiddleware && typeof routePrefixOrMiddleware === 'function') {
        middlewares.unshift(routePrefixOrMiddleware);
    }
    return (ctrl: Function) => Giuseppe.registrar.registerController(new GiuseppeApiController(ctrl, routePrefix, middlewares));
}

export class GiuseppeApiController implements ControllerDefinition {
    constructor(
        public readonly ctrlTarget: Function,
        public readonly routePrefix: string = '',
        public readonly middlewares: RequestHandler[] = [],
    ) { }

    public createRoutes(baseUrl: string): GiuseppeRoute[] {
        /*
        Gather all routes from the controller (check if registered happens top lvl in giusi)
        create routes with corresponding route function (route interface)
          -> route function is created by route itself (param parsing and shit)
        route hash with route ID to check for duplicates
        route modificator can create multiple route ids and functions
        even a route can create multiple ids and functions
        check in express router for duplicates

        register routes within express (with ctrl middlewares)
        */
        const metadata = new ControllerMetadata(this.ctrlTarget.prototype),
            url = [baseUrl, this.routePrefix].filter(Boolean).join('/');
        let controllerRoutes: GiuseppeRoute[] = [];

        for (const route of metadata.routes()) {
            const routes = route.createRoutes(metadata, url, this.middlewares),
                mods = metadata.modificators(route.name);

            if (!mods.length) {
                controllerRoutes = controllerRoutes.concat(routes);
                continue;
            }

            let modificatedRoutes = [];
            for (const mod of mods) {
                modificatedRoutes = modificatedRoutes.concat([]);
            }
            controllerRoutes = controllerRoutes.concat(modificatedRoutes);
        }

        return controllerRoutes;
    }
}
