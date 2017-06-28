import { GiuseppeRoute } from '../routes/GiuseppeRoute';

/**
 * Error that is thrown, when a route id is duplicated. Default core route ids are: HttpMethod_routeUrl.
 * 
 * @export
 * @class DuplicateRouteError
 * @extends {Error}
 */
export class DuplicateRouteError extends Error {
    constructor(route: GiuseppeRoute) {
        super(
            `A route with the ID '${route.id}' (method name: '${route.name}', url: '${route.url}') is already registered.`,
        );
    }
}
