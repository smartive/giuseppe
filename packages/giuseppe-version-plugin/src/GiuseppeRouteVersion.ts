import 'reflect-metadata';

import { Giuseppe, GiuseppeRoute, RouteModificator } from 'giuseppe';
import { FunctionMethodDecorator } from 'giuseppe/core/routes/GiuseppeBaseRoute';

import { doRouteVersionsOverlap, isInvalid, isVersionedRoute, isVersionRouter } from './versionHelpers';
import { VersionInformationInvalidError } from './VersionInformationInvalidError';
import { VersionInformationMissingError } from './VersionInformationMissingError';
import { VersionedRoute, VersionRouter } from './VersionRoutes';
import { VersionsOverlapError } from './VersionsOverlapError';

/**
 * Reflect metadata key for routing versions.
 */
const VERSION_KEY = 'giuseppe:RouteVersions';

/**
 * Type that contains a hash for url <-> routes / router matching.
 * An url contains the various routes that are versioned and one router that does the magic to get to a specific route.
 */
type VersionedRoutes = {
    [url: string]: {
        router: VersionRouter,
        routes: VersionedRoute[],
    },
};

/**
 * Route modificator. Does modify the current route to react only to certain (configured) versions. If a
 * route contains this modificator, a router is injected that checks for the configured version header.
 *
 * A route version can contain a "from" version, "until" version and a configurable header name.
 *
 * If the route version cannot be parsed by the system, v1 is the default.
 * If no matching route with a given version is found, 404 is returned.
 *
 * @export
 * @param {{ from?: number, until?: number, headerName?: string }} [versionInformation={}]
 * @returns {FunctionMethodDecorator}
 */
export function Version(
    versionInformation: { from?: number, until?: number, headerName?: string } = {},
): FunctionMethodDecorator {
    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in the modificator`);
        }
        Giuseppe.registrar.registerRouteModificator(target, propertyKey, GiuseppeRouteVersion.create(
            target,
            versionInformation.from,
            versionInformation.until,
            versionInformation.headerName,
        ));
    };
}

/**
 * Route modificator class for giuseppe. Contains the definitions and ultimatively modifies the routes.
 *
 * @export
 * @class GiuseppeRouteVersion
 * @implements {RouteModificator}
 */
export class GiuseppeRouteVersion implements RouteModificator {
    constructor(
        private readonly target: Object,
        private readonly headerName: string,
        private readonly from: number,
        private readonly until: number,
    ) { }

    /**
     * Create function for a giuseppe route version. Does check for impossible combinations when creating
     * a versioned route.
     *
     * @static
     * @param {Object} target
     * @param {number} [from]
     * @param {number} [until]
     * @param {string} [headerName='Accept-Version']
     * @returns {GiuseppeRouteVersion}
     * @memberof GiuseppeRouteVersion
     * @throws {VersionInformationMissingError} Either from or until must be configured.
     * @throws {VersionInformationInvalidError} From or until must be valid (number, no floating point, bigger than 1).
     */
    public static create(
        target: Object,
        from?: number,
        until?: number,
        headerName: string = 'Accept-Version',
    ): GiuseppeRouteVersion {
        if (!(from !== undefined || until !== undefined)) {
            throw new VersionInformationMissingError(name);
        }

        if (isInvalid(from)) {
            throw new VersionInformationInvalidError(
                name,
                `The from value (${from}) is either not a number, a floating point number or less than 1`,
            );
        }

        if (isInvalid(until)) {
            throw new VersionInformationInvalidError(
                name,
                `The until value (${until}) is either not a number, a floating point number or less than 1`,
            );
        }

        if (from !== undefined &&
            until !== undefined &&
            from > until) {
            throw new VersionInformationInvalidError(
                name,
                `The from value (${from}) is greater than the until (${until})`,
            );
        }

        return new GiuseppeRouteVersion(target, headerName, from || -Infinity, until || Infinity);
    }

    /**
     * Creates the different versions for a route. Creates a list of versions for a controller and remembers them
     * by url. Creates a router that does match the parsed versions and returns them to be registered.
     * The router returns a 404 when no matching route is found.
     *
     * @param {GiuseppeRoute[]} routes
     * @returns {GiuseppeRoute[]}
     * @memberof GiuseppeRouteVersion
     * @throws {VersionsOverlapError} The versions are not allowed to overlap.
     */
    public modifyRoute(routes: GiuseppeRoute[]): GiuseppeRoute[] {
        const versionedRoutes: VersionedRoutes = Reflect.getMetadata(VERSION_KEY, this.target) || {};

        const configuredRoutes = routes.map(
            route => (isVersionRouter(route) || isVersionedRoute(route))
                ? route :
                new VersionedRoute(route, this.from, this.until),
        );

        for (const route of configuredRoutes.filter(route => isVersionedRoute(route))) {
            const versionedRoute = route as VersionedRoute;
            if (versionedRoutes[versionedRoute.versionId]) {
                if (versionedRoutes[versionedRoute.versionId].routes.some(r => doRouteVersionsOverlap(versionedRoute, r))) {
                    throw new VersionsOverlapError(versionedRoute.name);
                }
                versionedRoutes[versionedRoute.versionId].routes.push(versionedRoute);
            } else {
                versionedRoutes[versionedRoute.versionId] = {
                    routes: [versionedRoute],
                    router: {
                        __type: 'router',
                        function: () => { },
                        id: versionedRoute.versionId,
                        method: route.method,
                        middlewares: [(req, res) => {
                            const routeId = `${req.method.toLowerCase()}_${req.url.substring(1)}`;
                            const requestedVersion = parseInt((req.get(this.headerName) || '1'), 10) || 1;
                            const requestedRoute = versionedRoutes[routeId];

                            if (
                                !requestedRoute ||
                                !requestedRoute.routes.some(route => route.isInVersionBounds(requestedVersion))
                            ) {
                                return res.status(404).end();
                            }

                            res.redirect(requestedRoute.routes.find(v => v.isInVersionBounds(requestedVersion))!.url);
                        }],
                        name: route.name,
                        url: versionedRoute.originalUrl,
                    },
                };
                configuredRoutes.push(versionedRoutes[versionedRoute.versionId].router);
            }
        }

        Reflect.defineMetadata(VERSION_KEY, versionedRoutes, this.target);

        return configuredRoutes;
    }
}
