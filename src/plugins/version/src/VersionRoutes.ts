import { RequestHandler } from 'express';
import { GiuseppeRoute, HttpMethod } from 'giuseppe';

import { getVersionHash } from './versionHelpers';

/**
 * Router "route". Does the magic to route to the correct versioned route.
 * Contains no real (i.e. empty) route function, since the configured middleware will redirect anyway.
 */
export type VersionRouter = GiuseppeRoute & { __type: 'router' };

/**
 * Versioned giuseppe route. Contains information about "from" and "until" versions.
 *
 * @export
 * @class VersionedRoute
 * @implements {GiuseppeRoute}
 */
export class VersionedRoute implements GiuseppeRoute {
    public id: string;
    public versionId: string;
    public originalUrl: string;
    public url: string;
    public name: string;
    public method: HttpMethod;
    public function: Function;
    public middlewares: RequestHandler[];

    /**
     * Creates an instance of VersionedRoute.
     * Does basically clone the given route and adds from / until information.
     *
     * @param {GiuseppeRoute} route
     * @param {number} from
     * @param {number} until
     * @memberof VersionedRoute
     */
    constructor(route: GiuseppeRoute, public from: number, public until: number) {
        this.id = getVersionHash(route.url, from, until);
        this.versionId = `${HttpMethod[route.method]}_${route.url}`;
        this.originalUrl = route.url;
        this.url = this.id;
        this.name = route.name;
        this.method = route.method;
        this.function = route.function;
        this.middlewares = route.middlewares;
    }

    /**
     * Checks if the route is in the given version bounds.
     *
     * @param {number} requestedVersion
     * @returns {boolean}
     * @memberof VersionedRoute
     */
    public isInVersionBounds(requestedVersion: number): boolean {
        return this.from <= requestedVersion && requestedVersion <= this.until;
    }
}
