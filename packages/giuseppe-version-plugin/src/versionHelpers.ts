import { createHash } from 'crypto';
import { GiuseppeRoute } from 'giuseppe';

import { VersionedRoute, VersionRouter } from './VersionRoutes';

/**
 * Typeguard that checks if a given route is a version-router (i.e. a route that'll never hit it's function since
 * the middleware will route to another function).
 *
 * @export
 * @param {GiuseppeRoute} route
 * @returns {route is VersionRouter}
 */
export function isVersionRouter(route: GiuseppeRoute): route is VersionRouter {
    return route['__type'] === 'router';
}

/**
 * Typeguard that checks if a given route is a versioned route (i.e. already contains information about from and until
 * versions).
 *
 * @export
 * @param {GiuseppeRoute} route
 * @returns {route is VersionedRoute}
 */
export function isVersionedRoute(route: GiuseppeRoute): route is VersionedRoute {
    return route['from'] || route['until'];
}

/**
 * Checks if a given version number is valid.
 * A version is valid if:
 *   - It is a number
 *   - It is not floating point (e.g. 1.5)
 *   - It is bigger or equal than 1
 *
 * @export
 * @param {(number | undefined)} value
 * @returns {boolean}
 */
export function isInvalid(value: number | undefined): boolean {
    return value !== undefined && (value.constructor !== Number || value < 1 || value % 1 !== 0);
}

/**
 * Creates a unique hash for given version information. Is generally used to register the different versions of a
 * route so that no conflicts exist in express.
 *
 * @export
 * @param {string} route
 * @param {number} from
 * @param {number} until
 * @returns {string} A sha256 hash of the route information.
 */
export function getVersionHash(route: string, from: number, until: number): string {
    return createHash('sha256').update(`${route}_${from}_${until}`).digest('hex');
}

/**
 * Checks if two versioned routes do overlap.
 *
 * @export
 * @param {VersionedRoute} v1
 * @param {VersionedRoute} v2
 * @returns {boolean}
 */
export function doRouteVersionsOverlap(v1: VersionedRoute, v2: VersionedRoute): boolean {
    return v1 === v2 || (v1.until >= v2.from && v1.from <= v2.until);
}
