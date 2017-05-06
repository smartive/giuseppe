import { GiuseppeRoute } from '../routes/GiuseppeRoute';

export class DuplicateRouteError extends Error {
    constructor(route: GiuseppeRoute) {
        super(`A route with the ID '${route.id}' (method name: '${route.name}', url: '${route.url}') is already registered.`);
    }
}
