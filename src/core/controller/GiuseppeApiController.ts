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
        const meta = new ControllerMetadata(this.ctrlTarget.prototype),
            url = [baseUrl, this.routePrefix].filter(Boolean).join('/');

        return meta.routes().reduce((all, cur) => all.concat(cur.createRoutes(meta, url, this.middlewares)), [] as GiuseppeRoute[]);
    }
}
